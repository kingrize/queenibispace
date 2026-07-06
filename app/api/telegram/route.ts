import { NextResponse } from 'next/server';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-server';

// Allow large file uploads (up to 500 MB). 
// This disables the default 4 MB body size limit for this route.
export const maxDuration = 300; // seconds (only applies on Vercel / serverless)


type TelegramTextPayload = {
  chat_id: string;
  text: string;
  parse_mode: 'Markdown';
  message_thread_id?: string;
};

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
  result?: {
    message_id: number;
    date: number;
    chat: { id: number };
    document?: { file_id: string; mime_type?: string; file_size?: number };
    audio?: { file_id: string; mime_type?: string; file_size?: number };
    video?: { file_id: string; mime_type?: string; file_size?: number };
    photo?: Array<{ file_id: string; file_size?: number }>;
  };
};

const sendTelegramFile = async (
  botToken: string,
  endpoint: 'sendPhoto' | 'sendAudio' | 'sendVideo' | 'sendDocument',
  fieldName: 'photo' | 'audio' | 'video' | 'document',
  file: File,
  chatId: string,
  message: string,
  topicId?: string
) => {
  const payload = new FormData();
  payload.append('chat_id', chatId);
  if (topicId) payload.append('message_thread_id', topicId);
  if (message && message.trim() !== '') payload.append('caption', message.trim());
  payload.append('parse_mode', 'Markdown');
  payload.append(fieldName, file);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
    method: 'POST',
    body: payload,
  });

  const data = await response.json();
  return { response, data };
};

export async function POST(req: Request) {
  try {
    const user = await verifyAuthToken(req);
    if (!user) return unauthorizedResponse();

    const formData = await req.formData();
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'auto';

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicText = process.env.TELEGRAM_TOPIC_TEXT;
    const topicImage = process.env.TELEGRAM_TOPIC_IMAGE;
    const topicDoc = process.env.TELEGRAM_TOPIC_DOC;
    const topicAudio = process.env.TELEGRAM_TOPIC_AUDIO;
    const topicVideo = process.env.TELEGRAM_TOPIC_VIDEO;

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials in environment variables.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    let telegramData: TelegramApiResponse;

    if (file) {
      const treatAsImage = category === 'image' || (category === 'auto' && file.type.startsWith('image/'));
      const treatAsAudio = category === 'audio' || (category === 'auto' && file.type.startsWith('audio/'));
      const treatAsVideo = category === 'video' || (category === 'auto' && file.type.startsWith('video/'));

      if (treatAsImage) {
        const result = await sendTelegramFile(botToken, 'sendPhoto', 'photo', file, chatId, message, topicImage);
        telegramData = result.data;
      } else if (treatAsAudio) {
        const result = await sendTelegramFile(botToken, 'sendAudio', 'audio', file, chatId, message, topicAudio);
        telegramData = result.data;
      } else if (treatAsVideo) {
        const videoResult = await sendTelegramFile(botToken, 'sendVideo', 'video', file, chatId, message, topicVideo);
        if (videoResult.data.ok) {
          telegramData = videoResult.data;
        } else {
          console.warn('sendVideo failed, falling back to sendDocument:', videoResult.data.description);
          const fallbackResult = await sendTelegramFile(botToken, 'sendDocument', 'document', file, chatId, message, topicVideo);
          telegramData = fallbackResult.data;
        }
      } else {
        const result = await sendTelegramFile(botToken, 'sendDocument', 'document', file, chatId, message, topicDoc);
        telegramData = result.data;
      }
    } else {
      if (!message || message.trim() === '') {
        return NextResponse.json({ error: 'Message or file is required' }, { status: 400 });
      }

      const textPayload: TelegramTextPayload = {
        chat_id: chatId,
        text: message.trim(),
        parse_mode: 'Markdown',
      };

      if (topicText) {
        textPayload.message_thread_id = topicText;
      }

      const telegramRawResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textPayload),
      });
      telegramData = await telegramRawResponse.json();
    }

    if (!telegramData.ok) {
      console.error('Telegram API Error:', telegramData.description);
      let errorMsg = telegramData.description || 'Failed to send data to Telegram.';
      if (errorMsg.includes('Request Entity Too Large')) {
        errorMsg = 'File terlalu besar. Telegram Bot API hanya menerima file maksimal 50 MB.';
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const msgResult = telegramData.result;
    let fileId = null;
    let fileType = null;
    let telegramFileSize = null;

    if (!msgResult) {
      return NextResponse.json({ error: 'No result from Telegram API.' }, { status: 500 });
    }

    if (msgResult.document) {
      fileId = msgResult.document.file_id;
      fileType = msgResult.document.mime_type;
      telegramFileSize = msgResult.document.file_size;
    } else if (msgResult.audio) {
      fileId = msgResult.audio.file_id;
      fileType = msgResult.audio.mime_type || 'audio/mpeg';
      telegramFileSize = msgResult.audio.file_size;
    } else if (msgResult.video) {
      fileId = msgResult.video.file_id;
      fileType = msgResult.video.mime_type || 'video/mp4';
      telegramFileSize = msgResult.video.file_size;
    } else if (msgResult.photo && msgResult.photo.length > 0) {
      const bestPhoto = msgResult.photo[msgResult.photo.length - 1];
      fileId = bestPhoto.file_id;
      fileType = 'image/jpeg';
      telegramFileSize = bestPhoto.file_size;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully.',
        data: {
          message_id: msgResult.message_id,
          chat_id: msgResult.chat.id,
          file_id: fileId,
          file_type: fileType,
          file_size: telegramFileSize,
          timestamp: msgResult.date,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
