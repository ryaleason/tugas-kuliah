import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_BOT_SECRET;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'TELEGRAM_BOT_TOKEN belum diset di Environment Variables.',
      },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'set';
  const customUrl = searchParams.get('url');

  if (action === 'info') {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json({
      success: true,
      action: 'getWebhookInfo',
      telegramResult: data,
    });
  }

  if (action === 'delete') {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const data = await res.json();
    return NextResponse.json({
      success: true,
      action: 'deleteWebhook',
      telegramResult: data,
    });
  }

  // Auto-detect production host
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const webhookUrl = customUrl || `${protocol}://${host}/api/telegram/webhook`;

  // Register webhook with Telegram
  const setWebhookApi = new URL(`https://api.telegram.org/bot${token}/setWebhook`);
  setWebhookApi.searchParams.set('url', webhookUrl);
  if (secret) {
    setWebhookApi.searchParams.set('secret_token', secret);
  }

  const setRes = await fetch(setWebhookApi.toString());
  const setData = await setRes.json();

  // Verify current webhook status
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoData = await infoRes.json();

  return NextResponse.json({
    success: setData.ok === true,
    message: setData.ok
      ? '🎉 Webhook Telegram BERHASIL dihubungkan ke website Vercel Anda!'
      : '❌ Gagal mendaftarkan webhook ke Telegram.',
    webhookUrl,
    secretConfigured: Boolean(secret),
    telegramResponse: setData,
    currentWebhookInfo: infoData.result,
    nextSteps: setData.ok
      ? 'Sekarang buka Telegram Anda dan kirim pesan /start atau /list-tugas ke bot.'
      : 'Pastikan bot token valid dan URL dapat diakses publik via HTTPS.',
  });
}
