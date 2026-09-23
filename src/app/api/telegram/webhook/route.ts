import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate, TelegramUpdate } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_BOT_SECRET;
    if (secret) {
      const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
      if (headerSecret !== secret) {
        console.warn('Unauthorized telegram webhook request: secret mismatch');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const update = (await req.json()) as TelegramUpdate;
    await handleTelegramUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling Telegram webhook:', err);
    // Return 200 to prevent Telegram retry storm on unhandled exceptions
    return NextResponse.json({ ok: false, error: 'Internal processing error' }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Telegram Webhook Handler',
    time: new Date().toISOString(),
  });
}
