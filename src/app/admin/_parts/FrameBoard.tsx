"use client";

import { useRef, useState } from "react";
import type { MediaKind, SiteMedia } from "@/lib/content/types";

const MAX_BYTES = 8 * 1024 * 1024;
const OK_EXT = /\.(jpe?g|png|webp|avif)$/i;

const FRAMES: {
  kind: MediaKind;
  title: string;
  sub: string;
  hint: string;
  icon: string;
  layout: "single" | "grid";
}[] = [
  { kind: "profile",  title: "Foto Profil",        sub: "Bingkai bulat di bagian Tentang Saya", icon: "◐", layout: "single", hint: "Potret preferably latar polos." },
  { kind: "hero",     title: "Ilustrasi Hero",     sub: "Maskot di kanan atas beranda",           icon: "✦", layout: "single", hint: "Gambar bersih, latar transparan lebih bagus." },
  { kind: "gallery",  title: "Momen Kenangan",     sub: "Galeri foto di beranda",                 icon: "▣", layout: "grid",   hint: "Klik salah satu bingkai untuk mengganti fotonya." },
  { kind: "sticker",  title: "Stiker Dekoratif",   sub: "Ornamen yang menempel di tiap section",  icon: "✧", layout: "grid",   hint: "PNG dengan latar transparan paling rapi." },
];

/**
 * Papan yang meniru bingkai asli di situs. Setiap bingkai punya tombol
 * "Ganti foto": klik → pilih berkas → langsung menimpa foto itu saja.
 */
export default function FrameBoard({
  media,
  onReload,
  busy,
  blockedReason,
}: {
  media: SiteMedia[];
  onReload: () => Promise<void>;
  busy: boolean;
  blockedReason?: string;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const inputs = useRef(new Map<string, HTMLInputElement>());

  const openPicker = (m: SiteMedia) => {
    if (blockedReason) {
      setMsg({ tone: "bad", text: blockedReason });
      return;
    }
    inputs.current.get(m.id)?.click();
  };

  const replace = async (m: SiteMedia, file: File) => {
    setMsg(null);
    if (!OK_EXT.test(file.name)) {
      setMsg({ tone: "bad", text: `Format ${file.name.split(".").pop()} belum didukung. Pakai JPG, PNG, WebP, atau AVIF.` });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg({ tone: "bad", text: `Ukuran ${(file.size / 1048576).toFixed(1)} MB, melebihi batas 8 MB.` });
      return;
    }

    setPending(m.id);
    const fd = new FormData();
    fd.set("file", file);
    /* id kalau bingkai ini sudah punya baris di database; kalau belum,
       server akan cari lewat identitas bingkai (jenis + slot + urutan). */
    fd.set("replaceId", m.id);
    fd.set("kind", m.kind);
    fd.set("slot", m.slot);
    fd.set("alt", m.alt);
    fd.set("tag", m.tag);
    fd.set("title", m.title);
    fd.set("sortOrder", String(m.sortOrder));
    fd.set("dataSpeed", String(m.dataSpeed));
    fd.set("width", String(m.width));
    fd.set("rotate", String(m.rotate));
    fd.set("opacity", String(m.opacity));
    fd.set("top", m.top);
    fd.set("bottom", m.bottom);
    fd.set("left", m.left);
    fd.set("right", m.right);

    const res = await window.fetch("/api/admin/media", {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionStorage.getItem("ad_token") ?? ""}` },
      body: fd,
    });
    const json = await res.json().catch(() => ({}));

    setPending(null);
    setMsg(
      res.ok && json.ok
        ? { tone: "ok", text: "Foto tersimpan. Buka beranda untuk melihat hasilnya." }
        : { tone: "bad", text: json.error ?? "Gagal mengganti foto." },
    );
    if (res.ok && json.ok) await onReload();
  };

  return (
    <div className="ad-frames">
      {msg && <p className={`ad-msg ${msg.tone}`}>{msg.text}</p>}

      {FRAMES.map(f => {
        const items = media.filter(m => m.kind === f.kind);
        if (items.length === 0) return null;

        return (
          <section className="ad-frame-sec" key={f.kind}>
            <header className="ad-frame-head">
              <span className="ad-frame-icon" aria-hidden="true">{f.icon}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.sub} · {items.length} berkas</p>
              </div>
            </header>
            <p className="ad-note">{f.hint}</p>

            <div className={f.layout === "grid" ? "ad-frame-grid" : "ad-frame-row"}>
              {items.map(m => (
                <figure className="ad-frame" key={m.id}>
                  <div className="ad-frame-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt || m.title || f.title} loading="lazy" />
                    {pending === m.id && (
                      <div className="ad-frame-load"><span className="ad-spin" />mengunggah…</div>
                    )}
                    <div className="ad-frame-ov">
                      <button
                        type="button"
                        onClick={() => openPicker(m)}
                        disabled={busy || pending !== null}
                        aria-label={`Ganti ${m.title || m.alt || f.title}`}
                      >
                        <span aria-hidden="true">⤒</span> Ganti foto
                      </button>
                    </div>
                  </div>

                  <figcaption>
                    <b>{m.title || m.alt || "Tanpa judul"}</b>
                    {m.tag && <small>{m.tag}</small>}
                    {!/^[0-9a-f-]{36}$/i.test(m.id) && (
                      <em className="ad-frame-warn">berkas bawaan</em>
                    )}
                  </figcaption>

                  <input
                    ref={el => { if (el) inputs.current.set(m.id, el); else inputs.current.delete(m.id); }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
                    className="ad-file"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void replace(m, f);
                    }}
                  />
                </figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}