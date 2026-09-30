"use client";

import type { SiteContent } from "@/lib/content/types";
import { Area, Field, Repeat, StringList } from "./fields";

export default function ContentEditor({
  value,
  onChange,
}: {
  value: SiteContent;
  onChange: (v: SiteContent) => void;
}) {
  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) =>
    onChange({ ...value, [k]: v });
  const at = <K extends keyof SiteContent>(k: K) => value[k];

  return (
    <div className="ad-sections">
      {/* ── META ── */}
      <section className="ad-sec">
        <h3>Meta &amp; Navigasi</h3>
        <Field label="Judul halaman" value={at("meta").title} onChange={v => set("meta", { ...at("meta"), title: v })} />
        <Area label="Deskripsi (SEO)" rows={2} value={at("meta").description} onChange={v => set("meta", { ...at("meta"), description: v })} />
        <Field label="Logo navigasi" value={at("nav").logo} onChange={v => set("nav", { ...at("nav"), logo: v })} />
        <Field label="Teks tombol navigasi" value={at("nav").cta} onChange={v => set("nav", { ...at("nav"), cta: v })} />
      </section>

      {/* ── HERO ── */}
      <section className="ad-sec">
        <h3>Hero</h3>
        <Field label="Label kecil" value={at("hero").eyebrow} onChange={v => set("hero", { ...at("hero"), eyebrow: v })} />
        <div className="ad-grid3">
          <Field label="Nama depan" value={at("hero").firstName} onChange={v => set("hero", { ...at("hero"), firstName: v })} />
          <Field label="Nama tengah" value={at("hero").secondName} onChange={v => set("hero", { ...at("hero"), secondName: v })} />
          <Field label="Nama belakang" value={at("hero").lastName} onChange={v => set("hero", { ...at("hero"), lastName: v })} />
        </div>
        <Area label="Deskripsi panjang" rows={5} value={at("hero").subtitle} onChange={v => set("hero", { ...at("hero"), subtitle: v })} />
        <div className="ad-grid2">
          <Field label="Tombol utama" value={at("hero").ctaPrimary} onChange={v => set("hero", { ...at("hero"), ctaPrimary: v })} />
          <Field label="Tautan tombol utama" value={at("hero").ctaPrimaryHref} onChange={v => set("hero", { ...at("hero"), ctaPrimaryHref: v })} />
          <Field label="Tombol kedua" value={at("hero").ctaSecondary} onChange={v => set("hero", { ...at("hero"), ctaSecondary: v })} />
          <Field label="Tautan tombol kedua" value={at("hero").ctaSecondaryHref} onChange={v => set("hero", { ...at("hero"), ctaSecondaryHref: v })} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="ad-sec">
        <h3>Tentang saya</h3>
        <Field label="Label kecil" value={at("about").eyebrow} onChange={v => set("about", { ...at("about"), eyebrow: v })} />
        <div className="ad-grid2">
          <Field label="Judul bagian 1" value={at("about").titleLead} onChange={v => set("about", { ...at("about"), titleLead: v })} />
          <Field label="Kata yang ditebalkan" value={at("about").titleAccent} onChange={v => set("about", { ...at("about"), titleAccent: v })} />
        </div>
        <StringList label="Paragraf" items={at("about").paragraphs} onChange={v => set("about", { ...at("about"), paragraphs: v })} hint="Satu paragraf per baris." />
        <StringList label="Chip keahlian" items={at("about").chips} onChange={v => set("about", { ...at("about"), chips: v })} />
        <div className="ad-grid2">
          <Field label="Badge bawah — angka" value={at("about").badgeBottom.value} onChange={v => set("about", { ...at("about"), badgeBottom: { ...at("about").badgeBottom, value: v } })} />
          <Field label="Badge bawah — teks" value={at("about").badgeBottom.label} onChange={v => set("about", { ...at("about"), badgeBottom: { ...at("about").badgeBottom, label: v } })} />
          <Field label="Badge atas — angka" value={at("about").badgeTop.value} onChange={v => set("about", { ...at("about"), badgeTop: { ...at("about").badgeTop, value: v } })} />
          <Field label="Badge atas — teks" value={at("about").badgeTop.label} onChange={v => set("about", { ...at("about"), badgeTop: { ...at("about").badgeTop, label: v } })} />
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section className="ad-sec">
        <h3>Kartu kelulusan</h3>
        <Field label="Label kecil" value={at("education").eyebrow} onChange={v => set("education", { ...at("education"), eyebrow: v })} />
        <div className="ad-grid2">
          <Field label="Judul baris 1" value={at("education").titleLead} onChange={v => set("education", { ...at("education"), titleLead: v })} />
          <Field label="Judul baris 2" value={at("education").titleBreak} onChange={v => set("education", { ...at("education"), titleBreak: v })} />
        </div>
        <Area label="Kalimat pengantar" rows={2} value={at("education").lead} onChange={v => set("education", { ...at("education"), lead: v })} />
        <Field label="Pita atas kartu" value={at("education").label} onChange={v => set("education", { ...at("education"), label: v })} />
        <Field label="Gelar" value={at("education").degree} onChange={v => set("education", { ...at("education"), degree: v })} />
        <Field label="Institusi" value={at("education").school} onChange={v => set("education", { ...at("education"), school: v })} />
        <Area label="Deskripsi kartu" rows={3} value={at("education").description} onChange={v => set("education", { ...at("education"), description: v })} />
        <Field label="Teks segel" value={at("education").seal} onChange={v => set("education", { ...at("education"), seal: v })} />
        <Repeat
          label="Angka kecil"
          items={at("education").meta}
          onChange={v => set("education", { ...at("education"), meta: v })}
          titleOf={(m, i) => m.value || `Angka ${i + 1}`}
          fields={[
            { key: "value", label: "Nilai", kind: "text" },
            { key: "label", label: "Keterangan", kind: "text" },
          ]}
          newItem={() => ({ value: "", label: "" })}
        />
      </section>

      {/* ── EXPERIENCE ── */}
      <section className="ad-sec">
        <h3>Pengalaman</h3>
        <Field label="Label kecil" value={at("experience").eyebrow} onChange={v => set("experience", { ...at("experience"), eyebrow: v })} />
        <Field label="Judul" value={at("experience").title} onChange={v => set("experience", { ...at("experience"), title: v })} />
        <Area label="Kalimat pengantar" rows={2} value={at("experience").lead} onChange={v => set("experience", { ...at("experience"), lead: v })} />
        <Repeat
          label="Penempatan"
          items={at("experience").items}
          onChange={v => set("experience", { ...at("experience"), items: v })}
          titleOf={(it, i) => it.title || `Penempatan ${i + 1}`}
          fields={[
            { key: "date", label: "Periode", kind: "text" },
            { key: "title", label: "Instansi & unit", kind: "text" },
            { key: "bullets", label: "Tanggung jawab", kind: "lines" },
          ]}
          newItem={() => ({ date: "", title: "", bullets: [""] })}
        />
      </section>

      {/* ── CERTS ── */}
      <section className="ad-sec">
        <h3>Sertifikat</h3>
        <Field label="Label kecil" value={at("certs").eyebrow} onChange={v => set("certs", { ...at("certs"), eyebrow: v })} />
        <Field label="Judul" value={at("certs").title} onChange={v => set("certs", { ...at("certs"), title: v })} />
        <Area label="Kalimat pengantar" rows={2} value={at("certs").lead} onChange={v => set("certs", { ...at("certs"), lead: v })} />
        <Repeat
          label="Sertifikat"
          items={at("certs").items}
          onChange={v => set("certs", { ...at("certs"), items: v })}
          titleOf={(it, i) => it.title || `Sertifikat ${i + 1}`}
          fields={[
            { key: "icon", label: "Emoji", kind: "text", placeholder: "💉" },
            { key: "title", label: "Nama pelatihan", kind: "text" },
            { key: "date", label: "Tanggal", kind: "text" },
          ]}
          newItem={() => ({ icon: "📜", title: "", date: "" })}
        />
        <Field label="Label organisasi" value={at("certs").orgsLabel} onChange={v => set("certs", { ...at("certs"), orgsLabel: v })} />
        <StringList label="Organisasi" items={at("certs").orgs} onChange={v => set("certs", { ...at("certs"), orgs: v })} />
      </section>

      {/* ── GALLERY ── */}
      <section className="ad-sec">
        <h3>Galeri (teks)</h3>
        <Field label="Label kecil" value={at("gallery").eyebrow} onChange={v => set("gallery", { ...at("gallery"), eyebrow: v })} />
        <Field label="Judul" value={at("gallery").title} onChange={v => set("gallery", { ...at("gallery"), title: v })} />
        <Area label="Kalimat pengantar" rows={2} value={at("gallery").lead} onChange={v => set("gallery", { ...at("gallery"), lead: v })} />
        <p className="ad-note">Foto galeri diatur di tab “Media”.</p>
      </section>

      {/* ── CONTACT ── */}
      <section className="ad-sec">
        <h3>Kontak</h3>
        <Field label="Label kecil" value={at("contact").eyebrow} onChange={v => set("contact", { ...at("contact"), eyebrow: v })} />
        <div className="ad-grid2">
          <Field label="Judul baris 1" value={at("contact").titleLead} onChange={v => set("contact", { ...at("contact"), titleLead: v })} />
          <Field label="Judul baris 2" value={at("contact").titleAccent} onChange={v => set("contact", { ...at("contact"), titleAccent: v })} />
        </div>
        <Area label="Kalimat pengantar" rows={3} value={at("contact").lead} onChange={v => set("contact", { ...at("contact"), lead: v })} />
        <Field label="Teks tombol kirim" value={at("contact").submitLabel} onChange={v => set("contact", { ...at("contact"), submitLabel: v })} />
        <Area label="Catatan di bawah form" rows={2} value={at("contact").formNote} onChange={v => set("contact", { ...at("contact"), formNote: v })} />
        <Repeat
          label="Tautan kontak"
          items={at("contact").links}
          onChange={v => set("contact", { ...at("contact"), links: v })}
          titleOf={(it, i) => it.label || `Tautan ${i + 1}`}
          fields={[
            { key: "label", label: "Label", kind: "text" },
            { key: "sub", label: "Teks kecil", kind: "text" },
            { key: "href", label: "Alamat", kind: "text", placeholder: "https://" },
            {
              key: "icon",
              label: "Ikon",
              kind: "text",
              placeholder: "email | whatsapp | instagram",
            },
          ]}
          newItem={() => ({ label: "", sub: "", href: "", icon: "email" as const })}
        />
      </section>

      {/* ── FOOTER ── */}
      <section className="ad-sec">
        <h3>Footer</h3>
        <Field label="Baris 1" value={at("footer").copyright} onChange={v => set("footer", { ...at("footer"), copyright: v })} />
        <Field label="Baris 2" value={at("footer").line2} onChange={v => set("footer", { ...at("footer"), line2: v })} />
        <p className="ad-note">
          Nomor WhatsApp untuk form ada di <code>src/lib/content/defaults.ts</code> (konstanta{" "}
          <code>WHATSAPP_NUMBER</code>).
        </p>
      </section>
    </div>
  );
}