"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaKind } from "@/lib/content/types";

const MAX_BYTES = 8 * 1024 * 1024;
const OK_EXT = /\.(jpe?g|png|webp|avif)$/i;

export type UploadMeta = {
  kind: MediaKind;
  slot: string;
  title: string;
  tag: string;
  alt: string;
  width: number;
  sortOrder: number;
  dataSpeed: number;
  rotate: number;
  opacity: number;
  top: string;
  bottom: string;
  left: string;
  right: string;
};

export default function Uploader({
  meta,
  onMeta,
  onDone,
  disabled,
  blockedReason,
}: {
  meta: UploadMeta;
  onMeta: (m: UploadMeta) => void;
  onDone: () => Promise<void>;
  disabled: boolean;
  blockedReason?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [over, setOver] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  /* Pratinjau diturunkan langsung dari berkas; URL dibuat ulang tiap berkas. */
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f: File | null | undefined) => {
    setMsg(null);
    if (!f) return;
    if (!OK_EXT.test(f.name)) {
      setFile(null);
      setMsg({ tone: "bad", text: `Format ${f.name.split(".").pop()} belum didukung. Pakai JPG, PNG, WebP, atau AVIF.` });
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setMsg({ tone: "bad", text: `Ukuran ${(f.size / 1048576).toFixed(1)} MB, melebihi batas 8 MB.` });
      return;
    }
    setFile(f);
    setMsg(null);
  };

  /* Unggah dengan progres nyata lewat XHR. */
  const send = () => {
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    Object.entries(meta).forEach(([k, v]) => fd.set(k, String(v)));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.setRequestHeader("Authorization", `Bearer ${sessionStorage.getItem("ad_token") ?? ""}`);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setPct(null);
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(xhr.responseText); } catch { /* biarkan */ }
      if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
        setMsg({ tone: "ok", text: "Tersimpan ke Supabase Storage." });
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        void onDone();
      } else {
        setMsg({ tone: "bad", text: (json.error as string) ?? `Gagal mengunggah (HTTP ${xhr.status}).` });
      }
    };
    xhr.onerror = () => {
      setPct(null);
      setMsg({ tone: "bad", text: "Koneksi terputus saat mengunggah." });
    };

    setPct(0);
    xhr.send(fd);
  };

  const needsSlot = meta.kind === "sticker";
  const size = file ? (file.size / 1024 < 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / 1048576).toFixed(1)} MB`) : null;

  return (
    <div className="ad-up">
      {blockedReason && <p className="ad-msg bad">{blockedReason}</p>}

      {/* ── Area tarik-lepas ── */}
      <div
        className={`ad-drop${over ? " over" : ""}${file ? " filled" : ""}`}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={e => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !blockedReason && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
          className="ad-file"
          onChange={e => pick(e.target.files?.[0])}
        />

        {file ? (
          <div className="ad-drop-body">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ad-drop-img" src={preview} alt="pratinjau berkas" />
            )}
            <div className="ad-drop-info">
              <b>{file.name}</b>
              <small>{size} · {meta.kind}</small>
              <button type="button" className="ad-toggle" onClick={e => { e.stopPropagation(); setFile(null); }}>
                Ganti berkas
              </button>
            </div>
          </div>
        ) : (
          <div className="ad-drop-body">
            <span className="ad-drop-icon" aria-hidden="true">⇪</span>
            <div>
              <b>Tarik berkas ke sini</b>
              <small>atau klik untuk memilih — JPG, PNG, WebP, atau AVIF. Maks 8 MB.</small>
            </div>
          </div>
        )}
      </div>

      {/* ── Progres ── */}
      {pct !== null && (
        <div className="ad-progress" role="progressbar" aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
          <span>{pct}%</span>
        </div>
      )}

      {/* ── Pengaturan ── */}
      <div className="ad-up-grid">
        <label className="ad-field">
          <span className="ad-label">Jenis</span>
          <select value={meta.kind} onChange={e => onMeta({ ...meta, kind: e.target.value as MediaKind })}>
            <option value="profile">Foto profil</option>
            <option value="hero">Ilustrasi hero</option>
            <option value="sticker">Stiker dekoratif</option>
            <option value="gallery">Foto galeri</option>
          </select>
        </label>

        {needsSlot && (
          <label className="ad-field">
            <span className="ad-label">Tempat tampil</span>
            <select value={meta.slot} onChange={e => onMeta({ ...meta, slot: e.target.value })}>
              <option value="about">Tentang saya</option>
              <option value="experience">Pengalaman</option>
              <option value="certs">Sertifikat</option>
              <option value="gallery">Galeri</option>
            </select>
          </label>
        )}

        <label className="ad-field">
          <span className="ad-label">Teks alternatif</span>
          <input value={meta.alt} onChange={e => onMeta({ ...meta, alt: e.target.value })} placeholder="Untuk pembaca layar" />
        </label>

        {meta.kind === "gallery" && (
          <>
            <label className="ad-field">
              <span className="ad-label">Judul kartu</span>
              <input value={meta.title} onChange={e => onMeta({ ...meta, title: e.target.value })} placeholder="mis. Rawat Inap" />
            </label>
            <label className="ad-field">
              <span className="ad-label">Tag kecil</span>
              <input value={meta.tag} onChange={e => onMeta({ ...meta, tag: e.target.value })} placeholder="mis. IGD & ICU" />
            </label>
          </>
        )}

        {needsSlot && (
          <>
            <label className="ad-field">
              <span className="ad-label">Urutan tampil</span>
              <input type="number" min={0} max={99} value={meta.sortOrder}
                onChange={e => onMeta({ ...meta, sortOrder: Number(e.target.value) })} />
              <span className="ad-hint">0 = paling atas. Memakai urutan yang sudah dipakai akan menimpa bingkai itu.</span>
            </label>
            <label className="ad-field">
              <span className="ad-label">Lebar (px)</span>
              <input type="number" min={40} max={900} value={meta.width}
                onChange={e => onMeta({ ...meta, width: Number(e.target.value) })} />
            </label>
            <label className="ad-field">
              <span className="ad-label">Efek parallax</span>
              <input type="number" step={10} min={-400} max={400} value={meta.dataSpeed}
                onChange={e => onMeta({ ...meta, dataSpeed: Number(e.target.value) })} />
              <span className="ad-hint">Negatif = bergerak naik.</span>
            </label>
            <label className="ad-field">
              <span className="ad-label">Putaran (derajat)</span>
              <input type="number" min={-180} max={180} value={meta.rotate}
                onChange={e => onMeta({ ...meta, rotate: Number(e.target.value) })} />
            </label>
            <label className="ad-field">
              <span className="ad-label">Opasitas</span>
              <input type="number" step={0.05} min={0} max={1} value={meta.opacity}
                onChange={e => onMeta({ ...meta, opacity: Number(e.target.value) })} />
            </label>
            {(["top", "bottom", "left", "right"] as const).map(k => (
              <label className="ad-field" key={k}>
                <span className="ad-label">{k === "top" ? "Atas" : k === "bottom" ? "Bawah" : k === "left" ? "Kiri" : "Kanan"}</span>
                <input value={meta[k]} onChange={e => onMeta({ ...meta, [k]: e.target.value })} placeholder="mis. 5%" />
              </label>
            ))}
          </>
        )}
      </div>

      {msg && <p className={`ad-msg ${msg.tone}`}>{msg.text}</p>}

      <div className="ad-actions">
        <button type="button" className="ad-primary" onClick={send} disabled={!file || pct !== null || disabled}>
          {pct !== null ? "Mengunggah…" : "Unggah ke Supabase"}
        </button>
        {!file && <span className="ad-note">Pilih berkas dulu.</span>}
      </div>
    </div>
  );
}