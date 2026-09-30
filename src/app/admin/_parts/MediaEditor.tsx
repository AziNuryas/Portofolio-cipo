"use client";

import { useState } from "react";
import type { SiteMedia } from "@/lib/content/types";
import FrameBoard from "./FrameBoard";
import Uploader, { type UploadMeta } from "./Uploader";
import DetailList from "./DetailList";

const EMPTY_META: UploadMeta = {
  kind: "sticker", slot: "about", title: "", tag: "", alt: "",
  width: 200, dataSpeed: 120, rotate: 0, opacity: 0.85, sortOrder: 0,
  top: "", bottom: "", left: "", right: "",
};

export default function MediaEditor({
  media,
  onReload,
  onPersistAll,
  busy,
  blockedReason,
}: {
  media: SiteMedia[];
  onReload: () => Promise<void>;
  onPersistAll: () => Promise<void>;
  busy: boolean;
  blockedReason?: string;
}) {
  const [meta, setMeta] = useState<UploadMeta>(EMPTY_META);
  const [mode, setMode] = useState<"frame" | "add" | "detail">("frame");

  const totalLocal = media.filter(m => !/^[0-9a-f-]{36}$/i.test(m.id)).length;

  return (
    <div className="ad-pane">
      <header className="ad-pane-head">
        <span className="ad-pane-icon" aria-hidden="true">▣</span>
        <div>
          <h2>Foto &amp; stiker</h2>
          <p>Setiap bingkai di bawah ini meniru letaknya di situs. Klik <b>Ganti foto</b> untuk menimpanya.</p>
        </div>
      </header>

      {/* ── Pilih mode: ganti per bingkai, tambah baru, atau atur detail ── */}
      <div className="ad-modes" role="tablist">
        <button role="tab" aria-selected={mode === "frame"} className={mode === "frame" ? "on" : ""} onClick={() => setMode("frame")}>
          <span aria-hidden="true">▣</span> Ganti per bingkai
        </button>
        <button role="tab" aria-selected={mode === "add"} className={mode === "add" ? "on" : ""} onClick={() => setMode("add")}>
          <span aria-hidden="true">＋</span> Tambah foto baru
        </button>
        <button role="tab" aria-selected={mode === "detail"} className={mode === "detail" ? "on" : ""} onClick={() => setMode("detail")}>
          <span aria-hidden="true">⚙</span> Atur detail &amp; posisi
        </button>
      </div>

      {mode === "frame" && (
        <FrameBoard media={media} onReload={onReload} busy={busy} blockedReason={blockedReason} />
      )}

      {mode === "add" && (
        <section className="ad-group-box">
          <h3 className="ad-group-title">Unggah foto baru</h3>
          <div className="ad-group-fields">
            <Uploader
              meta={meta}
              onMeta={setMeta}
              onDone={onReload}
              disabled={busy}
              blockedReason={blockedReason}
            />
          </div>
        </section>
      )}

      {mode === "detail" && (
        <DetailList
          media={media}
          onReload={onReload}
          onPersistAll={onPersistAll}
          busy={busy}
          totalLocal={totalLocal}
          blockedReason={blockedReason}
        />
      )}
    </div>
  );
}
