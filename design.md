# Design Doc — Task Tracker Kuliah
### Wireframe (Sketch Style / Low-Fidelity)

> Dokumen ini berisi sketsa kasar tata letak (bukan desain visual final) untuk memandu development UI Web dan flow percakapan Telegram Bot. Style: sketch/wireframe — kotak, placeholder teks, tanpa warna/asset final.

---

## 1. Web UI

### 1.1 Halaman Utama — Daftar Tugas (`/`)

```
┌──────────────────────────────────────────────────────────┐
│  📋 Task Tracker Kuliah                    [+ Tambah]     │
├──────────────────────────────────────────────────────────┤
│  🔍 [ cari tugas...            ]  Matkul:[Semua ▾] St:[▾] │
├──────────────────────────────────────────────────────────┤
│  ⚠ DEADLINE DEKAT (≤3 hari)                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔴 Algoritma      | Tugas Besar Sorting  | 25 Sep   │  │
│  │    [ Belum Selesai ▾ ]                    [✎] [🗑]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  SEMUA TUGAS                                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ No │ Matkul     │ Tugas          │ Deadline │ Status │ │
│  ├────┼────────────┼────────────────┼──────────┼────────┤ │
│  │ 1  │ Basis Data │ ERD Toko Buku  │ 30 Sep   │ ⬜     │ │
│  │ 2  │ Algoritma  │ Tugas Sorting  │ 25 Sep   │ ⬜     │ │
│  │ 3  │ Jaringan   │ Laporan Subnet │ 20 Sep   │ ✅     │ │
│  │ .. │ ...        │ ...            │ ...      │ ...    │ │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│                                        ‹ 1 2 3 ... ›       │
└──────────────────────────────────────────────────────────┘

Catatan:
- Baris dengan deadline ≤3 hari & belum selesai → background merah muda / border merah.
- Klik ikon status (⬜/✅) = toggle cepat tanpa buka form (WEB-5).
- [✎] buka modal edit, [🗑] munculkan konfirmasi hapus.
```

### 1.2 Modal / Form Tambah & Edit Tugas

```
┌───────────────────────────────────────┐
│  Tambah Tugas Baru                 [x] │
├───────────────────────────────────────┤
│  Mata Kuliah                           │
│  [ .............................. ]    │
│                                         │
│  Nama Tugas                            │
│  [ .............................. ]    │
│                                         │
│  Deadline                              │
│  [ 📅 pilih tanggal .............. ]    │
│                                         │
│  Keterangan Tambahan (opsional)        │
│  [ .............................. ]    │
│  [ .............................. ]    │
│                                         │
│  Status                                │
│  ( • ) Belum Selesai   (  ) Selesai    │
│                                         │
│             [ Batal ]   [ Simpan ]     │
└───────────────────────────────────────┘
```

### 1.3 Halaman Login (jika auth password dipakai)

```
┌───────────────────────────────┐
│                                │
│        🔒 Task Tracker         │
│                                │
│   Password                    │
│   [ ............... ]          │
│                                │
│          [ Masuk ]            │
│                                │
└───────────────────────────────┘
```

### 1.4 Responsive Mobile (breakpoint sempit)

```
┌───────────────────┐
│ 📋 Task Tracker    │
│           [+ ]     │
├───────────────────┤
│ 🔴 Algoritma       │
│ Tugas Sorting      │
│ 25 Sep · Belum ⬜  │
│              [✎][🗑]│
├───────────────────┤
│ Basis Data         │
│ ERD Toko Buku      │
│ 30 Sep · Belum ⬜  │
│              [✎][🗑]│
└───────────────────┘

Tabel berubah jadi stacked-card list di layar sempit.
```

---

## 2. Telegram Bot — Flow Percakapan

### 2.1 `/tambah` (conversational, step-by-step)

```
User  : /tambah
Bot   : Oke, tugas baru 📝
        Mata kuliahnya apa?

User  : Basis Data
Bot   : Nama/deskripsi tugasnya?

User  : ERD Toko Buku
Bot   : Deadline-nya kapan? (format: DD-MM-YYYY)

User  : 30-09-2026
Bot   : Ada keterangan tambahan? (ketik "-" kalau tidak ada)

User  : -
Bot   : ✅ Tugas tersimpan!
        ┌─────────────────────────────┐
        │ No 4 · Basis Data           │
        │ ERD Toko Buku               │
        │ Deadline: 30 Sep 2026       │
        │ Status: Belum Selesai       │
        └─────────────────────────────┘
```

### 2.2 `/list`

```
User  : /list
Bot   : 📋 Tugas belum selesai (diurutkan deadline terdekat):

        1️⃣ [No 2] Algoritma — Tugas Sorting
           ⏰ 25 Sep (2 hari lagi)

        2️⃣ [No 4] Basis Data — ERD Toko Buku
           ⏰ 30 Sep (7 hari lagi)

        Ketik /selesai [No] untuk tandai selesai.
```

### 2.3 `/selesai`, `/hapus`, error handling

```
User  : /selesai 2
Bot   : ✅ Tugas No 2 (Tugas Sorting) ditandai Selesai!

User  : /hapus 99
Bot   : ⚠ Tugas dengan No 99 tidak ditemukan.

User  : /tambah
Bot   : Deadline-nya kapan? (format: DD-MM-YYYY)
User  : besok
Bot   : ⚠ Format tanggal tidak dikenali. Coba format DD-MM-YYYY,
        contoh: 30-09-2026
```

### 2.4 `/help`

```
User  : /help
Bot   : 🤖 Command yang tersedia:

        /tambah   — tambah tugas baru
        /list     — lihat tugas belum selesai
        /selesai [No] — tandai tugas selesai
        /hapus [No]   — hapus tugas
        /edit [No]    — ubah salah satu field tugas
        /help     — tampilkan pesan ini
```

### 2.5 Notifikasi Reminder H-4 (push, bukan hasil command)

```
Bot   : ⏰ Reminder!
        Tugas berikut deadline-nya 4 hari lagi:

        📌 [No 4] Basis Data — ERD Toko Buku
           Deadline: 30 Sep 2026

        Ketik /list untuk lihat semua tugas.
```

---

## 3. Struktur Komponen (Web — Next.js App Router, sketsa)

```
app/
├─ page.tsx                    → Halaman utama (daftar tugas)
├─ login/page.tsx               → Halaman login (jika pakai auth password)
├─ api/
│  ├─ tasks/route.ts             → GET (list), POST (create)
│  ├─ tasks/[id]/route.ts        → PUT (update), DELETE
│  ├─ telegram/webhook/route.ts  → Handler webhook Telegram
│  └─ cron/check-deadlines/route.ts → Dipanggil Vercel Cron harian

components/
├─ TaskTable.tsx                 → Tabel/list tugas (desktop)
├─ TaskCard.tsx                  → Card tugas (mobile)
├─ TaskFormModal.tsx             → Modal tambah/edit
├─ FilterBar.tsx                 → Search + filter matkul/status
└─ StatusBadge.tsx               → Badge status (⬜/✅) + warna deadline
```

---

## 4. Palet & Tipografi (sketsa, non-final)

```
Warna:
  Primary   : biru (aksi utama — tombol Simpan, Tambah)
  Danger    : merah (deadline dekat, tombol hapus)
  Success   : hijau (status Selesai)
  Neutral   : abu-abu (border, teks sekunder)

Tipografi:
  Font      : sans-serif sistem (Inter / default Tailwind)
  Judul     : bold, ukuran lebih besar
  Body      : regular
```

---

*Dokumen ini adalah wireframe low-fidelity untuk memandu implementasi — layout final bisa menyesuaikan saat development di frontend-design/Tailwind.*
