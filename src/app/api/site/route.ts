import { loadSiteData } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Data situs publik — dipakai admin untuk pratinjau & debugging. */
export async function GET() {
  const data = await loadSiteData();
  return Response.json({ ok: true, ...data });
}