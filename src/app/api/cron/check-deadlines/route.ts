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
    // Filter tasks: 'Belum Selesai' and nearing deadline: H-3, H-2, H-1 (and Hari H / H-0)
    const urgentTasks = tasks
      .filter((t) => {
        if (t.status !== 'Belum Selesai') return false;
        const diff = getDaysUntilDeadline(t.deadline);
        // Remind for H-3, H-2, H-1, and Hari H (diff: 0..3)
        return diff >= 0 && diff <= 3;
      })
      .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline));

    if (urgentTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada tugas yang mendekati deadline (H-3, H-2, H-1, Hari H) hari ini.',
        checkedCount: tasks.length,
        notifiedCount: 0,
      });
    }

    let messageText = `<b>🔔 PENGINGAT DEADLINE TUGAS KULIAH</b>\n\n`;
    messageText += `Halo! Ada <b>${urgentTasks.length} tugas</b> yang mendekati batas waktu pengumpulan:\n\n`;

    urgentTasks.forEach((t) => {
      const diff = getDaysUntilDeadline(t.deadline);
      let urgencyBadge = '';
      if (diff === 0) urgencyBadge = '🔥 <b>[DEADLINE HARI INI - H-0]</b>';
      else if (diff === 1) urgencyBadge = '🚨 <b>[BESOK - H-1]</b>';
      else if (diff === 2) urgencyBadge = '⚠️ <b>[2 HARI LAGI - H-2]</b>';
      else if (diff === 3) urgencyBadge = '⏰ <b>[3 HARI LAGI - H-3]</b>';

      messageText += `${urgencyBadge}\n`;
      messageText += `📌 <b>#${t.no} : ${t.matkul}</b>\n`;
      messageText += `📝 ${t.tugas}\n`;
      messageText += `📅 Deadline: <b>${formatDeadlineDisplay(t.deadline)}</b>\n`;
      if (t.keterangan) {
        messageText += `💬 <i>${t.keterangan}</i>\n`;
      }
      messageText += `──────────────────\n`;
    });

    const overdueCount = tasks.filter(
      (t) => t.status === 'Belum Selesai' && getDaysUntilDeadline(t.deadline) < 0
    ).length;
    if (overdueCount > 0) {
      messageText += `\n⚠️ <i>Catatan: Ada ${overdueCount} tugas yang sudah lewat batas deadline.</i>\n`;
    }

    messageText += `\n<i>Semangat mencicil tugas! Kirim <code>/list</code> atau <code>/list-tugas</code> di bot.</i>`;

    const sendRes = await sendTelegramMessage(chatId, messageText);

    return NextResponse.json({
      success: true,
      notifiedCount: urgentTasks.length,
      tasks: urgentTasks.map((t) => ({
        no: t.no,
        matkul: t.matkul,
        deadline: t.deadline,
        daysLeft: getDaysUntilDeadline(t.deadline),
      })),
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
