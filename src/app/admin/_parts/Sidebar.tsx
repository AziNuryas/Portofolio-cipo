"use client";

import type { SiteContent } from "@/lib/content/types";
import { SECTIONS, emptySections, unchangedSections, type SectionId } from "./sections";

export default function Sidebar({
  active,
  onChange,
  content,
  disabled,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
  content: SiteContent;
  disabled: boolean;
}) {
  const untouched = unchangedSections(content);
  const empty = emptySections(content);

  return (
    <nav className="ad-side" aria-label="Bagian isi situs">
      <p className="ad-side-head">Bagian isi</p>
      <ul>
        {SECTIONS.map(s => {
          const isEmpty = empty.has(s.id);
          const isUntouched = untouched.has(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className={active === s.id ? "on" : ""}
                onClick={() => onChange(s.id)}
                disabled={disabled}
                title={s.hint}
              >
                <span className="ad-side-icon" aria-hidden="true">{s.icon}</span>
                <span className="ad-side-text">{s.label}</span>
                {isEmpty && <span className="ad-dot warn" title="Masih kosong" aria-label="Masih kosong" />}
                {!isEmpty && isUntouched && <span className="ad-dot" title="Masih bawaan" aria-label="Masih bawaan" />}
                {!isEmpty && !isUntouched && <span className="ad-dot ok" title="Sudah diubah" aria-label="Sudah diubah" />}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="ad-side-legend">
        <span><i className="ad-dot warn" /> kosong</span>
        <span><i className="ad-dot" /> masih bawaan</span>
        <span><i className="ad-dot ok" /> diubah</span>
      </div>
    </nav>
  );
}