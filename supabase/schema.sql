-- ════════════════════════════════════════════════════════════
--  Skema content management — Portofolio Nabilah Aisha Syahada
--  Jalankan SEKALI di Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
--  1. Konten teks — satu baris untuk seluruh situs
--     Key 'site' dipakai aplikasi. Baris lain diabaikan.
-- ────────────────────────────────────────────────────────────
create table if not exists public.site_content (
  key        text        primary key,
  content    jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_content is 'Konten teks situs dalam satu dokumen JSON. Key "site" = konten aktif.';

-- ────────────────────────────────────────────────────────────
--  2. Pustaka media — foto profil, maskot hero, stiker, galeri
-- ────────────────────────────────────────────────────────────
create table if not exists public.site_media (
  id          uuid        primary key default gen_random_uuid(),
  kind        text        not null default 'sticker',
  slot        text        not null default '',
  url         text        not null,
  alt         text        not null default '',
  tag         text        not null default '',
  title       text        not null default '',
  sort_order  integer     not null default 0,
  -- parallax & tampilan
  data_speed  real        not null default 0,
  width       integer     not null default 200,
  top         text        not null default '',
  bottom      text        not null default '',
  left        text        not null default '',
  right       text        not null default '',
  rotate      real        not null default 0,
  opacity     real        not null default 0.85,
  created_at  timestamptz not null default now(),
  constraint site_media_kind_check
    check (kind in ('profile', 'hero', 'sticker', 'gallery'))
);

create index if not exists site_media_kind_slot_idx
  on public.site_media (kind, slot, sort_order);

comment on table  public.site_media is 'Pustaka media situs. Ditulis hanya lewat route admin (service role).';

-- ────────────────────────────────────────────────────────────
--  3. Row Level Security
--     matured: anon HANYA boleh baca. Semua tulisan ditolak untuk
--     anon key dan hanya bisa lewat service role di route admin,
--     yang lebih dulu memeriksa ADMIN_TOKEN.
-- ────────────────────────────────────────────────────────────
alter table public.site_content enable row level security;
alter table public.site_media   enable row level security;

drop policy if exists "publik baca konten" on public.site_content;
create policy "publik baca konten" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "publik baca media" on public.site_media;
create policy "publik baca media" on public.site_media
  for select to anon, authenticated using (true);

-- Sengaja TIDAK ada policy insert / update / delete.
--RLS aktif tanpa policy = operasi itu DITOLAK untuk anon.
-- Service role (dipakai route admin) melewati RLS secara otomatis.

-- ────────────────────────────────────────────────────────────
--  4. Bucket penyimpanan gambar
--     Bucket publik supaya <img> bisa memuat langsung.
--     Catatan: menulis tetap hanya service role.
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

drop policy if exists "publik baca object" on storage.objects;
create policy "publik baca object" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio');

-- ────────────────────────────────────────────────────────────
--  5. Sanity check
-- ────────────────────────────────────────────────────────────
select 'tabel dibuat' as status, count(*) as n from public.site_content
union all select 'bucket siap', count(*) from storage.buckets where id = 'portfolio';