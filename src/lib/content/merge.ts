import type { SiteMedia } from "./types";
import { DEFAULT_MEDIA } from "./defaults";

/**
 * Identitas satu bingkai foto di halaman: jenis + tempat + urutan.
 * Dua bingkai dengan identitas sama dianggap "bingkai yang sama",
 * jadi mengunggah foto baru untuk slot itu akan MENGGANTIKENYA
 * alih-alih menambah bingkai baru.
 */
export const frameKey = (m: Pick<SiteMedia, "kind" | "slot" | "sortOrder">) =>
  `${m.kind}|${m.slot ?? ""}|${m.sortOrder ?? 0}`;

/**
 * Gabungkan baris database dengan daftar bawaan.
 *
 * Penting: ini bukan "kalau ada baris, pakai baris; kalau tidak,
 * pakai bawaan". Kalau begitu, mengunggah satu foto saja akan
 * membuat seluruh foto lain hilang dari situs.
 *
 * Yang terjadi di sini:
 *   - setiap baris DB menimpa bingkai bawaan dengan identitas sama,
 *   - baris DB yang identitasnya baru ikut ditambahkan,
 *   - bingkai bawaan yang belum punya pasangan tetap dipakai.
 */
export function mergeMedia(rows: SiteMedia[]): SiteMedia[] {
  if (rows.length === 0) return DEFAULT_MEDIA;

  const overridden = new Set(rows.map(frameKey));
  const kept = DEFAULT_MEDIA.filter(d => !overridden.has(frameKey(d)));

  return [...rows, ...kept].sort((a, b) => a.sortOrder - b.sortOrder);
}