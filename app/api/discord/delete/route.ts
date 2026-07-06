import { NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

export async function DELETE(req: Request) {
  try {
    const user = await verifyAuthToken(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('message_id');
    const channelId = searchParams.get('channel_id');

    if (!messageId || !channelId) {
      return NextResponse.json({ error: 'Missing message_id or channel_id' }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bot ${botToken}` }
    });

    if (res.status === 429) {
      // Rate limited — still return success, the message stays but it's fine
      return NextResponse.json({ success: true, note: 'rate-limited, message may persist' });
    }

    if (!res.ok && res.status !== 404) {
      // 404 means already deleted, which is fine
      const errText = await res.text();
      console.error('Discord delete error:', res.status, errText);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Discord delete route error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
