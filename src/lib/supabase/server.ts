import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { DEFAULT_CONTENT, DEFAULT_MEDIA } from "../content/defaults";
import type { MediaRow, SiteContent, SiteData, SiteMedia } from "../content/types";

export const BUCKET = "portfolio";
export const CONTENT_KEY = "site";

/** Batas waktu satu permintaan ke Supabase. Kalau lewat, pakai default. */
const TIMEOUT_MS = 3000;

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} belum diisi`);
  return v;
}

export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasServiceRole(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Klien untuk OPERASI SERVER. Hanya boleh dipakai di route handler / server component. */
function clientFor(key: string): SupabaseClient {
  return createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    key,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Tanpa batas waktu, halaman publik ikut menggantung kalau Supabase mati.
        fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
      },
    },
  );
}

/** Baca saja — cukup anon key, aman untuk sisi server. */
export const anonClient = () => clientFor(env("NEXT_PUBLIC_SUPABASE_ANON_KEY"));

/** Tulis — service role melewati RLS. JANGAN pernah dipakai di komponen klien. */
export const adminClient = () => clientFor(env("SUPABASE_SERVICE_ROLE_KEY"));

function rowToMedia(r: MediaRow): SiteMedia {
  return {
    id: r.id,
    kind: r.kind as SiteMedia["kind"],
    slot: r.slot ?? "",
    url: r.url,
    alt: r.alt ?? "",
    tag: r.tag ?? "",
    title: r.title ?? "",
    sortOrder: r.sort_order ?? 0,
    dataSpeed: r.data_speed ?? 0,
    width: r.width ?? 0,
    top: r.top ?? "",
    bottom: r.bottom ?? "",
    left: r.left ?? "",
    right: r.right ?? "",
    rotate: r.rotate ?? 0,
    opacity: r.opacity ?? 0.85,
  };
}

/**
 * Ambil seluruh data situs.
 * Selalu mengembalikan data yang bisa dirender: kalau Supabase mati,
 * tabel belum ada, atau env belum diisi, kita jatuh ke default lokal
 * supaya halaman publik tidak pernah blank.
 *
 * Dibungkus cache() supaya generateMetadata() dan komponen halaman
 * memakai satu permintaan yang sama, bukan dua.
 */
export const loadSiteData = cache(async (): Promise<SiteData> => {
  if (!hasSupabase()) return { content: DEFAULT_CONTENT, media: DEFAULT_MEDIA, fromDatabase: false };

  try {
    const supa = anonClient();

    const [contentRes, mediaRes] = await Promise.all([
      supa.from("site_content").select("content").eq("key", CONTENT_KEY).maybeSingle(),
      supa.from("site_media").select("*").order("sort_order", { ascending: true }),
    ]);

    const contentRow = contentRes.data?.content as Partial<SiteContent> | null | undefined;
    const mediaRows = (mediaRes.data as MediaRow[] | null) ?? [];

    if (!contentRow && mediaRows.length === 0) {
      return { content: DEFAULT_CONTENT, media: DEFAULT_MEDIA, fromDatabase: false };
    }

    return {
      content: { ...DEFAULT_CONTENT, ...contentRow },
      media: mediaRows.length ? mediaRows.map(rowToMedia) : DEFAULT_MEDIA,
      fromDatabase: true,
    };
  } catch {
    return { content: DEFAULT_CONTENT, media: DEFAULT_MEDIA, fromDatabase: false };
  }
});

/** Pastikan bucket ada. Dipanggil sebelum upload pertama. */
export async function ensureBucket(): Promise<void> {
  const supa = adminClient();
  const { error } = await supa.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
  });
  // 404/409 = bucket sudah ada, itu tidak apa-apa.
  if (error && !/already exists|exists/i.test(error.message)) throw error;
}