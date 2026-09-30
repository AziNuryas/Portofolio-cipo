-- ════════════════════════════════════════════════════════════
--  Verifikasi hasil migrasi awal.
--  Kalau ada yang belum siap, migrasi ini GAGAL dan pesan
--  errornya menyebutkan bagian yang kurang.
-- ════════════════════════════════════════════════════════════

do $$
declare
  v_missing text := '';
  v_public  boolean;
begin
  -- Tabel wajib ada
  if to_regclass('public.site_content') is null then
    v_missing := v_missing || ' tabel site_content;';
  end if;
  if to_regclass('public.site_media') is null then
    v_missing := v_missing || ' tabel site_media;';
  end if;

  -- Kolom "left" / "right" harus ada dan bernama persis begitu
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_media' and column_name = 'leff'
  ) then
    v_missing := v_missing || ' ada kolom leff (typo "left");';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_media' and column_name = 'left'
  ) then
    v_missing := v_missing || ' kolom "left";';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_media' and column_name = 'right'
  ) then
    v_missing := v_missing || ' kolom "right";';
  end if;

  -- RLS harus aktif di kedua tabel
  if not exists (select 1 from pg_class c
                 join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relname = 'site_content' and c.relrowsecurity) then
    v_missing := v_missing || ' RLS site_content;';
  end if;
  if not exists (select 1 from pg_class c
                 join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relname = 'site_media' and c.relrowsecurity) then
    v_missing := v_missing || ' RLS site_media;';
  end if;

  -- Bucket harus ada dan publik
  select public into v_public from storage.buckets where id = 'portfolio';
  if v_public is null then
    v_missing := v_missing || ' bucket portfolio;';
  elsif not v_public then
    v_missing := v_missing || ' bucket portfolio belum publik;';
  end if;

  if v_missing <> '' then
    raise exception 'VERIFIKASI GAGAL - belum ada:%', v_missing;
  end if;

  raise notice 'VERIFIKASI LOLOS: 2 tabel, kolom left/right, RLS aktif, bucket publik.';
end $$;