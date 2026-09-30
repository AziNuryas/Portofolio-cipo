import type { Metadata } from "next";
import SiteView from "./_components/SiteView";
import { loadSiteData } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await loadSiteData();
  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default async function Page() {
  const { content, media } = await loadSiteData();

  /* Kalau Supabase mati atau tabel belum ada, loadSiteData() sudah
     mengembalikan default lokal — halaman tetap tampil utuh. */
  return <SiteView content={content} media={media} />;
}