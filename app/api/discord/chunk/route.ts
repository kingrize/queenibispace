import { NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

export const maxDuration = 300; // Allow 5 minutes per chunk upload

export async function POST(req: Request) {
  try {
    const user = await verifyAuthToken(req);
    if (!user) return unauthorizedResponse();

    const formData = await req.formData();
    const chunkFile = formData.get('chunk') as File | null;
    const filename = formData.get('filename') as string | null;
    const category = formData.get('category') as string | null;

    if (!chunkFile || !filename) {
      return NextResponse.json({ error: 'Chunk or filename is missing' }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    let channelId = process.env.DISCORD_CHANNEL_ID;

    // Auto-detect channel
    if (category === 'video') {
      channelId = process.env.DISCORD_CHANNEL_VIDEO || channelId;
    } else if (category === 'document' || category === 'backup' || filename.toLowerCase().endsWith('.zip') || filename.toLowerCase().endsWith('.pdf') || filename.toLowerCase().endsWith('.rar')) {
      channelId = process.env.DISCORD_CHANNEL_DOC || channelId;
    }

    if (!botToken || !channelId) {
      console.error('Missing Discord credentials in environment variables.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Proxy the chunk directly to Discord via v10 API
    const discordPayload = new FormData();
    discordPayload.append('files[0]', chunkFile, filename);

    const discordResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      body: discordPayload,
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord API Error:', discordResponse.status, errorText);
      return NextResponse.json(
        { error: `Discord Upload Failed: ${discordResponse.status}` },
        { status: 502 }
      );
    }

    const discordData = await discordResponse.json();
    const attachment = discordData.attachments?.[0];

    if (!attachment) {
      return NextResponse.json({ error: 'Discord returned no attachment data' }, { status: 502 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message_id: discordData.id,
          file_id: attachment.id,
          url: attachment.url,
          filename: attachment.filename,
          size: attachment.size,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Discord Chunk API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
