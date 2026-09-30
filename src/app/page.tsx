"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/* ─── Constants ─── */
const WHATSAPP_NUMBER = "6289697007035";

/* ─── Data ─── */
const EXPERIENCES = [
  { date: "Juni – Juli 2025", title: "RSUD Indramayu · Rawat Inap", items: ["Asuhan keperawatan komprehensif pada pasien rawat inap", "Observasi tanda vital & intervensi sesuai rencana tindakan"] },
  { date: "Agustus 2025", title: "RSUD Bayu Asih · IGD & ICU", items: ["Triase & tindakan awal kegawatdaruratan", "Pertolongan cepat sesuai standar BTCLS"] },
  { date: "Agt – Sep 2025", title: "RPSLU Pucang Gading, Semarang", items: ["Asuhan keperawatan pada lansia dengan penyakit klinis", "Perawatan dan pendampingan pasien lansia sehari-hari"] },
  { date: "September 2025", title: "RSJ Provinsi Jawa Barat", items: ["Asuhan pasien gangguan jiwa", "Fasilitator Terapi Aktivitas Kelompok (TAK)"] },
  { date: "Okt – Des 2025", title: "RSD Gunung Jati, Cirebon · Maternitas", items: ["Asuhan maternitas: ANC, INC, dan PNC", "Asisten persalinan & persiapan operasi sesuai SOP"] },
];

const GALLERY = [
  { tag: "RSUD Indramayu", title: "Rawat Inap", src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&q=80" },
  { tag: "IGD & ICU", title: "Bayu Asih", src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80" },
  { tag: "Geriatri", title: "Pucang Gading", src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80" },
  { tag: "Kes. Jiwa", title: "RSJ Jawa Barat", src: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=700&q=80" },
  { tag: "Maternitas", title: "Gunung Jati", src: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=700&q=80" },
];

export default function Home() {
  const initialized = useRef(false);
  const cursorDot  = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ nama: "", pesan: "" });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ═══ CUSTOM CURSOR ═══ */
    const dot  = cursorDot.current;
    const ring = cursorRing.current;
    if (dot && ring) {
      // Set xPercent/yPercent once to center the elements on the mouse point
      gsap.set(dot,  { xPercent: -50, yPercent: -50 });
      gsap.set(ring, { xPercent: -50, yPercent: -50 });
    }
    const moveCursor = (e: MouseEvent) => {
      if (dot)  gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.08, ease: "none",        overwrite: "auto" });
      if (ring) gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out",  overwrite: "auto" });
    };
    window.addEventListener("mousemove", moveCursor);
    document.querySelectorAll("a, button, .bento-card, .cert-card").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
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
    gsap.from(".bento-card", { y: 60, opacity: 0, duration: .7, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".bento-grid", start: "top 82%" } });

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

    return () => window.removeEventListener("mousemove", moveCursor);
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
        <div className="nav-logo">nabilah<em>.</em></div>
        <ul>
          {[["hero","beranda"],["about","tentang"],["education","pendidikan"],["experience","pengalaman"],["certs","sertifikat"],["gallery","momen"]].map(([id,label]) => (
            <li key={id}><a href={`#${id}`} data-nav={id}>{label}</a></li>
          ))}
        </ul>
        <a href="#contact" className="nav-cta">hubungi →</a>
        <button id="burger" aria-label="menu" onClick={openMenu}><span /></button>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-menu">
        <div className="close-m" onClick={closeMenu}>tutup ✕</div>
        <ul>
          {[["#about","Tentang"],["#education","Pendidikan"],["#experience","Pengalaman"],["#certs","Sertifikat"],["#gallery","Momen"],["#contact","Hubungi"]].map(([href,label]) => (
            <li key={href}><a href={href} onClick={closeMenu}>{label}</a></li>
          ))}
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
          <span className="eyebrow">Nursing Professional · D3 Keperawatan</span>
          <h1 className="hero-name" style={{ perspective: "800px" }}>
            {"Nabilah".split("").map((c, i) => <span key={i} className="char">{c}</span>)}
            {" "}{"Aisha".split("").map((c, i) => <span key={`a${i}`} className="char">{c}</span>)}
            <br />
            <span className="accent">
              {"Syahada".split("").map((c, i) => <span key={`s${i}`} className="char">{c}</span>)}
            </span>
          </h1>
          <p className="hero-sub" data-reveal="true">
            Calon perawat profesional yang siap jaga shift malam demi senyum pasien. 💖 Punya jam terbang di 5 unit berbeda—dari ritme cepat IGD sampai tenangnya Maternitas. <i>Skill</i> medikal mantap, komunikasi <i>on point</i>, dan selalu berdedikasi tinggi!
          </p>
          <div className="hero-actions">
            <a href="#gallery" className="btn btn-solid">Jelajahi Momen ↓</a>
            <a href="#contact" className="btn btn-ghost">Yuk Connect!</a>
          </div>
        </div>

        {/* 3D Mascot Illustration (Toco & Muku Style) */}
        <div className="hero-mascot">
          <img src="/mascot.jpg" alt="3D Cute Nurse Mascot" />
        </div>

        <div className="scroll-cue"><span>scroll</span><div className="line"><i /></div></div>
      </header>

      {/* ════════════ ABOUT ════════════ */}
      <section id="about" className="band-white">
        <div className="bg-sticker" data-speed="-180" style={{ width: 280, top: '5%', right: '4%', transform: 'rotate(12deg)', opacity: 0.85 }}>
          <img src="/p1.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="120" style={{ width: 200, bottom: '8%', left: '3%', transform: 'rotate(-10deg)', opacity: 0.7 }}>
          <img src="/p2.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="150" style={{ width: 160, top: '40%', right: '12%', transform: 'rotate(-18deg)', opacity: 0.8 }}>
          <img src="/p8.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="-120" style={{ width: 180, bottom: '25%', left: '8%', transform: 'rotate(14deg)', opacity: 0.9 }}>
          <img src="/p9.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="wrap about-grid">
          {/* Photo */}
          <div className="photo-wrap" data-reveal="true">
            <div className="photo-frame">
              <div className="ph-inner">
                <img src="/foto-nabilah.jpg" alt="Nabilah Aisha Syahada"
                  onError={e => { e.currentTarget.style.display="none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display="flex"; }} />
                <div className="ph-placeholder" style={{ display:"none" }}>
                  <span aria-hidden="true">🩺</span>
                  <small>foto menyusul</small>
                </div>
              </div>
            </div>
            <div className="photo-badge"><b>2026</b><span>Lulusan D3 Keperawatan Polindra</span></div>
            <div className="photo-badge-top"><b>3.66</b><span>IPK Terbaik</span></div>
          </div>

          {/* Text */}
          <div className="about-text">
            <span className="eyebrow">01 — Tentang saya</span>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem,3.6vw,2.8rem)", margin: "18px 0 24px", fontWeight: 600 }}>
              Merawat bukan cuma tugas,<br/>tapi <i>passion</i> saya.
            </h2>
            <p data-reveal="true">Saya terbiasa menangani asuhan keperawatan dengan ritme <i>fast-paced</i> namun tetap mengutamakan ketelitian ekstra. Berbekal jam terbang di berbagai institusi rumah sakit top, saya sudah terbiasa dengan lingkungan medis yang dinamis.</p>
            <p data-reveal="true">Mulai dari cek TTV, komunikasi terapeutik dengan pasien, sampai asuhan keperawatan dan edukasi kesehatan—semua saya jalankan sesuai standar. Intinya: profesional, disiplin, teliti, dan selalu siap kerja kolaboratif bareng tim medis lain.</p>
            <div className="skill-chips" data-reveal="true">
              {["Basic Nursing","Komunikasi Terapeutik","Patient Care","Manajemen Waktu","Problem Solving","Teamwork","BTCLS","Fotografi"].map(s => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ EDUCATION ════════════ */}
      <section id="education" className="band-pink">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">02 — Pendidikan</span>
            <h2>Latar Belakang<br/>Akademik</h2>
            <p>Perjalanan studi yang membentuk kompetensi dan karakter profesional.</p>
          </div>
          <div className="edu-card" data-reveal="true">
            <div className="edu-content">
              <h3>D3 Keperawatan</h3>
              <span className="edu-school">Politeknik Negeri Indramayu (Polindra)</span>
              <span className="edu-year">2023 – 2026</span>
              <p>Lulusan dengan IPK Terbaik (3.66). Aktif dalam berbagai organisasi kemahasiswaan dan mendapatkan pengalaman klinis langsung di 5 unit rumah sakit besar.</p>
            </div>
            <div className="edu-stamp">LULUS</div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <svg className="divider-vital" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 30 L480 30 L500 8 L520 52 L540 18 L560 42 L580 30 L1200 30" />
      </svg>

      {/* ════════════ EXPERIENCE ════════════ */}
      <section id="experience" className="band-white">
        <div className="bg-sticker" data-speed="-200" style={{ width: 240, top: '25%', left: '2%', transform: 'rotate(-8deg)', opacity: 0.8 }}>
          <img src="/p3.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="160" style={{ width: 220, bottom: '10%', right: '5%', transform: 'rotate(15deg)', opacity: 0.85 }}>
          <img src="/p4.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="-150" style={{ width: 200, top: '65%', left: '10%', transform: 'rotate(22deg)', opacity: 0.75 }}>
          <img src="/p10.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="130" style={{ width: 180, top: '10%', right: '8%', transform: 'rotate(-12deg)', opacity: 0.9 }}>
          <img src="/p11.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">03 — Rekam jejak klinik</span>
            <h2>Pengalaman Praktik Klinik</h2>
            <p>Lima penempatan, lima unit berbeda — dari kegawatdaruratan sampai maternitas.</p>
          </div>
          <div className="timeline">
            <div className="tl-track"><i id="tl-fill" /></div>
            {EXPERIENCES.map((exp, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" />
                <div className="tl-card">
                  <span className="tl-period">{exp.date}</span>
                  <h3>{exp.title}</h3>
                  <ul>{exp.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CERTS ════════════ */}
      <section id="certs" className="band-pink">
        <div className="bg-sticker" data-speed="-150" style={{ width: 250, top: '15%', right: '3%', transform: 'rotate(-12deg)', opacity: 0.9 }}>
          <img src="/p5.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="140" style={{ width: 200, bottom: '5%', left: '6%', transform: 'rotate(8deg)', opacity: 0.85 }}>
          <img src="/p12.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">04 — Sertifikasi &amp; Pelatihan</span>
            <h2>Bekal &amp; Legalitas Klinis</h2>
            <p>Berkas sertifikat akan segera dibagikan di sini.</p>
          </div>
          <div className="cert-grid">
            {[
              { icon: "💉", title: "Basic Trauma & Cardiac Life Support (BTCLS)", date: "Juni 2026" },
              { icon: "🧼", title: "Pelatihan Pencegahan & Pengendalian Infeksi",  date: "Mei 2025"  },
              { icon: "📋", title: "Webinar Bedah Soal UKOM",                       date: "Feb 2025"  },
            ].map((c, i) => (
              <div key={i} className="cert-card">
                <div className="cert-icon">{c.icon}</div>
                <h4>{c.title}</h4>
                <span className="cert-date">{c.date}</span>
                <span className="cert-link is-disabled">Berkas belum diunggah</span>
              </div>
            ))}
          </div>
          <span className="eyebrow" style={{ marginTop: 64, display: "inline-block" }}>Organisasi</span>
          <div className="org-row" data-reveal="true">
            <span>KOTAK PENA — Bendahara Umum</span>
            <span>FORMADIKSI — Anggota Divisi</span>
            <span>REMAIS — Anggota Aktif</span>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <svg className="divider-vital" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 30 L600 30 L622 8 L644 52 L666 30 L1200 30" />
      </svg>

      {/* ════════════ GALLERY — BENTO ════════════ */}
      <section id="gallery" className="band-white">
        <div className="bg-sticker" data-speed="180" style={{ width: 300, top: '8%', left: '4%', transform: 'rotate(10deg)', opacity: 0.8 }}>
          <img src="/p6.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="-160" style={{ width: 280, bottom: '6%', right: '4%', transform: 'rotate(-15deg)', opacity: 0.9 }}>
          <img src="/p7.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="120" style={{ width: 210, top: '45%', right: '8%', transform: 'rotate(20deg)', opacity: 0.75 }}>
          <img src="/p13.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="bg-sticker" data-speed="-140" style={{ width: 230, bottom: '25%', left: '5%', transform: 'rotate(-18deg)', opacity: 0.85 }}>
          <img src="/p14.jpg" loading="lazy" alt="sticker bg" />
        </div>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">05 — Dokumentasi</span>
            <h2>Momen &amp; Kegiatan</h2>
            <p>Potongan dokumentasi selama praktik klinik.</p>
          </div>
          <div className="bento-grid">
            {GALLERY.map((item, i) => (
              <div key={i} className="bento-card">
                <img src={item.src} alt={item.title} loading="lazy" />
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
            <span className="eyebrow">06 — Mari terhubung</span>
            <h2>Terbuka untuk <i>opportunity</i><br/>kerja &amp; magang!</h2>
            <p>Yuk <i>connect</i>! Boleh DM IG, kirim pesan via form, atau langsung klik kontak di bawah.</p>
          </div>
          <div className="contact-grid">
            {/* Links */}
            <div className="contact-links">
              {[
                { 
                  label: "Email",      sub: "nabilaaishavivo@gmail.com", href: "mailto:nabilaaishavivo@gmail.com", 
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> 
                },
                { 
                  label: "WhatsApp",   sub: "+62 896-9700-7035",         href: `https://wa.me/${WHATSAPP_NUMBER}`, 
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
                },
                { 
                  label: "Instagram",  sub: "@bilaaishaa_",               href: "https://instagram.com/bilaaishaa_", 
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> 
                },
              ].map((c, i) => (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="c-icon">{c.icon}</span>
                    <div>
                      <div style={{ lineHeight: 1 }}>{c.label}</div>
                      <span className="small">{c.sub}</span>
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
                <button type="submit">Kirim via WhatsApp →</button>
                <p className="cf-note">Form ini membuka WhatsApp dengan pesan yang sudah terisi otomatis.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        © 2026 NABILAH AISHA SYAHADA<br/>
        Dibuat dengan ❤ untuk dunia kesehatan
      </footer>
    </>
  );
}
