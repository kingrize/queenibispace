import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return unauthorizedResponse();

  const fileId = req.nextUrl.searchParams.get('file_id');
  const filename = req.nextUrl.searchParams.get('filename') || 'file';

  if (!fileId) {
    return NextResponse.json({ error: 'file_id is required' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    // Step 1: Get the file path from Telegram
    const getFileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const getFileData = await getFileRes.json();

    if (!getFileData.ok) {
      return NextResponse.json({ error: 'Failed to get file from Telegram.' }, { status: 500 });
    }

    const filePath = getFileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    // Step 2: Proxy the actual file bytes with proper headers so images render inline
    const fileRes = await fetch(downloadUrl);
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const fileBuffer = await fileRes.arrayBuffer();

    // Determine if it's a viewable type — show inline; otherwise trigger download
    const isInline =
      contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType === 'application/pdf';
    const disposition = isInline
      ? `inline; filename="${filename}"`
      : `attachment; filename="${filename}"`;

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('getfile route error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
