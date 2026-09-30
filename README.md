# PortoBeb — Portofolio Nabilah Aisha Syahada

Situs portofolio pribadi satu halaman untuk **Nabilah Aisha Syahada**, lulusan D3 Keperawatan
(Polindra, IPK 3.66). Berisi rekam jejak praktik klinis, sertifikat, pendidikan, dan kontak.

Dibangun dengan Next.js App Router + GSAP. Tidak ada backend — form kontak meneruskan
pesan ke WhatsApp.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Bahasa | TypeScript (`strict: true`) |
| Animasi | GSAP 3.15 — ScrollTrigger + ScrollToPlugin |
| Styling | CSS tulis-tangan (design token di `globals.css`) |
| Font | `next/font` — Fraunces, Plus Jakarta Sans, Space Mono, Caveat |

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Tidak ada environment variable yang wajib diisi. (`.env.local` dengan kredensial Supabase
masih ada di repo lokal dari eksperimen lama, tetapi sudah tidak dipakai kode mana pun
dan sudah di-ignore oleh git.)

## Script

| Script | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | TypeScript tanpa emit |

## Struktur

```
src/
├── app/
│   ├── layout.tsx      Root layout — font, metadata, <html lang="id">
│   ├── page.tsx        Halaman utama: markup + 16 blok animasi GSAP + form kontak
│   ├── globals.css     Seluruh sistem desain (design token, 22 seksi, responsif)
│   └── favicon.ico
public/                 Aset statis (stiker parallax, mascot, foto profil)
```

Belum ada pemisahan komponen: seluruh UI ada di `src/app/page.tsx`. Jika halaman ini
tumbuh, pemisahan ke `src/components/` per section adalah langkah berikutnya yang wajar.

## Section

`#hero` · `#about` · `#education` · `#experience` · `#certs` · `#gallery` · `#contact`

Tracking nav aktif (`page.tsx`) harus memuat **id yang sama** dengan section yang ada.
Jika menambah section baru, tambahkan id-nya ke array tersebut, kalau tidak link nav-nya
tidak akan pernah mendapat gaya aktif.

## Aset

- `public/mascot.jpg` — ilustrasi maskot 3D di hero.
- `public/p1.jpg` … `p14.jpg` — stiker dekoratif semi-transparan dengan parallax
  (`data-speed` dibaca `page.tsx` untuk kecepatan parallax).
- `public/foto-nabilah.jpg` — **saat ini placeholder buatan sendiri** (gradasi rose
  dengan ikon stetoskop, 735×903), bukan foto asli. Ganti dengan foto asli tanpa
  mengubah nama file; penampilannya mengikuti `object-fit: cover`.
- Galeri memakai foto stok dari Unsplash (URL di `GALLERY`, `page.tsx`) — belum
  dokumentasi praktik asli.
- Kartu sertifikat sengaja **tidak** punya tautan (`page.tsx`) sampai berkas asli
  diunggah ke Google Drive.

## Kontak

Tautan kontak dan nomor WhatsApp diklik ulang dari konstanta di `page.tsx`
(`WHATSAPP_NUMBER`, lalu alamat email/Instagram). Semuanya hardcoded — belum ada
sumber data eksternal.

## Deploy

Siap di-deploy ke Vercel tanpa konfigurasi tambahan:

```bash
npx vercel
```

Atau build manual: `npm run build` lalu `npm start`.

## Catatan

Proyek ini dimulai dari satu file `index.html` statis (masih tersimpan di riwayat git
sebagai commit `95d05dc`) yang kemudian dimigrasikan ke Next.js.
