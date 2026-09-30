"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SiteContent, SiteMedia } from "@/lib/content/types";
import { DEFAULT_CONTENT, DEFAULT_MEDIA } from "@/lib/content/defaults";
import ContentEditor from "./_parts/ContentEditor";
import MediaEditor from "./_parts/MediaEditor";
import Sidebar from "./_parts/Sidebar";
import { unchangedSections, type SectionId } from "./_parts/sections";
import "./admin.css";

const TOKEN_KEY = "ad_token";

type Tab = "content" | "media";
type Status = { tone: "ok" | "bad" | "info"; text: string } | null;

/** Token disimpan di sessionStorage, jadi habis saat tab ditutup. */
const readToken = () =>
  typeof window === "undefined" ? "" : (sessionStorage.getItem(TOKEN_KEY) ?? "");

export default function AdminPage() {
  const [token, setToken] = useState(readToken);
  const [authed, setAuthed] = useState(false);

  const [tab, setTab] = useState<Tab>("content");
  const [section, setSection] = useState<SectionId>("hero");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [saved, setSaved] = useState<SiteContent>(DEFAULT_CONTENT);
  const [media, setMedia] = useState<SiteMedia[]>(DEFAULT_MEDIA);

  const [mediaFromDb, setMediaFromDb] = useState(false);
  const [canWrite, setCanWrite] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  /** Bagian yang berbeda dari isi database terakhir. */
  const edited = useMemo(
    () => [...unchangedSections(saved)].filter(id => unchangedSections(content).has(id)),
    [saved, content],
  );
  const dirty = edited.length > 0;

  /** Peringatan sebelum menutup tab dengan perubahan yang belum disimpan. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const blockedReason = canWrite
    ? undefined
    : "Penyimpanan ditolak: SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Isi kuncinya di Supabase Dashboard → Project Settings → API, lalu restart server.";

  const authHeaders = useCallback(
    (json = false): HeadersInit => ({
      Authorization: `Bearer ${readToken()}`,
      ...(json ? { "Content-Type": "application/json" } : {}),
    }),
    [],
  );

  const loadMedia = useCallback(async () => {
    const res = await window.fetch("/api/admin/media", { headers: authHeaders() });
    const json = await res.json().catch(() => ({}));
    if (json.media) {
      setMedia(json.media);
      setMediaFromDb(Boolean(json.fromDatabase));
    }
    if (!json.ok && json.error) setStatus({ tone: "bad", text: json.error });
  }, [authHeaders]);

  /** Ambil konten. Kegagalan di sini tidak menghalangi masuk panel. */
  const loadContent = useCallback(async () => {
    const res = await window.fetch("/api/admin/content", { headers: authHeaders() });
    const json = await res.json().catch(() => ({}));
    if (json.ok) {
      setContent(json.content ?? DEFAULT_CONTENT);
      setSaved(json.content ?? DEFAULT_CONTENT);
      setCanWrite(json.canWrite !== false);
    } else {
      setStatus({ tone: "bad", text: json.error ?? "Gagal membaca konten." });
    }
  }, [authHeaders]);

  /** Hanya memvalidasi token, tanpa menyentuh database. */
  const verify = useCallback(async (value: string) => {
    const res = await window.fetch("/api/admin/session", {
      headers: { Authorization: `Bearer ${value}` },
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.ok === true, json };
  }, []);

  const enter = useCallback(
    (json: Record<string, unknown>) => {
      setAuthed(true);
      setCanWrite(json.canWrite !== false);
      setStatus(
        json.supabaseConfigured
          ? { tone: "info", text: "Token valid. Memuat isi situs…" }
          : {
              tone: "bad",
              text: "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY belum diisi, jadi situs memakai konten bawaan.",
            },
      );
      void loadContent();
      void loadMedia();
    },
    [loadContent, loadMedia],
  );

  /* ── Login ── */
  const login = async () => {
    const value = token.trim();
    if (!value) return;

    setBusy(true);
    setStatus(null);
    sessionStorage.setItem(TOKEN_KEY, value);

    const { ok, json } = await verify(value);
    if (ok) {
      enter(json);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      setStatus({ tone: "bad", text: json.error ?? "Token ditolak." });
    }
    setBusy(false);
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setToken("");
    setStatus(null);
  };

  /* Token masih tersimpan setelah refresh — langsung coba lagi. */
  useEffect(() => {
    const saved = readToken();
    if (!saved) return;
    void verify(saved).then(({ ok, json }) => {
      if (!ok) {
        sessionStorage.removeItem(TOKEN_KEY);
        return;
      }
      enter(json);
    });
  }, [verify, enter]);

  /* ── Simpan konten ── */
  const saveContent = async () => {
    setBusy(true);
    setStatus(null);
    const res = await window.fetch("/api/admin/content", {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify({ content }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      setSaved(content);
      setStatus({ tone: "ok", text: "Konten tersimpan. Buka beranda untuk melihat hasilnya." });
    } else {
      setStatus({ tone: "bad", text: json.error ?? "Gagal menyimpan." });
    }
    setBusy(false);
  };

  /* ── Pindahkan semua media ke database ── */
  const persistAll = async () => {
    setBusy(true);
    setStatus(null);
    const res = await window.fetch("/api/admin/media", {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify({ items: media }),
    });
    const json = await res.json().catch(() => ({}));
    setStatus(
      res.ok && json.ok
        ? { tone: "ok", text: `${json.saved} media tersimpan ke database.` }
        : { tone: "bad", text: (json.errors ?? []).join(" | ") || json.error || "Gagal menyimpan." },
    );
    await loadMedia();
    setBusy(false);
  };

  /* ════════════ Gerbang login ════════════ */
  if (!authed) {
    return (
      <main className="ad-login">
        <div className="ad-login-box">
          <h1>Panel Admin</h1>
          <p>Masukkan token admin untuk mengelola isi portofolio.</p>
          <input
            type="password"
            value={token}
            placeholder="ADMIN_TOKEN"
            autoFocus
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void login()}
          />
          <button className="ad-primary" onClick={() => void login()} disabled={busy || !token.trim()}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
          {status && <p className={`ad-msg ${status.tone}`}>{status.text}</p>}
          <Link className="ad-back" href="/">← Kembali ke situs</Link>
        </div>
      </main>
    );
  }

  /* ════════════ Panel ════════════ */
  return (
    <main className="ad-shell">
      <header className="ad-top">
        <h1>Panel Admin</h1>
        <div className="ad-top-actions">
          <a className="ad-add" href="/" target="_blank" rel="noreferrer">Lihat situs ↗</a>
          <button className="ad-add" onClick={logout}>Keluar</button>
        </div>
      </header>

      <nav className="ad-tabs">
        <button className={tab === "content" ? "on" : ""} onClick={() => setTab("content")}>
          Konten teks
        </button>
        <button className={tab === "media" ? "on" : ""} onClick={() => setTab("media")}>
          Foto &amp; stiker
        </button>
      </nav>

      {status && <p className={`ad-msg ${status.tone}`}>{status.text}</p>}

      {!canWrite && (
        <p className="ad-msg bad">
          <code>SUPABASE_SERVICE_ROLE_KEY</code> belum diisi di <code>.env.local</code>. Form masih
          bisa dibuka, tetapi penyimpanan akan ditolak. Ambil kuncinya di Supabase Dashboard →
          Project Settings → API.
        </p>
      )}

      {tab === "media" && !mediaFromDb && (
        <p className="ad-msg info">
          Belum ada media di database. Situs memakai berkas bawaan dari folder <code>public/</code>.
        </p>
      )}

      <div className={tab === "content" ? "ad-body" : "ad-body solo"}>
        {tab === "content" && (
          <Sidebar
            active={section}
            onChange={setSection}
            content={content}
            disabled={busy}
          />
        )}

        {tab === "content" ? (
          <ContentEditor section={section} value={content} onChange={setContent} />
        ) : (
          <MediaEditor
            media={media}
            onReload={loadMedia}
            onPersistAll={persistAll}
            busy={busy}
            blockedReason={blockedReason}
          />
        )}
      </div>

      {tab === "content" && (
        <footer className="ad-save">
          <span className="ad-save-info">
            {dirty
              ? `${edited.length} bagian belum tersimpan: ${edited.join(", ")}.`
              : "Semua perubahan tersimpan."}
          </span>
          <button className="ad-primary" onClick={() => void saveContent()} disabled={busy || !dirty}>
            {busy ? "Menyimpan…" : "Simpan konten"}
          </button>
        </footer>
      )}
    </main>
  );
}