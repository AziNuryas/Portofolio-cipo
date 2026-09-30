import type { NextRequest } from "next/server";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import {
  BUCKET,
  adminClient,
  anonClient,
  ensureBucket,
  hasServiceRole,
} from "@/lib/supabase/server";
import type { MediaKind, MediaRow, SiteMedia } from "@/lib/content/types";
import { DEFAULT_MEDIA } from "@/lib/content/defaults";

export const dynamic = "force-dynamic";

const KINDS: MediaKind[] = ["profile", "hero", "sticker", "gallery"];
const MAX_BYTES = 8 * 1024 * 1024;

function rowToMedia(r: MediaRow): SiteMedia {
  return {
    id: r.id,
    kind: r.kind as MediaKind,
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

/** Ambil path objek di dalam bucket dari URL publiknya. */
function pathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

const str = (v: FormDataEntryValue | null, fb = "") =>
  typeof v === "string" ? v : fb;
const num = (v: FormDataEntryValue | null, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

/* ─────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  const supa = hasServiceRole() ? adminClient() : anonClient();
  const { data, error } = await supa.from("site_media").select("*").order("sort_order");

  if (error) {
    return Response.json(
      { ok: false, error: error.message, media: DEFAULT_MEDIA },
      { status: 500 },
    );
  }

  const rows = (data as MediaRow[] | null) ?? [];
  return Response.json({
    ok: true,
    media: rows.length ? rows.map(rowToMedia) : DEFAULT_MEDIA,
    fromDatabase: rows.length > 0,
  });
}

/* ── Unggah ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasServiceRole()) {
    return Response.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local." },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ ok: false, error: "Body harus multipart/form-data." }, { status: 400 });

  const rawKind = str(form.get("kind"), "sticker") as MediaKind;
  const kind = KINDS.includes(rawKind) ? rawKind : "sticker";
  const slot = str(form.get("slot"));

  const metadata = {
    kind,
    slot,
    alt: str(form.get("alt")),
    tag: str(form.get("tag")),
    title: str(form.get("title")),
    sort_order: num(form.get("sortOrder")),
    data_speed: num(form.get("dataSpeed")),
    width: num(form.get("width"), 200),
    top: str(form.get("top")),
    bottom: str(form.get("bottom")),
    left: str(form.get("left")),
    right: str(form.get("right")),
    rotate: num(form.get("rotate")),
    opacity: num(form.get("opacity"), 0.85),
  };

  const file = form.get("file");

  /* ── Mode 1: daftarkan media yang sudah punya URL.
        Dipakai untuk memindahkan media default lokal ke database
        tanpa mengunggah ulang berkasnya. ── */
  if (!(file instanceof File)) {
    const existingUrl = str(form.get("url"));
    if (!existingUrl) {
      return Response.json({ ok: false, error: "Field `file` atau `url` wajib diisi." }, { status: 400 });
    }
    const supa = adminClient();
    const ins = await supa.from("site_media").insert({ ...metadata, url: existingUrl }).select().single();
    if (ins.error) return Response.json({ ok: false, error: ins.error.message }, { status: 500 });
    return Response.json({ ok: true, media: rowToMedia(ins.data as MediaRow) }, { status: 201 });
  }

  /* ── Mode 2: unggah berkas baru ke Supabase Storage. ── */
  if (!file.type.startsWith("image/")) {
    return Response.json({ ok: false, error: "Hanya berkas gambar yang diterima." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, error: "Ukuran maksimal 8 MB." }, { status: 413 });
  }

  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg").toLowerCase();
  const safeExt = /^(jpe?g|png|webp|avif|gif|svg)$/.test(ext) ? ext : "jpg";
  const path = `${kind}/${slot || "umum"}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

  await ensureBucket();

  const supa = adminClient();
  const up = await supa.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (up.error) {
    return Response.json({ ok: false, error: `Gagal mengunggah: ${up.error.message}` }, { status: 500 });
  }

  const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(path);
  const ins = await supa.from("site_media").insert({ ...metadata, url: pub.publicUrl }).select().single();

  if (ins.error) {
    // Jangan sampai ada file yatim kalau insert-nya gagal.
    await supa.storage.from(BUCKET).remove([path]);
    return Response.json({ ok: false, error: ins.error.message }, { status: 500 });
  }

  return Response.json({ ok: true, media: rowToMedia(ins.data as MediaRow) }, { status: 201 });
}

/* ── Simpan massal: pindahkan media lokal ke database sekaligus ── */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasServiceRole()) {
    return Response.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi." }, { status: 503 });
  }

  const { items } = (await req.json().catch(() => ({}))) as { items?: unknown[] };
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ ok: false, error: "Field `items` wajib berisi array." }, { status: 400 });
  }

  const supa = adminClient();
  const results: { url: string; ok: boolean; error?: string }[] = [];

  for (const it of items as Partial<SiteMedia>[]) {
    if (!it?.url) continue;

    // Lewati yang sudah ada supaya tidak jadi duplikat.
    const exists = await supa.from("site_media").select("id").eq("url", it.url).maybeSingle();
    if (exists.data) {
      results.push({ url: it.url, ok: true });
      continue;
    }

    const ins = await supa
      .from("site_media")
      .insert({
        kind: KINDS.includes(it.kind as MediaKind) ? it.kind : "sticker",
        slot: it.slot ?? "",
        url: it.url,
        alt: it.alt ?? "",
        tag: it.tag ?? "",
        title: it.title ?? "",
        sort_order: it.sortOrder ?? 0,
        data_speed: it.dataSpeed ?? 0,
        width: it.width ?? 200,
        top: it.top ?? "",
        bottom: it.bottom ?? "",
        left: it.left ?? "",
        right: it.right ?? "",
        rotate: it.rotate ?? 0,
        opacity: it.opacity ?? 0.85,
      })
      .select()
      .single();

    results.push(
      ins.error
        ? { url: it.url, ok: false, error: ins.error.message }
        : { url: it.url, ok: true },
    );
  }

  const failed = results.filter(r => !r.ok);
  return Response.json({
    ok: failed.length === 0,
    saved: results.length - failed.length,
    failed: failed.length,
    errors: failed.map(f => `${f.url}: ${f.error}`),
  });
}

/* ── Ubah metadata ─────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasServiceRole()) {
    return Response.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi." }, { status: 503 });
  }

  const { id, patch } = (await req.json().catch(() => ({}))) as {
    id?: string;
    patch?: Record<string, unknown>;
  };

  if (!id || !patch || typeof patch !== "object") {
    return Response.json({ ok: false, error: "Field `id` dan `patch` wajib diisi." }, { status: 400 });
  }

  // Hanya izinkan kolom yang memang boleh diubah admin.
  const allowed = [
    "alt", "tag", "title", "sort_order", "data_speed",
    "width", "top", "bottom", "left", "right", "rotate", "opacity", "kind", "slot",
  ] as const;

  const clean: Record<string, unknown> = {};
  for (const k of allowed) if (k in patch) clean[k] = patch[k];

  if (Object.keys(clean).length === 0) {
    return Response.json({ ok: false, error: "Tidak ada kolom yang valid untuk diubah." }, { status: 400 });
  }

  const supa = adminClient();
  const { data, error } = await supa
    .from("site_media")
    .update(clean)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, media: rowToMedia(data as MediaRow) });
}

/* ── Hapus ─────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasServiceRole()) {
    return Response.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi." }, { status: 503 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ ok: false, error: "Parameter `id` wajib diisi." }, { status: 400 });

  const supa = adminClient();
  const found = await supa.from("site_media").select("url").eq("id", id).maybeSingle();
  if (found.error) return Response.json({ ok: false, error: found.error.message }, { status: 500 });

  if (!found.data) return Response.json({ ok: false, error: "Media tidak ditemukan." }, { status: 404 });

  const del = await supa.from("site_media").delete().eq("id", id);
  if (del.error) return Response.json({ ok: false, error: del.error.message }, { status: 500 });

  // Berkas di storage ikut dibersihkan; kegagalan di sini tidak fatal.
  const path = pathFromUrl(found.data.url);
  if (path) await supa.storage.from(BUCKET).remove([path]);

  return Response.json({ ok: true });
}