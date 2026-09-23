import { NextRequest, NextResponse } from 'next/server';
import { getTasks } from '@/lib/sheets';
import { sendTelegramMessage } from '@/lib/telegram';
import { formatDeadlineDisplay, getDaysUntilDeadline } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Validate Cron authorization if CRON_SECRET is configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
    }

    const chatId =
      process.env.TELEGRAM_ALLOWED_USER_ID ||
      process.env.TELEGRAM_NOTIFICATION_CHAT_ID;

    if (!chatId) {
      return NextResponse.json({
        success: false,
        message: 'No Telegram chat ID configured for notifications (TELEGRAM_ALLOWED_USER_ID).',
      });
    }

    const tasks = await getTasks();
    // Filter tasks: 'Belum Selesai' and exactly H-4 (diff === 4)
    // We also optionally check if there are tasks overdue or today to give full awareness if needed
    const hMinus4Tasks = tasks.filter((t) => {
      if (t.status !== 'Belum Selesai') return false;
      const diff = getDaysUntilDeadline(t.deadline);
      return diff === 4;
    });

    if (hMinus4Tasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks due at H-4 today.',
        checkedCount: tasks.length,
        notifiedCount: 0,
      });
    }

    let messageText = `<b>⚠️ PENGINGAT DEADLINE H-4!</b>\n\n`;
    messageText += `Terdapat <b>${hMinus4Tasks.length} tugas</b> yang tersisa <b>4 hari lagi</b>:\n\n`;

    hMinus4Tasks.forEach((t) => {
      messageText += `📌 <b>#${t.no} : ${t.matkul}</b>\n`;
      messageText += `📝 ${t.tugas}\n`;
      messageText += `📅 Deadline: <b>${formatDeadlineDisplay(t.deadline)}</b>\n`;
      if (t.keterangan) {
        messageText += `💬 <i>${t.keterangan}</i>\n`;
      }
      messageText += `──────────────────\n`;
    });

    messageText += `\n<i>Semangat mencicil tugas! Buka web atau kirim <code>/list</code> di bot.</i>`;

    const sendRes = await sendTelegramMessage(chatId, messageText);

    return NextResponse.json({
      success: true,
      notifiedCount: hMinus4Tasks.length,
      tasks: hMinus4Tasks.map((t) => ({ no: t.no, matkul: t.matkul, deadline: t.deadline })),
      telegramResult: sendRes,
    });
  } catch (error) {
    console.error('Error running deadline check cron:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process deadline check' },
      { status: 500 }
    );
  }
}
