import type { SiteContent, SiteMedia } from "./types";

export const WHATSAPP_NUMBER = "6289697007035";

export const DEFAULT_CONTENT: SiteContent = {
  meta: {
    title: "Nabilah Aisha Syahada — Perawat Profesional",
    description:
      "Portofolio profesional Nabilah Aisha Syahada, lulusan D3 Keperawatan dengan pengalaman praktik klinik di lima institusi layanan kesehatan.",
  },

  nav: {
    logo: "nabilah",
    items: [
      { id: "hero", label: "beranda" },
      { id: "about", label: "tentang" },
      { id: "education", label: "pendidikan" },
      { id: "experience", label: "pengalaman" },
      { id: "certs", label: "sertifikat" },
      { id: "gallery", label: "momen" },
    ],
    cta: "Hubungi",
  },

  hero: {
    eyebrow: "Perawat Profesional · Lulusan D3 Keperawatan",
    firstName: "Nabilah",
    secondName: "Aisha",
    lastName: "Syahada",
    subtitle:
      "Perawat berijazah D3 dengan pengalaman praktik klinik di lima unit layanan kesehatan — dari kegawatdaruratan IGD & ICU, rawat inap, dan psikiatri, hingga maternitas serta geriatri. Terlatih menjalankan shift panjang dengan standar prosedur yang konsisten, mendokumentasikan tindakan secara akurat, dan membangun komunikasi terapeutik yang efektif dengan pasien maupun tim medis.",
    ctaPrimary: "Lihat Rekam Jejak",
    ctaPrimaryHref: "#experience",
    ctaSecondary: "Hubungi Saya",
    ctaSecondaryHref: "#contact",
  },

  about: {
    eyebrow: "01 — Tentang saya",
    titleLead: "Asuhan yang akurat,",
    titleAccent: "manusiawi",
    paragraphs: [
      "Saya menjalankan asuhan keperawatan dengan ketelitian tinggi di lingkungan yang serba cepat: mengukur dan menafsirkan tanda vital, mengambil keputusan klinis dalam waktu terbatas, serta menyusun dokumentasi yang dapat ditelusuri kembali. Lima penempatan klinis membiasakan saya bekerja dengan standar yang seragam dan di bawah tekanan operasional nyata.",
      "Selain kompetensi teknis, saya menempatkan porsi besar pada hal yang paling sering membentuk pengalaman pasien: komunikasi terapeutik, edukasi kesehatan yang mudah dipahami, dan kolaborasi lintas profesi. Perawat adalah titik kontak pertama pasien dengan sistem layanan kesehatan — karena itu kejelasan dan kelembutan dalam menjelaskan adalah bagian dari pekerjaan, bukan pelengkap.",
    ],
    chips: [
      "Asuhan Keperawatan",
      "Komunikasi Terapeutik",
      "Edukasi Kesehatan",
      "Dokumentasi Asuhan",
      "Manajemen Waktu & Prioritas",
      "Penyelesaian Masalah",
      "Kolaborasi Tim",
      "Penanganan Kegawatdaruratan (BTCLS)",
    ],
    badgeBottom: { value: "2026", label: "Lulusan D3 Keperawatan Polindra" },
    badgeTop: { value: "3.66", label: "IPK Terbaik" },
  },

  education: {
    eyebrow: "02 — Pendidikan",
    titleLead: "Latar Belakang",
    titleBreak: "Akademik",
    lead: "Perjalanan studi yang membentuk kompetensi dan karakter profesional.",
    label: "Gelar Sarjana Terapan",
    degree: "D3 Keperawatan",
    school: "Politeknik Negeri Indramayu (Polindra)",
    meta: [
      { value: "2023 – 2026", label: "Periode studi" },
      { value: "3.66", label: "IPK" },
      { value: "5", label: "Institusi praktik" },
    ],
    description:
      "Lulusan dengan IPK di atas rata-rata. Aktif dalam tiga organisasi kemahasiswaan dan telah menyelesaikan praktik klinik di lima institusi layanan kesehatan.",
    seal: "LULUS",
  },

  experience: {
    eyebrow: "03 — Rekam jejak klinik",
    title: "Pengalaman Praktik Klinik",
    lead: "Lima penempatan klinis di lima unit berbeda — mulai dari kegawatdaruratan dan rawat inap hingga maternitas, geriatri, dan psikiatri.",
    items: [
      {
        date: "Juni – Juli 2025",
        title: "RSUD Indramayu · Rawat Inap",
        bullets: [
          "Asuhan keperawatan komprehensif kepada pasien rawat inap",
          "Observasi tanda vital dan tindakan intervensi sesuai rencana asuhan",
        ],
      },
      {
        date: "Agustus 2025",
        title: "RSUD Bayu Asih · IGD & ICU",
        bullets: [
          "Triase dan tindakan awal pada pasien kegawatdaruratan",
          "Penanganan kegawatdaruratan sesuai standar BTCLS",
        ],
      },
      {
        date: "Agustus – September 2025",
        title: "RPSLU Pucang Gading, Semarang",
        bullets: [
          "Asuhan keperawatan pada pasien geriatric dengan penyakit klinis kronis",
          "Pendampingan aktivitas harian dan pemantauan berkala",
        ],
      },
      {
        date: "September 2025",
        title: "RSJ Provinsi Jawa Barat",
        bullets: [
          "Asuhan keperawatan pada pasien gangguan jiwa",
          "Fasilitator Terapi Aktivitas Kelompok (TAK)",
        ],
      },
      {
        date: "Oktober – Desember 2025",
        title: "RSD Gunung Jati, Cirebon · Maternitas",
        bullets: [
          "Asuhan maternitas pada ANC, INC, dan PNC",
          "Asisten persalinan dan persiapan prosedur operasi sesuai SOP",
        ],
      },
    ],
  },

  certs: {
    eyebrow: "04 — Sertifikasi & Pelatihan",
    title: "Bekal & Legalitas Klinis",
    lead: "Berkas sertifikat akan segera dibagikan di sini.",
    items: [
      { icon: "💉", title: "Basic Trauma & Cardiac Life Support (BTCLS)", date: "Juni 2026" },
      { icon: "🧼", title: "Pelatihan Pencegahan & Pengendalian Infeksi", date: "Mei 2025" },
      { icon: "📋", title: "Webinar Bedah Soal UKOM", date: "Feb 2025" },
    ],
    orgsLabel: "Organisasi",
    orgs: [
      "KOTAK PENA — Bendahara Umum",
      "FORMADIKSI — Anggota Divisi",
      "REMAIS — Anggota Aktif",
    ],
  },

  gallery: {
    eyebrow: "05 — Dokumentasi",
    title: "Momen & Kegiatan",
    lead: "Potongan dokumentasi selama praktik klinik.",
  },

  contact: {
    eyebrow: "06 — Kontak",
    titleLead: "Tersedia untuk",
    titleAccent: "Peluang Karier Anda",
    lead: "Di fasilitas kesehatan, rumah sakit, klinik, maupun layanan medis lainnya. Hubungi langsung lewat WhatsApp, email, atau Instagram — saya akan membalas segera.",
    links: [
      {
        label: "Email",
        sub: "nabilaaishavivo@gmail.com",
        href: "mailto:nabilaaishavivo@gmail.com",
        icon: "email",
      },
      {
        label: "WhatsApp",
        sub: "+62 896-9700-7035",
        href: `https://wa.me/${WHATSAPP_NUMBER}`,
        icon: "whatsapp",
      },
      {
        label: "Instagram",
        sub: "@bilaaishaa_",
        href: "https://instagram.com/bilaaishaa_",
        icon: "instagram",
      },
    ],
    formNote: "Form ini membuka WhatsApp dengan pesan yang sudah terisi otomatis.",
    submitLabel: "Kirim via WhatsApp",
  },

  footer: {
    copyright: "© 2026 NABILAH AISHA SYAHADA",
    line2: "Perawat D3 Keperawatan · Polindra · Indramayu",
  },
};

/* ════════════════════════════════════════════════════════════
   Media default — persis seperti yang ada di JSX sekarang.
   Media ini otomatis digantikan begitu admin mengunggah /
   menyimpan lewat halaman admin.
   ════════════════════════════════════════════════════════════ */

type StickerSeed = [
  slot: string,
  file: string,
  width: number,
  dataSpeed: number,
  rotate: number,
  opacity: number,
  pos: Partial<Pick<SiteMedia, "top" | "bottom" | "left" | "right">>,
];

const STICKER_SEEDS: StickerSeed[] = [
  ["about",     "/p1.jpg",  280, -180,  12, 0.85, { top: "5%",  right: "4%" }],
  ["about",     "/p2.jpg",  200,  120, -10, 0.7,  { bottom: "8%", left: "3%" }],
  ["about",     "/p8.jpg",  160,  150, -18, 0.8,  { top: "40%", right: "12%" }],
  ["about",     "/p9.jpg",  180, -120,  14, 0.9,  { bottom: "25%", left: "8%" }],

  ["experience", "/p3.jpg",  240, -200,  -8, 0.8,  { top: "25%", left: "2%" }],
  ["experience", "/p4.jpg",  220,  160,  15, 0.85, { bottom: "10%", right: "5%" }],
  ["experience", "/p10.jpg", 200, -150,  22, 0.75, { top: "65%", left: "10%" }],
  ["experience", "/p11.jpg", 180,  130, -12, 0.9,  { top: "10%", right: "8%" }],

  ["certs",     "/p5.jpg",  250, -150, -12, 0.9,  { top: "15%", right: "3%" }],
  ["certs",     "/p12.jpg", 200,  140,   8, 0.85, { bottom: "5%", left: "6%" }],

  ["gallery",   "/p6.jpg",  300,  180,  10, 0.8,  { top: "8%",  left: "4%" }],
  ["gallery",   "/p7.jpg",  280, -160, -15, 0.9,  { bottom: "6%", right: "4%" }],
  ["gallery",   "/p13.jpg", 210,  120,  20, 0.75, { top: "45%", right: "8%" }],
  ["gallery",   "/p14.jpg", 230, -140, -18, 0.85, { bottom: "25%", left: "5%" }],
];

const GALLERY_SEEDS = [
  { tag: "RSUD Indramayu", title: "Rawat Inap",  src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&q=80" },
  { tag: "IGD & ICU",      title: "Bayu Asih",    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80" },
  { tag: "Geriatri",       title: "Pucang Gading", src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80" },
  { tag: "Kes. Jiwa",      title: "RSJ Jawa Barat", src: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=700&q=80" },
  { tag: "Maternitas",     title: "Gunung Jati",  src: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=700&q=80" },
];

export const DEFAULT_MEDIA: SiteMedia[] = [
  {
    id: "default-profile",
    kind: "profile",
    slot: "about",
    url: "/foto-nabilah.jpg",
    alt: "Nabilah Aisha Syahada",
    tag: "",
    title: "",
    sortOrder: 0,
    dataSpeed: 0,
    width: 0,
    top: "",
    bottom: "",
    left: "",
    right: "",
    rotate: 0,
    opacity: 1,
  },
  {
    id: "default-hero",
    kind: "hero",
    slot: "hero",
    url: "/mascot.jpg",
    alt: "3D Cute Nurse Mascot",
    tag: "",
    title: "",
    sortOrder: 0,
    dataSpeed: 0,
    width: 0,
    top: "",
    bottom: "",
    left: "",
    right: "",
    rotate: 0,
    opacity: 1,
  },
  ...STICKER_SEEDS.map(
    ([slot, url, width, dataSpeed, rotate, opacity, pos], i): SiteMedia => ({
      id: `default-sticker-${i}`,
      kind: "sticker",
      slot,
      url,
      alt: "stiker dekoratif",
      tag: "",
      title: "",
      sortOrder: i,
      dataSpeed,
      width,
      top: pos.top ?? "",
      bottom: pos.bottom ?? "",
      left: pos.left ?? "",
      right: pos.right ?? "",
      rotate,
      opacity,
    }),
  ),
  ...GALLERY_SEEDS.map(
    (g, i): SiteMedia => ({
      id: `default-gallery-${i}`,
      kind: "gallery",
      slot: "gallery",
      url: g.src,
      alt: g.title,
      tag: g.tag,
      title: g.title,
      sortOrder: i,
      dataSpeed: 0,
      width: 0,
      top: "",
      bottom: "",
      left: "",
      right: "",
      rotate: 0,
      opacity: 1,
    }),
  ),
];