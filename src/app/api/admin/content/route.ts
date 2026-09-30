import type { NextRequest } from "next/server";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { CONTENT_KEY, adminClient, anonClient, hasServiceRole } from "@/lib/supabase/server";
import type { SiteContent } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  // Membaca cukup dengan anon key (ada policy SELECT untuk publik), jadi
  // halaman admin tetap informatif walau service role belum diisi.
  const supa = hasServiceRole() ? adminClient() : anonClient();

  const { data, error } = await supa
    .from("site_content")
    .select("content, updated_at")
    .eq("key", CONTENT_KEY)
    .maybeSingle();

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal membaca: ${error.message} — jalankan supabase/schema.sql di Supabase Dashboard.` },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    content: (data?.content as SiteContent | null) ?? null,
    updatedAt: data?.updated_at ?? null,
    fromDatabase: true,
    canWrite: hasServiceRole(),
  });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasServiceRole()) {
    return Response.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local." },
      { status: 503 },
    );
  }

  let body: { content?: SiteContent };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Body harus berupa JSON." }, { status: 400 });
  }

  if (!body.content || typeof body.content !== "object" || Array.isArray(body.content)) {
    return Response.json({ ok: false, error: "Field `content` wajib diisi." }, { status: 400 });
  }

  const serialized = JSON.stringify(body.content);
  if (serialized.length > 512_000) {
    return Response.json({ ok: false, error: "Konten terlalu besar (maks 500 KB)." }, { status: 413 });
  }

  const supa = adminClient();
  const { error } = await supa
    .from("site_content")
    .upsert(
      { key: CONTENT_KEY, content: body.content, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, updatedAt: new Date().toISOString() });
}