"use client";

import { useId } from "react";

/* ════════════════════════════════════════════════════════════
   Komponen form kecil yang dipakai berulang di halaman admin.
   ════════════════════════════════════════════════════════════ */

export function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <label className="ad-field" htmlFor={id}>
      <span className="ad-label">{label}</span>
      <input id={id} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {hint && <span className="ad-hint">{hint}</span>}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="ad-field" htmlFor={id}>
      <span className="ad-label">{label}</span>
      <textarea id={id} rows={rows} value={value} onChange={e => onChange(e.target.value)} />
      {hint && <span className="ad-hint">{hint}</span>}
    </label>
  );
}

export function Num({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="ad-field ad-narrow" htmlFor={id}>
      <span className="ad-label">{label}</span>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
      />
      {hint && <span className="ad-hint">{hint}</span>}
    </label>
  );
}

/* ── Daftar teks sederhana (chips, organisasi, dsb) ── */
export function StringList({
  label,
  items,
  onChange,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const swap = (i: number, v: string) => onChange(items.map((it, j) => (j === i ? v : it)));
  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>
      <div className="ad-list">
        {items.map((it, i) => (
          <div className="ad-list-row" key={i}>
            <input value={it} onChange={e => swap(i, e.target.value)} />
            <button
              type="button"
              className="ad-x"
              title="Hapus baris"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="ad-add" onClick={() => onChange([...items, ""])}>
          + Tambah
        </button>
      </div>
      {hint && <span className="ad-hint">{hint}</span>}
    </div>
  );
}

/* ── Daftar objek berulang (timeline, sertifikat, kontak, dsb) ── */
export type SubSpec = {
  key: string;
  label: string;
  kind: "text" | "area" | "lines";
  placeholder?: string;
};

export function Repeat<T>({
  label,
  items,
  onChange,
  fields,
  newItem,
  titleOf,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  fields: SubSpec[];
  newItem: () => T;
  titleOf: (item: T, i: number) => string;
}) {
  const patch = (i: number, key: string, value: unknown) =>
    onChange(items.map((it, j) => (j === i ? ({ ...it, [key]: value } as T) : it)));

  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>
      <div className="ad-repeat">
        {items.map((item, i) => (
          <div className="ad-card" key={i}>
            <div className="ad-card-head">
              <b>{titleOf(item, i)}</b>
              <button
                type="button"
                className="ad-x"
                title="Hapus"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>

            {fields.map(f => {
              if (f.kind === "lines") {
                return (
                  <StringList
                    key={f.key}
                    label={f.label}
                    items={(item as Record<string, unknown>)[f.key] as string[] ?? []}
                    onChange={v => patch(i, f.key, v)}
                  />
                );
              }
              const v = (item as Record<string, unknown>)[f.key] as string ?? "";
              return f.kind === "area" ? (
                <Area key={f.key} label={f.label} value={v} onChange={val => patch(i, f.key, val)} rows={3} />
              ) : (
                <Field key={f.key} label={f.label} value={v} placeholder={f.placeholder} onChange={val => patch(i, f.key, val)} />
              );
            })}
          </div>
        ))}
        <button type="button" className="ad-add" onClick={() => onChange([...items, newItem()])}>
          + Tambah {label}
        </button>
      </div>
    </div>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <label className="ad-field" htmlFor={id}>
      <span className="ad-label">{label}</span>
      <select id={id} value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}