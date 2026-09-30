"use client";

import type { SiteContent } from "@/lib/content/types";
import { Area, Field, Repeat, StringList } from "./fields";
import { SECTIONS, type SectionId } from "./sections";

export default function ContentEditor({
  section,
  value,
  onChange,
}: {
  section: SectionId;
  value: SiteContent;
  onChange: (v: SiteContent) => void;
}) {
  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) =>
    onChange({ ...value, [k]: v });
  const at = <K extends keyof SiteContent>(k: K) => value[k];

  const meta = SECTIONS.find(s => s.id === section)!;

  return (
    <div className="ad-pane">
      <header className="ad-pane-head">
        <span className="ad-pane-icon" aria-hidden="true">{meta.icon}</span>
        <div>
          <h2>{meta.label}</h2>
          <p>{meta.hint}</p>
        </div>
      </header>

      <div className="ad-pane-body">
        {section === "meta" && (
          <>
            <Group title="SEO">
              <Field label="Judul halaman" value={at("meta").title}
                hint="Muncul di tab browser dan hasil pencarian."
                onChange={v => set("meta", { ...at("meta"), title: v })} />
              <Area label="Deskripsi" rows={3} value={at("meta").description}
                hint={`${at("meta").description.length} karakter. Idealnya 120–160.`}
                onChange={v => set("meta", { ...at("meta"), description: v })} />
            </Group>
            <Group title="Navigasi">
              <div className="ad-grid2">
                <Field label="Logo" value={at("nav").logo} onChange={v => set("nav", { ...at("nav"), logo: v })} />
                <Field label="Teks tombol" value={at("nav").cta} onChange={v => set("nav", { ...at("nav"), cta: v })} />
              </div>
              <p className="ad-note">
                Daftar menu mengikuti urutan section di halaman. Untuk menambah atau menghapus
                menu, ubah section-nya di kode.
              </p>
            </Group>
          </>
        )}

        {section === "hero" && (
          <>
            <Group title="Identitas">
              <Field label="Label kecil" value={at("hero").eyebrow} onChange={v => set("hero", { ...at("hero"), eyebrow: v })} />
              <div className="ad-grid3">
                <Field label="Nama depan" value={at("hero").firstName} onChange={v => set("hero", { ...at("hero"), firstName: v })} />
                <Field label="Nama tengah" value={at("hero").secondName} onChange={v => set("hero", { ...at("hero"), secondName: v })} />
                <Field label="Nama belakang" value={at("hero").lastName} onChange={v => set("hero", { ...at("hero"), lastName: v })} />
              </div>
              <Area label="Deskripsi panjang" rows={5} value={at("hero").subtitle} onChange={v => set("hero", { ...at("hero"), subtitle: v })} />
            </Group>
            <Group title="Tombol">
              <div className="ad-grid2">
                <Field label="Teks tombol utama" value={at("hero").ctaPrimary} onChange={v => set("hero", { ...at("hero"), ctaPrimary: v })} />
                <Field label="Tautan tombol utama" value={at("hero").ctaPrimaryHref} hint="mis. #experience" onChange={v => set("hero", { ...at("hero"), ctaPrimaryHref: v })} />
                <Field label="Teks tombol kedua" value={at("hero").ctaSecondary} onChange={v => set("hero", { ...at("hero"), ctaSecondary: v })} />
                <Field label="Tautan tombol kedua" value={at("hero").ctaSecondaryHref} hint="mis. #contact" onChange={v => set("hero", { ...at("hero"), ctaSecondaryHref: v })} />
              </div>
            </Group>
          </>
        )}

        {section === "about" && (
          <>
            <Group title="Judul bagian">
              <Field label="Label kecil" value={at("about").eyebrow} onChange={v => set("about", { ...at("about"), eyebrow: v })} />
              <div className="ad-grid2">
                <Field label="Baris pertama" value={at("about").titleLead} onChange={v => set("about", { ...at("about"), titleLead: v })} />
                <Field label="Kata yang dicetak miring" value={at("about").titleAccent} onChange={v => set("about", { ...at("about"), titleAccent: v })} />
              </div>
            </Group>
            <Group title="Isi">
              <StringList label="Paragraf" items={at("about").paragraphs} onChange={v => set("about", { ...at("about"), paragraphs: v })} hint="Satu paragraf per baris. Baris kosong dihapus." />
            </Group>
            <Group title="Keahlian">
              <StringList label="Chip keahlian" items={at("about").chips} onChange={v => set("about", { ...at("about"), chips: v })} hint="Tampil sebagai label di bawah paragraf." />
            </Group>
            <Group title="Badge foto">
              <div className="ad-grid2">
                <Field label="Angka badge bawah" value={at("about").badgeBottom.value} onChange={v => set("about", { ...at("about"), badgeBottom: { ...at("about").badgeBottom, value: v } })} />
                <Field label="Keterangan badge bawah" value={at("about").badgeBottom.label} onChange={v => set("about", { ...at("about"), badgeBottom: { ...at("about").badgeBottom, label: v } })} />
                <Field label="Angka badge atas" value={at("about").badgeTop.value} onChange={v => set("about", { ...at("about"), badgeTop: { ...at("about").badgeTop, value: v } })} />
                <Field label="Keterangan badge atas" value={at("about").badgeTop.label} onChange={v => set("about", { ...at("about"), badgeTop: { ...at("about").badgeTop, label: v } })} />
              </div>
            </Group>
          </>
        )}

        {section === "education" && (
          <>
            <Group title="Judul bagian">
              <Field label="Label kecil" value={at("education").eyebrow} onChange={v => set("education", { ...at("education"), eyebrow: v })} />
              <div className="ad-grid2">
                <Field label="Baris pertama" value={at("education").titleLead} onChange={v => set("education", { ...at("education"), titleLead: v })} />
                <Field label="Baris kedua" value={at("education").titleBreak} onChange={v => set("education", { ...at("education"), titleBreak: v })} />
              </div>
              <Area label="Kalimat pengantar" rows={2} value={at("education").lead} onChange={v => set("education", { ...at("education"), lead: v })} />
            </Group>
            <Group title="Isi kartu">
              <div className="ad-grid2">
                <Field label="Pita atas" value={at("education").label} onChange={v => set("education", { ...at("education"), label: v })} />
                <Field label="Teks segel" value={at("education").seal} hint="Tampil di lingkaran emas." onChange={v => set("education", { ...at("education"), seal: v })} />
              </div>
              <Field label="Gelar" value={at("education").degree} onChange={v => set("education", { ...at("education"), degree: v })} />
              <Field label="Institusi" value={at("education").school} onChange={v => set("education", { ...at("education"), school: v })} />
              <Area label="Deskripsi" rows={3} value={at("education").description} onChange={v => set("education", { ...at("education"), description: v })} />
            </Group>
            <Group title="Angka kecil">
              <Repeat
                label="Angka"
                items={at("education").meta}
                onChange={v => set("education", { ...at("education"), meta: v })}
                titleOf={(m, i) => m.value || `Angka ${i + 1}`}
                fields={[
                  { key: "value", label: "Nilai", kind: "text" },
                  { key: "label", label: "Keterangan", kind: "text" },
                ]}
                newItem={() => ({ value: "", label: "" })}
              />
            </Group>
          </>
        )}

        {section === "experience" && (
          <>
            <Group title="Judul bagian">
              <Field label="Label kecil" value={at("experience").eyebrow} onChange={v => set("experience", { ...at("experience"), eyebrow: v })} />
              <Field label="Judul" value={at("experience").title} onChange={v => set("experience", { ...at("experience"), title: v })} />
              <Area label="Kalimat pengantar" rows={2} value={at("experience").lead} onChange={v => set("experience", { ...at("experience"), lead: v })} />
            </Group>
            <Group title="Penempatan klinis">
              <Repeat
                label="Penempatan"
                items={at("experience").items}
                onChange={v => set("experience", { ...at("experience"), items: v })}
                titleOf={(it, i) => it.title || `Penempatan ${i + 1}`}
                fields={[
                  { key: "date", label: "Periode", kind: "text", placeholder: "mis. Juni – Juli 2025" },
                  { key: "title", label: "Instansi dan unit", kind: "text", placeholder: "mis. RSUD Indramayu · Rawat Inap" },
                  { key: "bullets", label: "Tanggung jawab", kind: "lines" },
                ]}
                newItem={() => ({ date: "", title: "", bullets: [""] })}
              />
            </Group>
          </>
        )}

        {section === "certs" && (
          <>
            <Group title="Judul bagian">
              <Field label="Label kecil" value={at("certs").eyebrow} onChange={v => set("certs", { ...at("certs"), eyebrow: v })} />
              <Field label="Judul" value={at("certs").title} onChange={v => set("certs", { ...at("certs"), title: v })} />
              <Area label="Kalimat pengantar" rows={2} value={at("certs").lead} onChange={v => set("certs", { ...at("certs"), lead: v })} />
            </Group>
            <Group title="Daftar pelatihan">
              <Repeat
                label="Sertifikat"
                items={at("certs").items}
                onChange={v => set("certs", { ...at("certs"), items: v })}
                titleOf={(it, i) => it.title || `Sertifikat ${i + 1}`}
                fields={[
                  { key: "icon", label: "Emoji", kind: "text", placeholder: "💉" },
                  { key: "title", label: "Nama pelatihan", kind: "text" },
                  { key: "date", label: "Tanggal", kind: "text", placeholder: "mis. Juni 2026" },
                ]}
                newItem={() => ({ icon: "📜", title: "", date: "" })}
              />
            </Group>
            <Group title="Organisasi">
              <Field label="Label kelompok" value={at("certs").orgsLabel} onChange={v => set("certs", { ...at("certs"), orgsLabel: v })} />
              <StringList label="Anggota" items={at("certs").orgs} onChange={v => set("certs", { ...at("certs"), orgs: v })} />
            </Group>
          </>
        )}

        {section === "gallery" && (
          <Group title="Judul bagian">
            <Field label="Label kecil" value={at("gallery").eyebrow} onChange={v => set("gallery", { ...at("gallery"), eyebrow: v })} />
            <Field label="Judul" value={at("gallery").title} onChange={v => set("gallery", { ...at("gallery"), title: v })} />
            <Area label="Kalimat pengantar" rows={2} value={at("gallery").lead} onChange={v => set("gallery", { ...at("gallery"), lead: v })} />
            <p className="ad-note">
              Foto galeri diatur di tab <b>Foto &amp; stiker</b>. Ukuran, urutan, dan keterangan
              setiap foto diatur dari sana.
            </p>
          </Group>
        )}

        {section === "contact" && (
          <>
            <Group title="Judul bagian">
              <Field label="Label kecil" value={at("contact").eyebrow} onChange={v => set("contact", { ...at("contact"), eyebrow: v })} />
              <div className="ad-grid2">
                <Field label="Baris pertama" value={at("contact").titleLead} onChange={v => set("contact", { ...at("contact"), titleLead: v })} />
                <Field label="Bagian yang dicetak miring" value={at("contact").titleAccent} onChange={v => set("contact", { ...at("contact"), titleAccent: v })} />
              </div>
              <Area label="Kalimat pengantar" rows={3} value={at("contact").lead} onChange={v => set("contact", { ...at("contact"), lead: v })} />
            </Group>
            <Group title="Form">
              <Field label="Teks tombol kirim" value={at("contact").submitLabel} onChange={v => set("contact", { ...at("contact"), submitLabel: v })} />
              <Area label="Catatan di bawah form" rows={2} value={at("contact").formNote} onChange={v => set("contact", { ...at("contact"), formNote: v })} />
            </Group>
            <Group title="Tautan kontak">
              <Repeat
                label="Tautan"
                items={at("contact").links}
                onChange={v => set("contact", { ...at("contact"), links: v })}
                titleOf={(it, i) => it.label || `Tautan ${i + 1}`}
                fields={[
                  { key: "label", label: "Label", kind: "text" },
                  { key: "sub", label: "Teks kecil", kind: "text" },
                  { key: "href", label: "Alamat", kind: "text", placeholder: "https:// atau mailto:" },
                  { key: "icon", label: "Ikon", kind: "text", placeholder: "email | whatsapp | instagram" },
                ]}
                newItem={() => ({ label: "", sub: "", href: "", icon: "email" as const })}
              />
            </Group>
          </>
        )}

        {section === "footer" && (
          <Group title="Teks footer">
            <Field label="Baris pertama" value={at("footer").copyright} onChange={v => set("footer", { ...at("footer"), copyright: v })} />
            <Field label="Baris kedua" value={at("footer").line2} onChange={v => set("footer", { ...at("footer"), line2: v })} />
            <p className="ad-note">
              Nomor WhatsApp untuk form ada di <code>src/lib/content/defaults.ts</code> — konstanta{" "}
              <code>WHATSAPP_NUMBER</code>. Ubah di sana lalu restart server.
            </p>
          </Group>
        )}
      </div>
    </div>
  );
}

/* ── Pembatas kelompok field ── */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ad-group-box">
      <h3 className="ad-group-title">{title}</h3>
      <div className="ad-group-fields">{children}</div>
    </section>
  );
}