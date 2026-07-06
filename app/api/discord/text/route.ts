import { NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const user = await verifyAuthToken(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const { content, title } = body as { content?: string; title?: string };

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_NOTE || process.env.DISCORD_CHANNEL_ID;

    if (!botToken || !channelId) {
      console.error('Missing Discord credentials in environment variables.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Format the message with title if provided
    const formattedMessage = title && title.trim()
      ? `**${title.trim()}**\n${content.trim()}`
      : content.trim();

    const discordResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: formattedMessage }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord API Error:', discordResponse.status, errorText);
      return NextResponse.json(
        { error: `Discord Message Failed: ${discordResponse.status}` },
        { status: 502 }
      );
    }

    const discordData = await discordResponse.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          message_id: discordData.id,
          channel_id: channelId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Discord Text API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
