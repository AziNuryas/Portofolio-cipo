import type { SiteContent } from "@/lib/content/types";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";

export type SectionId =
  | "meta" | "hero" | "about" | "education"
  | "experience" | "certs" | "gallery" | "contact" | "footer";

export const SECTIONS: { id: SectionId; label: string; icon: string; hint: string }[] = [
  { id: "meta",        label: "Meta & Navigasi", icon: "◈", hint: "Judul SEO, deskripsi, logo, dan tombol nav" },
  { id: "hero",        label: "Hero",            icon: "✦", hint: "Nama, deskripsi, dan tombol utama" },
  { id: "about",       label: "Tentang Saya",    icon: "◐", hint: "Paragraf, keahlian, dan badge" },
  { id: "education",   label: "Kartu Kelulusan", icon: "❖", hint: "Gelar, institusi, angka, dan segel" },
  { id: "experience",  label: "Pengalaman",      icon: "▤", hint: "Penempatan klinis dan tanggung jawab" },
  { id: "certs",       label: "Sertifikat",      icon: "✔", hint: "Pelatihan, tanggal, dan organisasi" },
  { id: "gallery",     icon: "▣", label: "Galeri", hint: "Judul bagian — fotonya ada di tab Foto & stiker" },
  { id: "contact",     label: "Kontak",          icon: "✉", hint: "Email, WhatsApp, Instagram, dan form" },
  { id: "footer",      label: "Footer",          icon: "▾", hint: "Dua baris teks paling bawah" },
];

/** Bagian yang isinya masih sama persis dengan bawaan. */
export function unchangedSections(content: SiteContent): Set<SectionId> {
  const same = new Set<SectionId>();
  for (const s of SECTIONS) {
    const now = JSON.stringify(content[s.id as keyof SiteContent]);
    const base = JSON.stringify(DEFAULT_CONTENT[s.id as keyof SiteContent]);
    if (now === base) same.add(s.id);
  }
  return same;
}

/** Bagian yang kosong sepenuhnya — penanda "belum diisi". */
const isBlank = (v: unknown): boolean => {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.values(v).every(isBlank);
  return false;
};

export function emptySections(content: SiteContent): Set<SectionId> {
  const out = new Set<SectionId>();
  for (const s of SECTIONS) {
    if (isBlank(content[s.id as keyof SiteContent])) out.add(s.id);
  }
  return out;
}