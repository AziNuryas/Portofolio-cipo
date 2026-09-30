export type MediaKind = "profile" | "hero" | "sticker" | "gallery";

export type NavItem = { id: string; label: string };

export type ContactIcon = "email" | "whatsapp" | "instagram";

export type SiteContent = {
  meta: { title: string; description: string };
  nav: { logo: string; items: NavItem[]; cta: string };

  hero: {
    eyebrow: string;
    firstName: string;
    secondName: string;
    lastName: string;
    subtitle: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };

  about: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    paragraphs: string[];
    chips: string[];
    badgeBottom: { value: string; label: string };
    badgeTop: { value: string; label: string };
  };

  education: {
    eyebrow: string;
    titleLead: string;
    titleBreak: string;
    lead: string;
    label: string;
    degree: string;
    school: string;
    meta: { value: string; label: string }[];
    description: string;
    seal: string;
  };

  experience: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { date: string; title: string; bullets: string[] }[];
  };

  certs: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { icon: string; title: string; date: string }[];
    orgsLabel: string;
    orgs: string[];
  };

  gallery: { eyebrow: string; title: string; lead: string };

  contact: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lead: string;
    links: { label: string; sub: string; href: string; icon: ContactIcon }[];
    formNote: string;
    submitLabel: string;
  };

  footer: { copyright: string; line2: string };
};

export type SiteMedia = {
  id: string;
  kind: MediaKind;
  slot: string;
  url: string;
  alt: string;
  tag: string;
  title: string;
  sortOrder: number;
  dataSpeed: number;
  width: number;
  top: string;
  bottom: string;
  left: string;
  right: string;
  rotate: number;
  opacity: number;
};

export type SiteData = {
  content: SiteContent;
  media: SiteMedia[];
  /** true = data berasal dari Supabase, false = memakai default lokal. */
  fromDatabase: boolean;
};

/* ── Bentuk data yang datang dari database (snake_case) ── */
export type MediaRow = {
  id: string;
  kind: string;
  slot: string | null;
  url: string;
  alt: string | null;
  tag: string | null;
  title: string | null;
  sort_order: number | null;
  data_speed: number | null;
  width: number | null;
  top: string | null;
  bottom: string | null;
  left: string | null;
  right: string | null;
  rotate: number | null;
  opacity: number | null;
};