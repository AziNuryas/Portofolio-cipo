import { timingSafeEqual, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Bandingkan dua string dalam waktu konstan.
 * Sengaja memotong ke panjang yang sama supaya timingSafeEqual
 * tidak melempar error saat panjang berbeda.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * ADMIN_TOKEN dikirim sebagai header bearer oleh halaman admin.
 * Nilai aslinya hanya ada di server (.env.local), tidak pernah
 * dikirim ke browser.
 */
export function isAdmin(req: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const given = bearer || req.headers.get("x-admin-token") || "";

  return given.length > 0 && safeEqual(given, expected);
}

export function unauthorized(): Response {
  return Response.json(
    { ok: false, error: "Token admin salah atau belum diisi." },
    { status: 401 },
  );
}

/** Buat token acak yang kuat, untuk disimpan ke ADMIN_TOKEN. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}