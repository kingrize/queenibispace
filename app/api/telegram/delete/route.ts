import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

export async function DELETE(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return unauthorizedResponse();

  const messageId = req.nextUrl.searchParams.get('message_id');
  const chatId = req.nextUrl.searchParams.get('chat_id');

  if (!messageId || !chatId) {
    return NextResponse.json({ error: 'message_id and chat_id are required.' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/deleteMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: parseInt(messageId, 10),
        }),
      }
    );

    const data = await res.json();

    if (!data.ok) {
      console.error('Telegram deleteMessage error:', data.description);
      // Return success anyway if message was already deleted (error code 400)
      if (data.error_code === 400) {
        return NextResponse.json({ success: true, message: 'Already deleted from Telegram.' }, { status: 200 });
      }
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message deleted from Telegram.' }, { status: 200 });
  } catch (error) {
    console.error('Delete route error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
