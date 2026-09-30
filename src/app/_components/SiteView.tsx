"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { ContactIcon, SiteContent, SiteMedia } from "@/lib/content/types";
import { WHATSAPP_NUMBER } from "@/lib/content/defaults";

/* ─── Ikon kontak ─── */
const CONTACT_ICONS: Record<ContactIcon, React.ReactElement> = {
  email: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  whatsapp: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  instagram: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
};

/* ─── Stiker dekoratif, posisinya diatur dari halaman admin ─── */
function Sticker({ m }: { m: SiteMedia }) {
  return (
    <div
      className="bg-sticker"
      data-speed={m.dataSpeed}
      style={{
        width: m.width || 200,
        top: m.top || undefined,
        bottom: m.bottom || undefined,
        left: m.left || undefined,
        right: m.right || undefined,
        transform: `rotate(${m.rotate}deg)`,
        opacity: m.opacity,
      }}
    >
      <img src={m.url} loading="lazy" alt={m.alt || "stiker dekoratif"} />
    </div>
  );
}

export default function SiteView({
  content: c,
  media,
}: {
  content: SiteContent;
  media: SiteMedia[];
}) {
  const initialized = useRef(false);
  const cursorDot  = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ nama: "", pesan: "" });

  /* Semua isi visual bersumber dari database + default lokal. */
  const profile = media.find(m => m.kind === "profile");
  const heroArt = media.find(m => m.kind === "hero");
  const gallery = media
    .filter(m => m.kind === "gallery")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const stickers = (slot: string) =>
    media.filter(m => m.kind === "sticker" && m.slot === slot).map((m, i) => (
      <Sticker key={m.id || `sticker-${i}`} m={m} />
    ));

  const mobileNav = c.nav.items.filter(i => i.id !== "hero");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ═══ CUSTOM CURSOR ═══ */
    // Kursor sistem hanya dimatikan setelah kursor kustom benar-benar siap
    // (html.custom-cursor). Kalau JS gagal atau perangkatnya layar sentuh,
    // kursor asli tetap normal — tidak ada halaman tanpa kursor.
    const dot  = cursorDot.current;
    const ring = cursorRing.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let centered = false;
    let revealed = false;

    const moveCursor = (e: MouseEvent) => {
      if (!dot || !ring) return;

      if (!centered) {
        centered = true;
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
        // Snap ke posisi mouse saat pertama kali bergerak, supaya tidak
        // terlihat meleset dari pojok kiri atas.
        gsap.set(dot,  { x: e.clientX, y: e.clientY });
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        if (finePointer) document.documentElement.classList.add("custom-cursor");
      }
      if (!revealed) {
        revealed = true;
        dot.classList.add("is-visible");
        ring.classList.add("is-visible");
      }

      gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.08, ease: "none",       overwrite: "auto" });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    };

    const hideCursor = () => {
      dot?.classList.remove("is-visible");
      ring?.classList.remove("is-visible");
    };

    window.addEventListener("mousemove", moveCursor);
    document.documentElement.addEventListener("mouseleave", hideCursor);

    const hoverTargets = document.querySelectorAll("a, button, .bento-card, .cert-card");
    const activate   = () => document.body.classList.add("cursor-active");
    const deactivate = () => document.body.classList.remove("cursor-active");
    hoverTargets.forEach(el => {
      el.addEventListener("mouseenter", activate);
      el.addEventListener("mouseleave", deactivate);
    });

    /* ═══ LOADER ═══ */
    const loaderPath = document.getElementById("loader-path") as SVGPathElement | null;
    let pct = 0;
    const pctEl = document.getElementById("loader-percent");
    const pctInterval = setInterval(() => {
      pct = Math.min(pct + Math.random() * 12, 99);
      if (pctEl) pctEl.textContent = Math.round(pct) + "%";
    }, 120);

    if (loaderPath) {
      const len = loaderPath.getTotalLength();
      loaderPath.style.strokeDasharray = String(len);
      loaderPath.style.strokeDashoffset = String(len);
      gsap.timeline({
        onComplete: () => {
          clearInterval(pctInterval);
          if (pctEl) pctEl.textContent = "100%";
          gsap.to("#loader", {
            clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power4.inOut",
            onComplete: () => { const l = document.getElementById("loader"); if (l) l.style.display = "none"; }
          });
          heroIntro();
        }
      })
        .to(loaderPath, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
        .to(loaderPath, { strokeDashoffset: -len, duration: 1.4, ease: "power2.inOut" }, "+=.2");
    } else {
      heroIntro();
    }

    function heroIntro() {
      gsap.set("[data-reveal]", { opacity: 1 });

      // Split-text effect for hero name
      const heroName = document.querySelector("h1.hero-name");
      if (heroName) {
        const chars = heroName.querySelectorAll(".char");
        gsap.fromTo(chars,
          { y: 100, opacity: 0, rotateX: -60 },
          { y: 0, opacity: 1, rotateX: 0, stagger: .035, duration: .9, ease: "power4.out", delay: .2 }
        );
      }

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-inner .eyebrow", { y: 20, opacity: 0, duration: .7 }, .5)
        .from(".hero-sub",            { y: 30, opacity: 0, duration: .8 }, .9)
        .from(".hero-actions .btn",   { y: 20, opacity: 0, stagger: .1, duration: .6 }, 1.1)
        .from(".scroll-cue",          { opacity: 0, duration: .6 }, 1.5);
    }

    /* ═══ HERO VITAL HEARTBEAT ═══ */
    const heroPath = document.getElementById("hero-vital-path") as SVGPathElement | null;
    if (heroPath) {
      const hl = heroPath.getTotalLength();
      heroPath.style.strokeDasharray = String(hl);
      heroPath.style.strokeDashoffset = String(hl);
      gsap.to(heroPath, { strokeDashoffset: 0, duration: 2.8, ease: "power2.inOut", repeat: -1, repeatDelay: 1.5, yoyo: false });
    }

    /* ═══ DIVIDER DRAW ═══ */
    document.querySelectorAll<SVGPathElement>(".divider-vital path").forEach(p => {
      const dl = p.getTotalLength();
      p.style.strokeDasharray = String(dl); p.style.strokeDashoffset = String(dl);
      gsap.to(p, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: p, start: "top 90%", end: "top 40%", scrub: true } });
    });

    /* ═══ SCROLL PROGRESS BAR ═══ */
    const fill = document.getElementById("vital-progress-fill");
    if (fill) fill.style.transform = "scaleX(0)";
    gsap.to("#vital-progress-fill", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .3 } });

    /* ═══ PARALLAX ORBS ═══ */
    gsap.to(".hero-gradient-orb.o1", { y: 130, x: -50, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: .8 } });
    gsap.to(".hero-gradient-orb.o2", { y: -100, x: 60, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: .8 } });
    gsap.to(".hero-inner",  { y: -80, scale: .95, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: .4 } });
    gsap.to("#hero-vital",  { opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "25% top", end: "bottom top", scrub: .4 } });
    gsap.to(".photo-frame", { rotate: -3, y: -30, ease: "none", scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: .7 } });



    /* ═══ REVEAL ON SCROLL (general) ═══ */
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 87%", toggleActions: "play none none none" } });
    });

    /* ═══ CERT CARDS — 3D TILT ═══ */
    gsap.from(".cert-card", { y: 60, opacity: 0, duration: .8, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".cert-grid", start: "top 82%" } });
    document.querySelectorAll<HTMLElement>(".cert-card").forEach(card => {
      card.addEventListener("mousemove", (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y / r.height) - .5) * -16;
        const ry = ((x / r.width)  - .5) * 16;
        gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.04, duration: .3, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: .6, ease: "power2.out" });
      });
    });
    gsap.utils.toArray<HTMLElement>(".cert-icon").forEach((icon, i) => {
      gsap.from(icon, { scale: 0, rotate: -30, duration: .6, ease: "back.out(2)", delay: i * .06, scrollTrigger: { trigger: icon, start: "top 88%" } });
    });

    /* ═══ TIMELINE ═══ */
    gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item, i) => {
      gsap.fromTo(item, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: .85, delay: i * .08, ease: "power3.out", scrollTrigger: { trigger: ".timeline", start: "top 80%" } });
    });
    gsap.to("#tl-fill", { height: "100%", ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 72%", end: "bottom 68%", scrub: .7 } });

    /* ═══ BENTO GALLERY ═══ */
    gsap.from(".bento-card", { y: 60, opacity: 0, duration: .7, stagger: .08, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".bento-grid", start: "top 82%" } });

    /* ═══ SECTION HEADERS ═══ */
    gsap.utils.toArray<HTMLElement>(".sec-head").forEach(head => {
      gsap.fromTo(head, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: head, start: "top 88%", toggleActions: "play none none none" } });
    });

    /* ═══ CONTACT ═══ */
    gsap.from(".contact-links a", { y: 28, opacity: 0, duration: .7, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: "#contact", start: "top 78%" } });
    gsap.from(".contact-form-wrap", { x: 40, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: "#contact", start: "top 78%" } });

    /* ═══ NAV ACTIVE TRACKING ═══ */
    ["hero","about","education","experience","certs","gallery","contact"].forEach(id => {
      const el = document.getElementById(id); if (!el) return;
      ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(id), onEnterBack: () => setActive(id) });
    });
    function setActive(id: string) {
      document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.getAttribute("data-nav") === id));
    }

    /* ═══ MASCOT & BG STICKERS PARALLAX ═══ */
    gsap.to(".hero-mascot", { y: 180, ease: "none", force3D: true, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    
    // Animasi Parallax masal untuk stiker agar sangat ringan (60fps GPU Hardware Acceleration)
    gsap.utils.toArray<HTMLElement>(".bg-sticker").forEach(st => {
      const speed = Number(st.getAttribute("data-speed")) || 150;
      gsap.to(st, { 
        y: speed, 
        ease: "none", 
        force3D: true, 
        scrollTrigger: { trigger: st.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.5 } 
      });
    });

    /* ═══ SMOOTH SCROLL ═══ */
    document.querySelectorAll("a[href^='#']").forEach(a => {
      a.addEventListener("click", e => {
        const id = a.getAttribute("href");
        if (id && id.length > 1) { e.preventDefault(); gsap.to(window, { duration: 1.1, scrollTo: { y: id, offsetY: 70 }, ease: "power2.inOut" }); }
      });
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
      hoverTargets.forEach(el => {
        el.removeEventListener("mouseenter", activate);
        el.removeEventListener("mouseleave", deactivate);
      });
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  const openMenu = () => {
    gsap.to("#mobile-menu", { yPercent: 100, duration: .65, ease: "power3.inOut" });
    gsap.from("#mobile-menu li a", { y: 70, opacity: 0, stagger: .07, delay: .25, duration: .65, ease: "power3.out" });
  };
  const closeMenu = () => gsap.to("#mobile-menu", { yPercent: -100, duration: .5, ease: "power3.inOut" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = `Halo Nabilah!\n\nNama saya: ${form.nama.trim()}\n\n${form.pesan.trim()}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setForm({ nama: "", pesan: "" });
  };

  return (
    <>
      {/* Custom cursor */}
      <div className="cursor-dot"  ref={cursorDot}  />
      <div className="cursor-ring" ref={cursorRing} />

      {/* ── LOADER ── */}
      <div id="loader">
        <svg viewBox="0 0 220 60">
          <defs>
            <linearGradient id="lp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--rose-deep)" />
              <stop offset="100%" stopColor="var(--mint)" />
            </linearGradient>
          </defs>
          <path className="lp-line" id="loader-path" stroke="url(#lp-grad)"
            d="M0 30 L50 30 L60 8 L70 52 L80 18 L90 42 L100 30 L220 30" />
        </svg>
        <p>memuat rekam jejak...</p>
        <span className="loader-percent" id="loader-percent">0%</span>
      </div>

      {/* SCROLL PROGRESS */}
      <div id="vital-progress"><div id="vital-progress-fill" /></div>

      {/* ── NAV ── */}
      <nav>
        <div className="nav-logo">{c.nav.logo}<em>.</em></div>
        <ul>
          {c.nav.items.map(({ id, label }) => (
            <li key={id}><a href={`#${id}`} data-nav={id}>{label}</a></li>
          ))}
        </ul>
        <a href="#contact" className="nav-cta">{c.nav.cta} →</a>
        <button id="burger" aria-label="menu" onClick={openMenu}><span /></button>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-menu">
        <div className="close-m" onClick={closeMenu}>tutup ✕</div>
        <ul>
          {mobileNav.map(({ id, label }) => (
            <li key={id}><a href={`#${id}`} onClick={closeMenu}>{label}</a></li>
          ))}
          <li><a href="#contact" onClick={closeMenu}>Hubungi</a></li>
        </ul>
      </div>

      {/* ════════════ HERO ════════════ */}
      <header id="hero">
        <div className="hero-gradient-orb o1" />
        <div className="hero-gradient-orb o2" />
        <div className="hero-gradient-orb o3" />

        {/* heartbeat SVG */}
        <svg id="hero-vital" viewBox="0 0 1200 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vital-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--rose-deep)" />
              <stop offset="50%" stopColor="var(--rose)" />
              <stop offset="100%" stopColor="var(--mint)" />
            </linearGradient>
          </defs>
          <path id="hero-vital-path" d="M0 70 L240 70 L270 20 L300 120 L330 10 L360 130 L390 50 L420 70 L1200 70" />
        </svg>

        <div className="wrap hero-inner" style={{ position: 'relative', left: '-8%' }}>
          <span className="eyebrow">{c.hero.eyebrow}</span>
          <h1 className="hero-name" style={{ perspective: "800px" }}>
            {c.hero.firstName.split("").map((ch, i) => <span key={i} className="char">{ch}</span>)}
            {" "}{c.hero.secondName.split("").map((ch, i) => <span key={`a${i}`} className="char">{ch}</span>)}
            <br />
            <span className="accent">
              {c.hero.lastName.split("").map((ch, i) => <span key={`s${i}`} className="char">{ch}</span>)}
            </span>
          </h1>
          <p className="hero-sub" data-reveal="true">
            {c.hero.subtitle}
          </p>
          <div className="hero-actions">
            <a href={c.hero.ctaPrimaryHref} className="btn btn-solid">{c.hero.ctaPrimary} ↓</a>
            <a href={c.hero.ctaSecondaryHref} className="btn btn-ghost">{c.hero.ctaSecondary}</a>
          </div>
        </div>

        {/* 3D Mascot Illustration (Toco & Muku Style) */}
        <div className="hero-mascot">
          {heroArt && <img src={heroArt.url} alt={heroArt.alt || "Ilustrasi maskot"} />}
        </div>

        <div className="scroll-cue"><span>scroll</span><div className="line"><i /></div></div>
      </header>

      {/* ════════════ ABOUT ════════════ */}
      <section id="about" className="band-white">
        {stickers("about")}
        <div className="wrap about-grid">
          {/* Photo */}
          <div className="photo-wrap" data-reveal="true">
            <div className="photo-frame">
              <div className="ph-inner">
                {profile && <img src={profile.url} alt={profile.alt || c.hero.firstName}
                  onError={e => { e.currentTarget.style.display="none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display="flex"; }} />}
                <div className="ph-placeholder" style={{ display:"none" }}>
                  <span aria-hidden="true">🩺</span>
                  <small>foto menyusul</small>
                </div>
              </div>
            </div>
            <div className="photo-badge"><b>{c.about.badgeBottom.value}</b><span>{c.about.badgeBottom.label}</span></div>
            <div className="photo-badge-top"><b>{c.about.badgeTop.value}</b><span>{c.about.badgeTop.label}</span></div>
          </div>

          {/* Text */}
          <div className="about-text">
            <span className="eyebrow">{c.about.eyebrow}</span>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem,3.6vw,2.8rem)", margin: "18px 0 24px", fontWeight: 600 }}>
              {c.about.titleLead}<br/>komunikasi yang <i>{c.about.titleAccent}</i>.
            </h2>
            {c.about.paragraphs.map((para, i) => <p key={i} data-reveal="true">{para}</p>)}
            <div className="skill-chips" data-reveal="true">
              {c.about.chips.map(s => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ EDUCATION ════════════ */}
      <section id="education" className="band-pink">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.education.eyebrow}</span>
            <h2>{c.education.titleLead}<br/>{c.education.titleBreak}</h2>
            <p>{c.education.lead}</p>
          </div>
          <div className="edu-card" data-reveal="true">
            <span className="edu-frame" aria-hidden="true">
              <i className="cnr tl" /><i className="cnr tr" /><i className="cnr bl" /><i className="cnr br" />
            </span>
            <div className="edu-content">
              <span className="edu-label">{c.education.label}</span>
              <h3>{c.education.degree}</h3>
              <span className="edu-school">{c.education.school}</span>
              <ul className="edu-meta">
                {c.education.meta.map(m => (
                  <li key={m.label}><b>{m.value}</b><span>{m.label}</span></li>
                ))}
              </ul>
              <p className="edu-desc">{c.education.description}</p>
            </div>
            <div className="edu-seal" aria-hidden="true">
              <span>{c.education.seal}</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <svg className="divider-vital" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 30 L480 30 L500 8 L520 52 L540 18 L560 42 L580 30 L1200 30" />
      </svg>

      {/* ════════════ EXPERIENCE ════════════ */}
      <section id="experience" className="band-white">
        {stickers("experience")}
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.experience.eyebrow}</span>
            <h2>{c.experience.title}</h2>
            <p>{c.experience.lead}</p>
          </div>
          <div className="timeline">
            <div className="tl-track"><i id="tl-fill" /></div>
            {c.experience.items.map((exp, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" />
                <div className="tl-card">
                  <span className="tl-period">{exp.date}</span>
                  <h3>{exp.title}</h3>
                  <ul>{exp.bullets.map((it, j) => <li key={j}>{it}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CERTS ════════════ */}
      <section id="certs" className="band-pink">
        {stickers("certs")}
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.certs.eyebrow}</span>
            <h2>{c.certs.title}</h2>
            <p>{c.certs.lead}</p>
          </div>
          <div className="cert-grid">
            {c.certs.items.map((cert, i) => (
              <div key={i} className="cert-card">
                <div className="cert-icon">{cert.icon}</div>
                <h4>{cert.title}</h4>
                <span className="cert-date">{cert.date}</span>
                <span className="cert-link is-disabled">Berkas belum diunggah</span>
              </div>
            ))}
          </div>
          <span className="eyebrow" style={{ marginTop: 64, display: "inline-block" }}>{c.certs.orgsLabel}</span>
          <div className="org-row" data-reveal="true">
            {c.certs.orgs.map(org => <span key={org}>{org}</span>)}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <svg className="divider-vital" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 30 L600 30 L622 8 L644 52 L666 30 L1200 30" />
      </svg>

      {/* ════════════ GALLERY — BENTO ════════════ */}
      <section id="gallery" className="band-white">
        {stickers("gallery")}
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.gallery.eyebrow}</span>
            <h2>{c.gallery.title}</h2>
            <p>{c.gallery.lead}</p>
          </div>
          <div className="bento-grid">
            {gallery.map((item, i) => (
              <div key={item.id || i} className="bento-card">
                <img src={item.url} alt={item.alt || item.title} loading="lazy" />
                <div className="bento-overlay">
                  <span className="b-tag">{item.tag}</span>
                  <h4>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CONTACT ════════════ */}
      <section id="contact">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{c.contact.eyebrow}</span>
            <h2>{c.contact.titleLead}<br/><i>{c.contact.titleAccent}</i></h2>
            <p>{c.contact.lead}</p>
          </div>
          <div className="contact-grid">
            {/* Links */}
            <div className="contact-links">
              {c.contact.links.map((link, i) => (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="c-icon">{CONTACT_ICONS[link.icon] ?? CONTACT_ICONS.email}</span>
                    <div>
                      <div style={{ lineHeight: 1 }}>{link.label}</div>
                      <span className="small">{link.sub}</span>
                    </div>
                  </div>
                  <span className="arrow">↗</span>
                </a>
              ))}
            </div>
            {/* Form */}
            <div className="contact-form-wrap">
              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >
                <label className="cf-label" htmlFor="cf-nama">Nama kamu</label>
                <input id="cf-nama" type="text"  placeholder="Nama lengkap"   value={form.nama}  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}  required />
                <label className="cf-label" htmlFor="cf-pesan">Pesan</label>
                <textarea id="cf-pesan"            placeholder="Tulis pesan..." value={form.pesan} onChange={e => setForm(f => ({ ...f, pesan: e.target.value }))} required />
                <button type="submit">{c.contact.submitLabel} →</button>
                <p className="cf-note">{c.contact.formNote}</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        {c.footer.copyright}<br/>
        {c.footer.line2}
      </footer>
    </>
  );
}
