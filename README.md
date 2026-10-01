# PortoBeb — Portofolio Nabilah Aisha Syahada

Situs portofolio pribadi satu halaman untuk **Nabilah Aisha Syahada**, lulusan D3 Keperawatan
(Polindra, IPK 3.66). Berisi rekam jejak praktik klinis, sertifikat, pendidikan, dan kontak.

Seluruh isi situs — teks, foto profil, ilustrasi hero, stiker dekoratif, dan galeri — bisa
diubah dari **halaman admin** (`/admin`) tanpa menyentuh kode. Data disimpan di Supabase.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Bahasa | TypeScript (`strict: true`) |
| Animasi | GSAP 3.15 — ScrollTrigger + ScrollToPlugin |
| Database | Supabase Postgres (`site_content`, `site_media`) |
| Penyimpanan gambar | Supabase Storage, bucket publik `portfolio` |
| Auth admin | Token statis di env + service role key (server-side only) |
| Styling | Tailwind 4 + CSS tulis-tangan (design token di `globals.css`) |
| Font | `next/font` — Fraunces, Plus Jakarta Sans, Space Mono, Caveat |

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

**Tanpa Supabase pun situs tetap jalan** — isi halaman diambil dari
`src/lib/content/defaults.ts`. Supabase hanya perlu diisi kalau kamu ingin memakai
panel admin.

## Panel admin

Buka [http://localhost:3000/admin](http://localhost:3000/admin), masukkan `ADMIN_TOKEN`.

Dua tab:

- **Konten teks** — semua teks di 9 bagian: meta/SEO, navigasi, hero, tentang saya,
  kartu kelulusan, pengalaman, sertifikat, galeri, kontak, dan footer. Termasuk
  menambah/menghapus paragraf, chip keahlian, organisasi, penempatan klinis, sertifikat,
  dan tautan kontak.
- **Foto & stiker** — unggah foto profil, ilustrasi hero, foto galeri, dan stiker
  dekoratif. Untuk stiker bisa diatur ukuran, posisi (atas/bawah/kiri/kanan),
  putaran, opasitas, dan kecepatan parallax.

Token disimpan di `sessionStorage`, jadi hilang saat tab ditutup.

## Setup Supabase

### 1. Jalankan skema

Buka **Supabase Dashboard → SQL Editor → New query**, tempel isi
[`supabase/schema.sql`](supabase/schema.sql), lalu **Run**. Sekali saja.

Skema itu membuat dua tabel (`site_content`, `site_media`), menyalakan RLS, dan
membuat bucket Storage `portfolio`.

### 2. Isi environment variable

Salin `.env.example` menjadi `.env.local`, lalu isi:

| Variabel | Wajib | Dari mana |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya | Project Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ya untuk menulis | Project Settings → API → Secret key |
| `ADMIN_TOKEN` | ya | token acak buatan sendiri |

Buat token admin yang kuat:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

> **`SUPABASE_SERVICE_ROLE_KEY` jangan pernah diberi prefix `NEXT_PUBLIC_`.**
> Kalau begitu kuncinya ikut terkirim ke browser dan siapa pun yang membaca
> sumber halaman bisa menimpa isi situs.

### 3. Pindahkan media bawaan ke database

Buka tab **Foto & stiker** lalu klik **Simpan semua ke database**. Stiker di
`public/p*.jpg` akan didaftarkan ke `site_media` dengan posisi dan kecepatan
parallax-nya, lalu situs mulai memakai URL dari Storage.

## Keamanan

- **Anon key hanya bisa membaca.** RLS di `site_content` dan `site_media` hanya
  punya policy `SELECT`. Tidak ada policy `INSERT`/`UPDATE`/`DELETE`, jadi
  anon key **ditolak** untuk menulis — RLS aktif tanpa policy menolak operasi itu.
- **Tulisan hanya lewat route admin**, yang memakai service role key
  (melewati RLS) setelah memeriksa `ADMIN_TOKEN` dengan perbandingan
  waktu-konstan (`timingSafeEqual`).
- **Token tidak pernah sampai ke server lain.** Halaman admin hanya mengirim
  header `Authorization` ke route Next.js milik sendiri; token aslinya tinggal di env.
- Route admin tidak melakukan cache (`force-dynamic`).

## Struktur

```
src/
├── app/
│   ├── layout.tsx                 Root layout — font, metadata
│   ├── page.tsx                   Server component: baca data, metadata dinamis
│   ├── _components/
│   │   └── SiteView.tsx           Client component: markup + 16 blok animasi GSAP
│   ├── admin/
│   │   ├── page.tsx               Panel admin (login token, dua tab)
│   │   ├── admin.css              Gaya panel
│   │   └── _parts/
│   │       ├── fields.tsx         Komponen form yang dipakai ulang
│   │       ├── ContentEditor.tsx  Editor seluruh teks situs
│   │       └── MediaEditor.tsx    Kelola foto, stiker, dan galeri
│   ├── api/
│   │   ├── site/route.ts          GET data publik
│   │   └── admin/
│   │       ├── session/route.ts   Validasi token (tanpa sentuh DB)
│   │       ├── content/route.ts   GET / PUT konten teks
│   │       └── media/route.ts     GET / POST / PUT / PATCH / DELETE media
│   └── globals.css                Sistem desain
├── lib/
│   ├── admin-auth.ts              Pemeriksaan ADMIN_TOKEN
│   ├── content/
│   │   ├── types.ts               Tipe SiteContent & SiteMedia
│   │   └── defaults.ts            Konten bawaan + media bawaan
│   └── supabase/server.ts         Klien Supabase (baca & tulis)
supabase/schema.sql                DDL: tabel, RLS, bucket
```

### Alur data

```
Halaman publik  →  page.tsx (server)  →  loadSiteData()  →  Supabase
                                                    ↓ gagal / kosong
                                              defaults.ts

Panel admin     →  /api/admin/*  →  cek ADMIN_TOKEN  →  service role  →  Supabase
```

`loadSiteData()` dibungkus `cache()` supaya `generateMetadata()` dan komponen
halaman memakai satu permintaan saja, dan diberi batas waktu 3 detik supaya
halaman publik tidak ikut menggantung ketika Supabase tidak bisa dijangkau.

## Script

| Script | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | TypeScript tanpa emit |

## Section

`#hero` · `#about` · `#education` · `#experience` · `#certs` · `#gallery` · `#contact`

Tracking nav aktif ada di `src/app/_components/SiteView.tsx` dan harus memuat
**id yang sama** dengan section yang ada. Menambah section baru berarti
menambahkan id-nya ke daftar itu, kalau tidak link nav-nya tidak akan pernah
mendapat gaya aktif.

## Aset

- `public/mascot.jpg` — ilustrasi maskot 3D di hero.
- `public/p1.jpg` … `p14.jpg` — stiker dekoratif semi-transparan. `data-speed`
  dibaca GSAP untuk kecepatan parallax.
- `public/foto-nabilah.jpg` — **saat ini placeholder buatan sendiri** (gradasi rose
  dengan ikon stetoskop), bukan foto asli. Ganti lewat panel admin.
- Galeri masih memakai foto stok dari Unsplash — belum dokumentasi praktik asli.
- Kartu sertifikat sengaja tidak punya tautan sampai berkas asli diunggah.

Nomor WhatsApp ada di `src/lib/content/defaults.ts` (konstanta `WHATSAPP_NUMBER`).

## Deploy

### Netlify

Hubungkan repositori ke Netlify dan gunakan build command `npm run build`.
Tambahkan ketiga variabel Supabase dan `ADMIN_TOKEN` di **Netlify → Project
configuration → Environment variables**. Jangan menaruh nilai asli di source,
`netlify.toml`, atau `.env.example`; berkas `.env.local` hanya untuk pengembangan
lokal dan sudah diabaikan oleh `.gitignore`.

`netlify.toml` mengecualikan hanya `NEXT_PUBLIC_SUPABASE_URL` dan
`NEXT_PUBLIC_SUPABASE_ANON_KEY` dari secrets scanning. Keduanya merupakan
konfigurasi publik dan dapat muncul di output Next.js. Gunakan hanya anon atau
publishable key untuk variabel publik tersebut, bukan service role atau secret
key. Secrets scanning tetap aktif untuk `ADMIN_TOKEN`,
`SUPABASE_SERVICE_ROLE_KEY`, dan nilai rahasia lainnya; jangan menonaktifkan
scanner atau mengecualikan seluruh output build.

Jika deploy masih gagal, lihat nama variabel dan lokasi berkas yang disebut
sebelum pesan `Secrets scanning found secrets in build`. Hapus kebocoran rahasia
di lokasi tersebut dan rotasi kredensial yang terekspos. Jika nilai pernah
di-commit, bersihkan juga riwayat git secara terkoordinasi sebelum redeploy.
Daftar variabel di bagian `Resolved config` saja bukan bukti kebocoran.

Tanpa `SUPABASE_SERVICE_ROLE_KEY`, situs tetap tampil tetapi panel admin tidak
bisa menyimpan. Setelah memperbarui konfigurasi, jalankan deploy ulang di Netlify.

### Vercel

Untuk deploy alternatif, jalankan `npx vercel` dan tambahkan ketiga variabel
Supabase serta `ADMIN_TOKEN` di **Vercel → Settings → Environment Variables**.

## Catatan

Proyek ini dimulai dari satu file `index.html` statis (masih tersimpan di riwayat git
sebagai commit `95d05dc`) yang kemudian dimigrasikan ke Next.js.
