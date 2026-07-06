import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Small delay helper */
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/** In-memory URL cache: messageId -> { url, expiresAt } */
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 55 * 60 * 1000; // 55 minutes (Discord URLs expire ~1h)

function getCachedUrl(messageId: string): string | null {
  const entry = urlCache.get(messageId);
  if (entry && entry.expiresAt > Date.now()) return entry.url;
  urlCache.delete(messageId);
  return null;
}

function setCachedUrl(messageId: string, url: string) {
  urlCache.set(messageId, { url, expiresAt: Date.now() + CACHE_TTL });
}

/**
 * Refresh a Discord CDN URL by fetching the message via Bot API.
 * Includes retry logic for 429 rate limits.
 */
async function refreshChunkUrl(messageId: string, channelId: string, botToken: string): Promise<string> {
  // Check cache first
  const cached = getCachedUrl(messageId);
  if (cached) return cached;

  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      headers: { Authorization: `Bot ${botToken}` }
    });

    if (res.status === 429) {
      // Discord sends Retry-After in seconds
      const retryData = await res.json().catch(() => ({}));
      const retryAfter = (retryData.retry_after || 2) * 1000; // convert to ms
      console.warn(`Rate limited on chunk ${messageId}, retrying after ${retryAfter}ms...`);
      await delay(retryAfter + 100);
      continue;
    }

    if (!res.ok) throw new Error(`Discord refresh failed: ${res.status}`);
    const msg = await res.json();
    const attachment = msg.attachments?.[0];
    if (!attachment?.url) throw new Error('No attachment found in Discord message');
    setCachedUrl(messageId, attachment.url);
    return attachment.url;
  }
  throw new Error('Max retries exceeded for Discord API rate limit');
}

/**
 * Determine which Discord channel a file's chunks were sent to.
 */
function resolveChannelId(category: string | undefined): string {
  const defaultChannel = process.env.DISCORD_CHANNEL_ID!;
  if (category === 'video') return process.env.DISCORD_CHANNEL_VIDEO || defaultChannel;
  if (category === 'document' || category === 'backup') return process.env.DISCORD_CHANNEL_DOC || defaultChannel;
  return defaultChannel;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    const token = searchParams.get('token');
    const rangeHeader = req.headers.get('Range');

    if (!fileId) return new NextResponse('Missing fileId', { status: 400 });
    if (!token) return new NextResponse('Missing auth token', { status: 401 });

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return new NextResponse('Server misconfiguration', { status: 500 });

    // 1. Fetch file metadata from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/kiradatabase-42f3a/databases/(default)/documents/storage_files/${fileId}`;
    const firestoreRes = await fetch(firestoreUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!firestoreRes.ok) {
      const errText = await firestoreRes.text();
      console.error('Firestore error:', firestoreRes.status, errText);
      return new NextResponse(`Firestore error: ${firestoreRes.status}`, { status: firestoreRes.status });
    }

    const fields = (await firestoreRes.json()).fields;
    const totalSize = parseInt(fields.telegram_file_size?.integerValue || fields.telegram_file_size?.doubleValue?.toString() || fields.telegram_file_size?.stringValue || '0', 10);
    const fileType = fields.telegram_file_type?.stringValue || 'video/mp4';
    const category = fields.category?.stringValue;
    const originalFilename = fields.original_filename?.stringValue || 'file';

    const rawChunks = fields.discord_chunks?.arrayValue?.values || [];
    const chunks: { url: string; id: string }[] = rawChunks.map((item: any) => ({
      url: item.mapValue?.fields?.url?.stringValue || '',
      id: item.mapValue?.fields?.id?.stringValue || ''
    }));

    if (chunks.length === 0 || !totalSize) {
      return new NextResponse('Invalid file: no chunks or size', { status: 400 });
    }

    const channelId = resolveChannelId(category);

    const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB per chunk

    // 4A. No Range header → Full sequential download
    if (!rangeHeader) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for (let i = 0; i < chunks.length; i++) {
              if (i > 0) await delay(500); // Gently pace URL refreshes
              const freshUrl = await refreshChunkUrl(chunks[i].id, channelId, botToken);
              const res = await fetch(freshUrl);
              if (!res.ok || !res.body) throw new Error('Chunk fetch failed');
              const reader = res.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            }
            controller.close();
          } catch (e) {
            console.error('Full stream error:', e);
            controller.error(e);
          }
        }
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': fileType,
          'Content-Length': totalSize.toString(),
          'Content-Disposition': `inline; filename="${encodeURIComponent(originalFilename)}"`,
          'Accept-Ranges': 'bytes'
        }
      });
    }

    // 4B. Range header → Partial Content (206)
    const rangeParts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(rangeParts[0], 10);
    const end = rangeParts[1] ? parseInt(rangeParts[1], 10) : totalSize - 1;

    // Find which chunk contains the `start` byte based on strict CHUNK_SIZE
    const targetIdx = Math.floor(start / CHUNK_SIZE);
    
    if (targetIdx < 0 || targetIdx >= chunks.length) {
      return new NextResponse('Range Not Satisfiable', { status: 416 });
    }

    const chunkStartOffset = targetIdx * CHUNK_SIZE;
    const localStart = start - chunkStartOffset;

    // Refresh ONLY the required chunk URL
    const freshUrl = await refreshChunkUrl(chunks[targetIdx].id, channelId, botToken);
    
    // Get the actual size of THIS chunk
    const head = await fetch(freshUrl, { method: 'HEAD' });
    const chunkSize = parseInt(head.headers.get('content-length') || '0', 10);
    
    const localAvailable = chunkSize - localStart;
    const requestSize = end - start + 1;
    const actualLength = Math.min(requestSize, localAvailable);
    const localEnd = localStart + actualLength - 1;
    const globalEnd = start + actualLength - 1;

    const discordRes = await fetch(freshUrl, {
      headers: { Range: `bytes=${localStart}-${localEnd}` }
    });

    if (!discordRes.ok && discordRes.status !== 206) {
      return new NextResponse(`Discord fetch failed: ${discordRes.status}`, { status: 502 });
    }

    return new Response(discordRes.body, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${globalEnd}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': actualLength.toString(),
        'Content-Type': fileType
      }
    });

  } catch (error: any) {
    console.error('Stream proxy error:', error);
    return new NextResponse(`Stream Error: ${error?.message || error}`, { status: 500 });
  }
}
