import { createTask, deleteTask, getTasks, updateTask } from './sheets';
import { formatDeadlineDisplay, formatDeadlineRelative, getDaysUntilDeadline } from './date-utils';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      username?: string;
      type: string;
    };
    text?: string;
    date: number;
  };
}

function cleanString(val?: string | null): string {
  if (!val) return '';
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const token = cleanString(process.env.TELEGRAM_BOT_TOKEN);
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN is not configured');
    return { ok: false, description: 'Bot token not set' };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return { ok: false, error: String(err) };
  }
}

export function isUserAuthorized(senderId?: number | string): boolean {
  const allowed = cleanString(process.env.TELEGRAM_ALLOWED_USER_ID);
  if (!allowed) {
    // If not set yet, allow for initial setup and identification
    return true;
  }
  return String(senderId) === allowed;
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const senderId = message.from?.id || chatId;
  const rawText = message.text.trim();

  // Check authorization
  if (!isUserAuthorized(senderId)) {
    await sendTelegramMessage(
      chatId,
      `⛔ <b>Akses Ditolak</b>\nBot ini hanya untuk penggunaan pribadi.\nID Anda: <code>${senderId}</code>`
    );
    return;
  }

  const parts = rawText.split(' ');
  const command = parts[0].toLowerCase();
  const argsText = rawText.substring(command.length).trim();

  // Route commands
  if (command === '/start' || command === '/help') {
    const welcome = `
<b>📋 Task Tracker Kuliah Bot</b>

Halo! Bot ini terhubung ke Google Sheets tugas kuliah Anda.

<b>Daftar Perintah:</b>
• <code>/list</code> : Tampilkan semua tugas yang belum selesai
• <code>/tambah [Matkul] | [Tugas] | [YYYY-MM-DD] | [Keterangan]</code> : Tambah tugas baru
• <code>/selesai [No]</code> : Tandai tugas sebagai selesai
• <code>/hapus [No]</code> : Hapus tugas
• <code>/edit [No] [matkul|tugas|deadline|keterangan] [nilai baru]</code> : Ubah data tugas
• <code>/help</code> : Tampilkan bantuan ini

<b>Info Akun:</b>
Telegram Chat ID Anda: <code>${chatId}</code>
<i>(Gunakan ID ini untuk variabel <code>TELEGRAM_ALLOWED_USER_ID</code>)</i>
`.trim();
    await sendTelegramMessage(chatId, welcome);
    return;
  }

  if (command === '/list') {
    try {
      const tasks = await getTasks();
      const unfinished = tasks.filter((t) => t.status === 'Belum Selesai');

      if (unfinished.length === 0) {
        await sendTelegramMessage(
          chatId,
          '🎉 <b>Hore!</b> Tidak ada tugas yang belum selesai saat ini.'
        );
        return;
      }

      let response = `<b>📌 Daftar Tugas Belum Selesai (${unfinished.length})</b>\n\n`;

      unfinished.forEach((t) => {
        const diff = getDaysUntilDeadline(t.deadline);
        let badge = '🟢';
        if (diff < 0) badge = '🔴 [TERLEWAT]';
        else if (diff === 0) badge = '🔴 [HARI INI]';
        else if (diff <= 3) badge = '🟠 [DEADLINE DEKAT]';
        else if (diff <= 7) badge = '🟡';

        response += `${badge} <b>#${t.no} : ${escapeHtml(t.matkul)}</b>\n`;
        response += `📝 ${escapeHtml(t.tugas)}\n`;
        response += `📅 ${formatDeadlineDisplay(t.deadline)} (${formatDeadlineRelative(t.deadline)})\n`;
        if (t.keterangan) {
          response += `💬 <i>${escapeHtml(t.keterangan)}</i>\n`;
        }
        response += `──────────────────\n`;
      });

      response += `\n<i>Gunakan <code>/selesai [No]</code> untuk menyelesaikan tugas.</i>`;
      await sendTelegramMessage(chatId, response);
    } catch (err) {
      console.error(err);
      await sendTelegramMessage(chatId, '❌ Gagal mengambil daftar tugas dari Google Sheets.');
    }
    return;
  }

  if (command === '/tambah') {
    if (!argsText) {
      const guide = `
<b>Cara Tambah Tugas:</b>
Kirim dengan format pemisah pipa (<code>|</code>):
<code>/tambah [Matkul] | [Tugas] | [YYYY-MM-DD] | [Keterangan opsional]</code>

<b>Contoh:</b>
<code>/tambah Pemrograman Web | Tugas CRUD Next.js | 2026-09-30 | Kerjakan pakai Tailwind CSS</code>
`.trim();
      await sendTelegramMessage(chatId, guide);
      return;
    }

    const segments = argsText.split('|').map((s) => s.trim());
    if (segments.length < 3) {
      await sendTelegramMessage(
        chatId,
        '❌ Format tidak lengkap!\nMinimal isi: <code>/tambah Matkul | Nama Tugas | YYYY-MM-DD</code>'
      );
      return;
    }

    const [matkul, tugas, deadline, keterangan = ''] = segments;

    // Validate deadline format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(deadline) || isNaN(Date.parse(deadline))) {
      await sendTelegramMessage(
        chatId,
        '❌ Format tanggal salah!\nGunakan format <code>YYYY-MM-DD</code> (contoh: <code>2026-09-30</code>).'
      );
      return;
    }

    try {
      const created = await createTask({
        matkul,
        tugas,
        deadline,
        keterangan,
        status: 'Belum Selesai',
      });

      const reply = `
✅ <b>Tugas Berhasil Ditambahkan!</b>

<b>#${created.no} : ${escapeHtml(created.matkul)}</b>
📝 ${escapeHtml(created.tugas)}
📅 ${formatDeadlineDisplay(created.deadline)} (${formatDeadlineRelative(created.deadline)})
${created.keterangan ? `💬 <i>${escapeHtml(created.keterangan)}</i>\n` : ''}
Data tersimpan di Google Sheets.
`.trim();
      await sendTelegramMessage(chatId, reply);
    } catch (err) {
      console.error(err);
      await sendTelegramMessage(chatId, '❌ Terjadi kesalahan saat menyimpan ke Google Sheets.');
    }
    return;
  }

  if (command === '/selesai') {
    const no = parseInt(argsText, 10);
    if (isNaN(no)) {
      await sendTelegramMessage(
        chatId,
        '❌ Masukkan nomor tugas!\nContoh: <code>/selesai 1</code>'
      );
      return;
    }

    try {
      const updated = await updateTask(no, { status: 'Selesai' });
      if (!updated) {
        await sendTelegramMessage(chatId, `❌ Tugas #${no} tidak ditemukan.`);
        return;
      }

      await sendTelegramMessage(
        chatId,
        `✅ Tugas <b>#${no} (${escapeHtml(updated.matkul)})</b> ditandai <b>Selesai</b>! 🎉`
      );
    } catch (err) {
      console.error(err);
      await sendTelegramMessage(chatId, '❌ Terjadi kesalahan saat memperbarui tugas.');
    }
    return;
  }

  if (command === '/hapus') {
    const no = parseInt(argsText, 10);
    if (isNaN(no)) {
      await sendTelegramMessage(
        chatId,
        '❌ Masukkan nomor tugas!\nContoh: <code>/hapus 1</code>'
      );
      return;
    }

    try {
      const ok = await deleteTask(no);
      if (!ok) {
        await sendTelegramMessage(chatId, `❌ Tugas #${no} tidak ditemukan.`);
        return;
      }

      await sendTelegramMessage(chatId, `🗑️ Tugas <b>#${no}</b> berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      await sendTelegramMessage(chatId, '❌ Terjadi kesalahan saat menghapus tugas.');
    }
    return;
  }

  if (command === '/edit') {
    const subParts = argsText.split(' ');
    const no = parseInt(subParts[0], 10);
    const field = subParts[1]?.toLowerCase();
    const newValue = subParts.slice(2).join(' ').trim();

    const allowedFields = ['matkul', 'tugas', 'deadline', 'keterangan'];

    if (isNaN(no) || !field || !allowedFields.includes(field) || !newValue) {
      const guide = `
<b>Cara Edit Tugas:</b>
Format: <code>/edit [No] [matkul|tugas|deadline|keterangan] [nilai baru]</code>

<b>Contoh:</b>
• <code>/edit 2 deadline 2026-10-05</code>
• <code>/edit 2 tugas Laporan Praktikum Revisi</code>
• <code>/edit 2 keterangan Dosen minta diketik Times New Roman</code>
`.trim();
      await sendTelegramMessage(chatId, guide);
      return;
    }

    if (field === 'deadline') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newValue) || isNaN(Date.parse(newValue))) {
        await sendTelegramMessage(
          chatId,
          '❌ Format tanggal salah! Gunakan <code>YYYY-MM-DD</code>.'
        );
        return;
      }
    }

    try {
      const updatePayload: Record<string, string> = { [field]: newValue };
      const updated = await updateTask(no, updatePayload);

      if (!updated) {
        await sendTelegramMessage(chatId, `❌ Tugas #${no} tidak ditemukan.`);
        return;
      }

      await sendTelegramMessage(
        chatId,
        `✅ Tugas <b>#${no}</b> berhasil diubah!\n<b>${field.toUpperCase()}:</b> ${escapeHtml(newValue)}`
      );
    } catch (err) {
      console.error(err);
      await sendTelegramMessage(chatId, '❌ Terjadi kesalahan saat memperbarui tugas.');
    }
    return;
  }

  // Fallback for unrecognized command
  await sendTelegramMessage(
    chatId,
    `Perintah tidak dikenal. Kirim <code>/help</code> untuk melihat daftar perintah yang tersedia.`
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
