import type { NextRequest } from "next/server";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { hasServiceRole, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Hanya memvalidasi token. Sengaja tidak menyentuh database, supaya
 * admin tetap bisa masuk ke panel untuk membaca petunjuk setup
 * meskipun tabel Supabase belum dibuat.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  return Response.json({
    ok: true,
    supabaseConfigured: hasSupabase(),
    canWrite: hasServiceRole(),
  });
}