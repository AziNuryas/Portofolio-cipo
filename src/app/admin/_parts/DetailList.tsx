"use client";

import { useState } from "react";
import type { MediaKind, SiteMedia } from "@/lib/content/types";
import { Field, Num } from "./fields";

const KIND_LABEL: Record<MediaKind, string> = {
  profile: "Foto profil",
  hero: "Ilustrasi hero",
  sticker: "Stiker dekoratif",
  gallery: "Foto galeri",
};

/** Pengaturan rinci: judul, teks, posisi, dan hapus. */
export default function DetailList({
  media,
  onReload,
  onPersistAll,
  busy,
  totalLocal,
  blockedReason,
}: {
  media: SiteMedia[];
  onReload: () => Promise<void>;
  onPersistAll: () => Promise<void>;
  busy: boolean;
  totalLocal: number;
  blockedReason?: string;
}) {
  const groups = (Object.keys(KIND_LABEL) as MediaKind[])
    .map(k => ({ kind: k, items: media.filter(m => m.kind === k) }))
    .filter(g => g.items.length > 0);

  return (
    <section className="ad-group-box">
      <div className="ad-sec-head">
        <h3 className="ad-group-title">Detail &amp; posisi ({media.length})</h3>
        {totalLocal > 0 && !blockedReason && (
          <button type="button" className="ad-add" disabled={busy} onClick={onPersistAll}>
            Daftarkan {totalLocal} bawaan ke database
          </button>
        )}
      </div>

      <p className="ad-note">
        Beri judul pada tiap foto supaya mudah dikenali, lalu atur lebar, putaran, dan
        posisinya. Hapus berkas yang tidak dipakai agar tidak muncul di situs.
      </p>

      {groups.map(g => (
        <div key={g.kind} className="ad-group">
          <h4>{KIND_LABEL[g.kind]} <em>{g.items.length}</em></h4>
          <div className="ad-media-grid">
            {g.items.map(m => (
              <MediaRow key={m.id} m={m} busy={busy} onReload={onReload} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}


/* ── Satu baris media: ubah metadata / hapus ── */
function MediaRow({ m, busy, onReload }: { m: SiteMedia; busy: boolean; onReload: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(m);
  const [msg, setMsg] = useState<string | null>(null);

  const patch = <K extends keyof SiteMedia>(k: K, v: SiteMedia[K]) =>
    setDraft(d => ({ ...d, [k]: v }));

  const persisted = /^[0-9a-f-]{36}$/i.test(m.id);
  const isExternal = /^https?:\/\//i.test(m.url);

  const save = async () => {
    const token = sessionStorage.getItem("ad_token") ?? "";
    const res = await window.fetch("/api/admin/media", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: m.id,
        patch: {
          alt: draft.alt, tag: draft.tag, title: draft.title,
          width: draft.width, data_speed: draft.dataSpeed, rotate: draft.rotate,
          opacity: draft.opacity, top: draft.top, bottom: draft.bottom,
          left: draft.left, right: draft.right,
        },
      }),
    });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok && json.ok ? "Tersimpan." : json.error ?? "Gagal menyimpan.");
    if (res.ok && json.ok) await onReload();
  };

  const remove = async () => {
    const token = sessionStorage.getItem("ad_token") ?? "";
    const res = await window.fetch(`/api/admin/media?id=${encodeURIComponent(m.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok && json.ok ? "Dihapus." : json.error ?? "Gagal menghapus.");
    if (res.ok && json.ok) await onReload();
  };

  const persist = async () => {
    const token = sessionStorage.getItem("ad_token") ?? "";
    const fd = new FormData();
    fd.set("url", m.url);
    fd.set("kind", m.kind);
    fd.set("slot", m.slot);
    fd.set("title", m.title);
    fd.set("tag", m.tag);
    fd.set("alt", m.alt);
    fd.set("width", String(m.width));
    fd.set("dataSpeed", String(m.dataSpeed));
    fd.set("rotate", String(m.rotate));
    fd.set("opacity", String(m.opacity));
    fd.set("top", m.top);
    fd.set("bottom", m.bottom);
    fd.set("left", m.left);
    fd.set("right", m.right);

    const res = await window.fetch("/api/admin/media", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok && json.ok ? "Disimpan ke database." : json.error ?? "Gagal menyimpan.");
    if (res.ok && json.ok) await onReload();
  };

  return (
    <div className="ad-media">
      <div className="ad-media-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.url} alt={m.alt || m.title || "media"} loading="lazy" />
        <div className="ad-media-info">
          <b>{m.title || m.alt || m.kind}</b>
          <small>{m.slot ? `slot: ${m.slot}` : m.kind}</small>
          <code className="ad-url">{isExternal ? "tautan luar" : m.url}</code>
        </div>
        <div className="ad-media-btns">
          {!persisted && (
            <button type="button" className="ad-add" disabled={busy} onClick={persist}>
              Simpan
            </button>
          )}
          <button type="button" className="ad-toggle" onClick={() => setOpen(o => !o)}>
            {open ? "Tutup" : "Atur"}
          </button>
          {persisted && (
            <button type="button" className="ad-del" disabled={busy} onClick={remove}>
              Hapus
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="ad-media-edit">
          <div className="ad-grid2">
            <Field label="Judul" value={draft.title} onChange={v => patch("title", v)} />
            <Field label="Tag" value={draft.tag} onChange={v => patch("tag", v)} />
          </div>
          <Field label="Teks alternatif" value={draft.alt} onChange={v => patch("alt", v)} />
          {m.kind === "sticker" && (
            <>
              <div className="ad-grid3">
                <Num label="Lebar" value={draft.width} onChange={v => patch("width", v)} min={40} max={900} />
                <Num label="Parallax" value={draft.dataSpeed} onChange={v => patch("dataSpeed", v)} step={10} />
                <Num label="Rotasi" value={draft.rotate} onChange={v => patch("rotate", v)} min={-180} max={180} />
              </div>
              <Num label="Opasitas" value={draft.opacity} onChange={v => patch("opacity", v)} step={0.05} min={0} max={1} />
              <div className="ad-grid4">
                <Field label="Atas" value={draft.top} onChange={v => patch("top", v)} />
                <Field label="Bawah" value={draft.bottom} onChange={v => patch("bottom", v)} />
                <Field label="Kiri" value={draft.left} onChange={v => patch("left", v)} />
                <Field label="Kanan" value={draft.right} onChange={v => patch("right", v)} />
              </div>
            </>
          )}
          <div className="ad-actions">
            <button type="button" className="ad-primary" disabled={busy || !persisted} onClick={save}>
              Simpan perubahan
            </button>
            {!persisted && <span className="ad-note">Simpan dulu ke database agar bisa diedit di sini.</span>}
          </div>
        </div>
      )}

      {msg && <p className="ad-msg">{msg}</p>}
    </div>
  );
}