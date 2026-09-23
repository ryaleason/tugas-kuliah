# Product Requirements Document (PRD)
## Task Tracker Kuliah — Web + Telegram Bot

| | |
|---|---|
| **Versi** | 1.0 (Draft) |
| **Tanggal** | 23 September 2026 |
| **Pemilik Produk** | Gabyrrr |
| **Status** | Draft — menunggu review |

---

## 1. Latar Belakang & Tujuan

Mahasiswa perlu cara cepat mencatat dan memantau tugas kuliah (deadline, mata kuliah, status pengerjaan) tanpa harus buka aplikasi berat atau spreadsheet manual setiap saat. Aplikasi ini dibangun sebagai **personal productivity tool** untuk satu pengguna (single-user), dengan Google Sheets sebagai database agar data tetap mudah dilihat/diedit manual kapan pun diperlukan, dan Telegram Bot agar tugas bisa dicatat secara instan dari HP tanpa buka web.

### Tujuan Produk
- Satu sumber data (Google Sheets) yang bisa diakses dan dimodifikasi dari dua antarmuka: Web dan Telegram.
- Mengurangi friksi pencatatan tugas — idealnya bisa input tugas baru dalam < 10 detik lewat Telegram.
- Memberi tampilan Web yang enak dilihat untuk melihat semua tugas, filter berdasarkan status/mata kuliah, dan highlight deadline dekat.

### Di Luar Cakupan (Out of Scope) v1.0
- Multi-user / kolaborasi / role & permission.
- Kalender sinkronisasi (Google Calendar) — kandidat v2.
- Mobile app native.

---

## 2. Target Pengguna

Satu persona: **Gabyrrr sendiri**, sebagai mahasiswa yang aktif ngoding, terbiasa pakai Telegram, dan ingin sistem task tracking yang ringan tapi personal.

---

## 3. Arsitektur Teknis (High-Level)

```
┌─────────────┐        ┌───────────────────────────┐        ┌──────────────────┐
│   Web UI    │ ───▶   │   Next.js App (Vercel)     │  ───▶  │  Google Sheets    │
│ (Next.js FE)│ ◀───   │   - Page/UI (React)        │  ◀───  │  (via Sheets API, │
└─────────────┘        │   - API Routes (/api/...)  │        │   Service Account)│
                        │   - Telegram Webhook       │        └──────────────────┘
┌─────────────┐        │     handler (/api/telegram)│
│ Telegram Bot│ ───▶   │                            │
│  (user chat)│ ◀───   └───────────────────────────┘
└─────────────┘
```

**Keputusan teknis yang sudah dikonfirmasi:**
- **Framework:** Next.js (App Router direkomendasikan untuk kombinasi Server Components + API Routes yang lebih modern).
- **Database:** Google Sheets, diakses lewat Google Sheets API v4.
- **Autentikasi ke Google Sheets:** Service Account (kredensial JSON disimpan sebagai environment variable di Vercel, tidak pernah di-commit ke repo).
- **Telegram Bot:** mode **webhook** (bukan polling), karena Vercel adalah serverless — polling terus-menerus tidak cocok untuk arsitektur ini. Webhook Telegram akan diarahkan ke endpoint `/api/telegram/webhook`.
- **Deployment:** Vercel (free tier cukup untuk kebutuhan personal & low-traffic).
- **Skala pengguna:** Single-user. Tidak perlu sistem login multi-akun; cukup proteksi sederhana (lihat bagian Keamanan).

---

## 4. Skema Data (Google Sheets)

Sheet tunggal (misal nama tab: `Tugas`) dengan kolom:

| Kolom | Tipe | Keterangan |
|---|---|---|
| No | Number | ID unik/auto-increment, dipakai sebagai primary key untuk update/delete |
| Matkul | Text | Nama mata kuliah |
| Tugas | Text | Nama/deskripsi tugas |
| Deadline | Date (format konsisten, misal `YYYY-MM-DD` atau `DD/MM/YYYY`) | Tanggal deadline |
| Keterangan Tambahan | Text | Catatan bebas (link soal, dosen, dll) |
| Status | Enum (`Belum Selesai` / `Selesai`) | Status pengerjaan |

**Catatan implementasi penting:**
- Google Sheets API tidak punya konsep "ID auto-increment" bawaan — kolom `No` akan di-generate & dikelola oleh aplikasi (baik saat create dari Web maupun dari Telegram), bukan mengandalkan nomor baris spreadsheet secara langsung (karena baris bisa berubah urutan/dihapus).
- Rate limit Google Sheets API (default: 60 request/menit/user per project) perlu diperhitungkan — untuk single-user, ini jauh dari batas, tapi tetap perlu penanganan error/retry sederhana.

---

## 5. Fitur & User Stories

### 5.1 CRUD via Web UI

| ID | User Story | Prioritas |
|---|---|---|
| WEB-1 | Sebagai pengguna, saya bisa melihat daftar semua tugas dalam bentuk tabel/list, diurutkan berdasarkan deadline terdekat. | Must |
| WEB-2 | Sebagai pengguna, saya bisa menambah tugas baru lewat form (Matkul, Tugas, Deadline, Keterangan, Status default "Belum Selesai"). | Must |
| WEB-3 | Sebagai pengguna, saya bisa mengedit tugas yang sudah ada (semua field). | Must |
| WEB-4 | Sebagai pengguna, saya bisa menghapus tugas. | Must |
| WEB-5 | Sebagai pengguna, saya bisa mengubah status tugas (toggle Belum Selesai ⇄ Selesai) dengan satu klik, tanpa buka form edit penuh. | Should |
| WEB-6 | Sebagai pengguna, saya bisa memfilter tugas berdasarkan Mata Kuliah dan/atau Status. | Should |
| WEB-7 | Sebagai pengguna, tugas dengan deadline ≤ 3 hari dari sekarang ditandai visual (misal warna merah/kuning). | Should |
| WEB-8 | Sebagai pengguna, saya bisa mencari tugas berdasarkan kata kunci (nama tugas/matkul). | Could |

### 5.2 CRUD via Telegram Bot

| ID | User Story | Prioritas |
|---|---|---|
| TG-1 | Sebagai pengguna, saya bisa kirim command `/tambah` lalu bot menuntun saya mengisi Matkul, Tugas, Deadline, Keterangan step-by-step (conversational flow). | Must |
| TG-2 | Sebagai pengguna, saya bisa kirim `/list` untuk melihat semua tugas yang belum selesai, diurutkan deadline terdekat. | Must |
| TG-3 | Sebagai pengguna, saya bisa kirim `/selesai [No]` untuk menandai tugas nomor tertentu sebagai selesai. | Must |
| TG-4 | Sebagai pengguna, saya bisa kirim `/hapus [No]` untuk menghapus tugas tertentu. | Must |
| TG-5 | Sebagai pengguna, saya bisa kirim `/edit [No]` untuk mengubah salah satu field tugas tertentu. | Should |
| TG-6 | Sebagai pengguna, saya bisa kirim `/help` untuk melihat daftar command yang tersedia. | Must |
| TG-7 | Bot merespons dengan pesan error yang jelas jika format input salah (misal format tanggal salah). | Should |

### 5.3 Sinkronisasi

| ID | User Story | Prioritas |
|---|---|---|
| SYNC-1 | Perubahan data dari Web langsung tercermin di Google Sheets, dan sebaliknya perubahan dari Telegram juga langsung tercermin — karena keduanya membaca/menulis ke sheet yang sama secara real-time (tidak ada database perantara/cache terpisah), sinkronisasi otomatis terjadi tanpa proses tambahan. | Must |
| SYNC-2 | Web UI melakukan refresh data (refetch) saat pertama kali dibuka dan setelah setiap aksi CRUD, agar selalu menampilkan data terbaru dari Sheets. | Must |

### 5.4 Notifikasi Reminder (Telegram)

| ID | User Story | Prioritas |
|---|---|---|
| NOTIF-1 | Sebagai pengguna, saya menerima notifikasi otomatis lewat Telegram ketika sebuah tugas tersisa **H-4** (4 hari) menuju deadline dan statusnya masih "Belum Selesai". | Must |
| NOTIF-2 | Sistem melakukan pengecekan terjadwal (misal 1x/hari, pagi) terhadap semua tugas di Sheets untuk menentukan mana yang jatuh pada H-4. | Must |
| NOTIF-3 | Tugas yang sudah pernah dikirim notifikasi H-4-nya tidak dikirim ulang berkali-kali di hari yang sama (idempotent). | Should |
| NOTIF-4 | Tugas berstatus "Selesai" tidak lagi dicek/di-notifikasi meskipun tanggalnya jatuh di H-4. | Must |

**Catatan implementasi:**
- Mekanisme terjadwal ini memakai **Vercel Cron Jobs** (dikonfigurasi lewat `vercel.json`) yang memanggil endpoint API Routes (misal `/api/cron/check-deadlines`) sekali sehari.
- Endpoint tersebut membaca seluruh data dari Google Sheets, menghitung selisih hari ke Deadline untuk tiap baris berstatus "Belum Selesai", lalu mengirim pesan Telegram ke `chat_id` Gabyrrr untuk tugas yang selisihnya tepat 4 hari.
- Vercel Cron pada free tier punya batasan (umumnya minimum interval 1x/hari) — cukup untuk kebutuhan ini karena granularitas notifikasi memang harian, bukan per jam.
- Endpoint cron perlu diproteksi (misal cek header secret dari Vercel Cron) agar tidak bisa dipicu sembarangan dari luar.

---

## 6. Keamanan

Karena single-user tapi endpoint web dan webhook Telegram akan publicly accessible di internet (URL Vercel bisa diakses siapa saja):

- **Web UI:** dilindungi dengan autentikasi sederhana — rekomendasi: satu halaman login dengan password (disimpan sebagai env var, di-hash), atau memakai NextAuth dengan single allowed-email jika ingin login Google. *(Perlu keputusan lebih lanjut — lihat bagian Open Questions.)*
- **Telegram Bot:** hanya menerima command dari `chat_id`/`user_id` milik Gabyrrr sendiri; command dari user lain diabaikan/direspons "unauthorized".
- **Kredensial Service Account Google:** disimpan sebagai Environment Variable terenkripsi di Vercel, tidak pernah masuk ke repository (`.gitignore` untuk file JSON kredensial).
- **Webhook Telegram:** divalidasi menggunakan secret token Telegram (`X-Telegram-Bot-Api-Secret-Token`) agar endpoint webhook tidak bisa dipanggil sembarangan oleh pihak luar.

---

## 7. Non-Functional Requirements

| Aspek | Kebutuhan |
|---|---|
| Performa | Load daftar tugas < 2 detik pada koneksi normal |
| Ketersediaan | Bergantung pada uptime Vercel (free tier) & Google Sheets API — cukup untuk personal use |
| Skalabilitas | Tidak perlu dirancang untuk >1 user pada v1.0 |
| Kompatibilitas | Web UI responsif (mobile-friendly), karena kemungkinan diakses dari HP juga |
| Observability | Logging dasar untuk error API (baik dari Web maupun Telegram) agar mudah debug |

---

## 8. Tech Stack Ringkasan

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS (untuk styling cepat) |
| Backend | Next.js API Routes |
| Database | Google Sheets (via `googleapis` npm package, Sheets API v4) |
| Bot | `node-telegram-bot-api` atau raw Telegram Bot API via `fetch`, mode webhook |
| Penjadwalan (Reminder) | Vercel Cron Jobs |
| Hosting | Vercel |
| Auth ke Google | Service Account (JSON key) |

---

## 9. Roadmap Bertahap (Saran)

1. **Fase 1 — Fondasi:** Setup Next.js project, koneksi ke Google Sheets API (read-only dulu), tampilkan data di Web.
2. **Fase 2 — CRUD Web:** Implementasi Create/Update/Delete dari Web UI.
3. **Fase 3 — Telegram Bot dasar:** Setup webhook, command `/list`, `/tambah`.
4. **Fase 4 — Telegram Bot lengkap:** Command `/selesai`, `/hapus`, `/edit`, `/help`.
5. **Fase 5 — Reminder H-4:** Setup Vercel Cron, endpoint pengecekan deadline, pengiriman notifikasi Telegram.
6. **Fase 6 — Polish:** Filter, highlight deadline, pencarian, auth Web.
7. **Fase 7 (opsional/v1.1):** Kalender sync, reminder bertingkat (H-4, H-1, H-0), dsb.

---

## 10. Open Questions (Perlu Diputuskan Sebelum/Selama Development)

1. **Autentikasi Web UI:** pakai password sederhana, atau NextAuth dengan Google login yang dibatasi ke email tertentu?
2. **Format tanggal di kolom Deadline:** `YYYY-MM-DD` (lebih mudah di-parse) atau format lokal `DD/MM/YYYY`?
3. **Jam pengiriman notifikasi H-4:** jam berapa cron job sebaiknya jalan tiap harinya (misal jam 07:00 WIB)?
4. **Struktur command Telegram:** apakah pakai conversational flow (bot bertanya satu-satu) untuk `/tambah`, atau input satu baris dengan format tertentu (misal `/tambah Matkul; Tugas; Deadline; Keterangan`)? Ini akan memengaruhi kompleksitas state management di sisi bot.

---

*Setelah open questions di atas dijawab, PRD ini bisa difinalisasi dan development bisa dimulai dari Fase 1.*
