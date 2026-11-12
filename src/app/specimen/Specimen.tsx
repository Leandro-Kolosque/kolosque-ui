"use client";
import { useState } from "react";
import { ArrowRight, CornerDownRight } from "lucide-react";

type Font = { name: string; note: string; className: string };
type Mode = "light" | "dark";

// Proposta inicial. `accent` é a cor de texto de destaque; `brand` é a cor de preenchimento.
const palettes = {
  light: { bg: "#F5F0E8", surface: "#FBF8F2", ink: "#1E1412", muted: "#6B5D57", line: "#E3D9CB", brand: "#6E1423", brandHover: "#8E1B2E", brandFg: "#F5F0E8", accent: "#6E1423", gold: "#A8833E" },
  dark: { bg: "#17100F", surface: "#211715", ink: "#EDE4D3", muted: "#A89A8C", line: "#3A2B27", brand: "#6E1423", brandHover: "#8A1C2E", brandFg: "#F5F0E8", accent: "#E08A96", gold: "#C9A55C" },
};
type Palette = typeof palettes.light;

const roles: [keyof Palette, string][] = [
  ["bg", "Fundo"], ["surface", "Superfície"], ["ink", "Texto"], ["muted", "Texto secundário"], ["line", "Linhas"],
  ["brand", "Bordô (preenchimento)"], ["brandHover", "Bordô hover"], ["accent", "Destaque em texto"], ["gold", "Dourado (decoração)"],
];

function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export default function Specimen({ displays, monos }: { displays: Font[]; monos: Font[] }) {
  const [mode, setMode] = useState<Mode>("light");
  const [display, setDisplay] = useState(0);
  const [mono, setMono] = useState(0);
  const p = palettes[mode];
  const D = displays[display].className;
  const M = monos[mono].className;

  const vars = Object.fromEntries(Object.entries(p).map(([k, v]) => [`--s-${k}`, v])) as React.CSSProperties;
  const pairs: [string, string, string, number][] = [
    ["Texto / fundo", p.ink, p.bg, 4.5],
    ["Secundário / fundo", p.muted, p.bg, 4.5],
    ["Destaque / fundo", p.accent, p.bg, 4.5],
    ["Marfim / bordô", p.brandFg, p.brand, 4.5],
    ["Dourado / fundo", p.gold, p.bg, 3],
    ["Dourado / bordô", p.gold, p.brand, 3],
  ];

  return (
    <div style={vars} className="min-h-svh bg-(--s-bg) text-(--s-ink) transition-colors">
      {/* Cabeçalho de catálogo */}
      <header className={`${M} sticky top-0 z-10 border-b border-(--s-line) bg-(--s-bg)/95 backdrop-blur`}>
        <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-4 px-6 py-4 text-[12px] uppercase tracking-[1.5px]">
          <span>Kolosque UI · Espécime · Nº 00</span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">Título
              <select value={display} onChange={(e) => setDisplay(+e.target.value)} className="border border-(--s-line) bg-(--s-surface) px-2 py-1 uppercase">
                {displays.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">Mono
              <select value={mono} onChange={(e) => setMono(+e.target.value)} className="border border-(--s-line) bg-(--s-surface) px-2 py-1 uppercase">
                {monos.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}
              </select>
            </label>
            <button onClick={() => setMode(mode === "light" ? "dark" : "light")} className="border border-(--s-line) px-3 py-1 uppercase transition hover:border-(--s-gold) active:scale-[.97]">
              Tema: {mode === "light" ? "claro" : "escuro"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-280 px-6">
        {/* Abertura */}
        <section className="grid gap-12 py-26 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className={`${M} text-[12px] uppercase tracking-[1.5px] text-(--s-accent)`}>Arquivo pessoal de UI/UX</p>
            <h1 className={`${D} mt-4 text-[56px] leading-none tracking-[-2px] text-(--s-accent) md:text-[96px] md:tracking-[-3px]`}>
              A playground<br />for interfaces.
            </h1>
          </div>
          <Ornament className="hidden md:block" />
        </section>

        <Rule />

        {/* Paleta */}
        <section className="py-26">
          <Label m={M} n="01" t="Paleta" />
          <div className="mt-8 grid grid-cols-2 gap-px border border-(--s-line) bg-(--s-line) sm:grid-cols-3 lg:grid-cols-5">
            {roles.map(([k, label]) => (
              <div key={k} className="bg-(--s-bg) p-4">
                <div className="h-16 border border-(--s-line)" style={{ background: p[k] }} />
                <p className="mt-3 text-sm font-medium">{label}</p>
                <p className={`${M} text-[12px] uppercase text-(--s-muted)`}>{p[k]}</p>
              </div>
            ))}
          </div>
          <ul className={`${M} mt-8 grid gap-2 text-[13px] sm:grid-cols-2`}>
            {pairs.map(([label, a, b, min]) => {
              const r = ratio(a, b);
              return (
                <li key={label} className="flex items-center justify-between gap-4 border-b border-(--s-line) py-2">
                  <span className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center text-[13px] font-medium" style={{ background: b, color: a }}>Aa</span>
                    {label}
                  </span>
                  <span className={r >= min ? "" : "text-(--s-accent)"}>{r.toFixed(1)}:1 {r >= min ? "✓" : `✕ (mín. ${min})`}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 max-w-160 text-sm leading-[21px] text-(--s-muted)">
            O dourado é medido contra 3:1 porque só aparece em linhas, ornamentos e texto grande.
          </p>
        </section>

        <Rule />

        {/* Títulos */}
        <section className="py-26">
          <Label m={M} n="02" t="Fontes de título" />
          <div className="mt-8 divide-y divide-(--s-line) border-y border-(--s-line)">
            {displays.map((f, i) => (
              <article key={f.name} className={`grid gap-6 py-12 md:grid-cols-[200px_1fr] ${i === display ? "" : ""}`}>
                <div>
                  <p className={`${M} text-[12px] uppercase tracking-[1.5px]`}>{f.name}</p>
                  <p className="mt-1 text-sm text-(--s-muted)">{f.note}</p>
                  <button onClick={() => setDisplay(i)} className={`${M} mt-4 text-[12px] uppercase tracking-[1.5px] underline-offset-4 transition hover:text-(--s-accent) hover:underline active:opacity-70 ${i === display ? "text-(--s-accent)" : "text-(--s-muted)"}`}>
                    {i === display ? "✦ Em uso nas amostras" : "Usar nas amostras"}
                  </button>
                </div>
                <div className={f.className}>
                  <p className="text-[48px] leading-none tracking-[-1.5px] text-(--s-accent) md:text-[88px] md:tracking-[-3px]">A playground for interfaces.</p>
                  <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
                    <span className="text-[96px] italic leading-none text-(--s-accent)">01</span>
                    <span className="text-[40px] leading-none tracking-[-1px]">Jelly Spiral</span>
                    <span className="text-[24px] leading-none tracking-[-0.5px]">Experimentos em destaque</span>
                    <span className="text-[16px] leading-none">Título pequeno a 16px</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Rule />

        {/* Mono */}
        <section className="py-26">
          <Label m={M} n="03" t="Mono para metadados" />
          <div className="mt-8 divide-y divide-(--s-line) border-y border-(--s-line)">
            {monos.map((f, i) => (
              <article key={f.name} className="grid gap-4 py-8 md:grid-cols-[200px_1fr] md:items-center">
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-sm text-(--s-muted)">{f.note}</p>
                  <button onClick={() => setMono(i)} className={`mt-2 text-[12px] uppercase tracking-[1.5px] transition hover:text-(--s-accent) active:opacity-70 ${i === mono ? "text-(--s-accent)" : "text-(--s-muted)"}`}>
                    {i === mono ? "✦ Em uso" : "Usar"}
                  </button>
                </div>
                <div className={`${f.className} space-y-2 text-[13px] uppercase tracking-[1.5px]`}>
                  <p>Nº 01 · 3D Experiments · Three.js / GSAP · Em desenvolvimento</p>
                  <p className="text-(--s-muted)">Peça adquirida em out 2026 · scroll · webgl · 0123456789</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Rule />

        {/* Botões */}
        <section className="py-26">
          <Label m={M} n="04" t="Botões e links" />
          <div className="mt-8 grid gap-px border border-(--s-line) bg-(--s-line) md:grid-cols-3">
            <Variant m={M} title="Pílula (atual)">
              <button className="inline-flex h-12 items-center rounded-full bg-(--s-brand) px-8 text-[15px] font-medium tracking-[1px] text-(--s-brandFg) transition hover:-translate-y-0.5 hover:bg-(--s-brandHover) active:scale-[.97]">Abrir a biblioteca</button>
              <button className="inline-flex h-12 items-center rounded-full border border-(--s-line) px-8 text-[15px] font-medium tracking-[1px] transition hover:-translate-y-0.5 hover:border-(--s-ink) active:scale-[.97]">Ver no GitHub</button>
            </Variant>
            <Variant m={M} title="Retângulo, borda fina">
              <button className="inline-flex h-12 items-center gap-3 border border-(--s-gold) bg-(--s-brand) px-7 text-[13px] font-medium uppercase tracking-[2px] text-(--s-brandFg) transition hover:bg-(--s-brandHover) active:scale-[.98]">Abrir a biblioteca <ArrowRight size={16} /></button>
              <button className="inline-flex h-12 items-center border border-(--s-ink)/40 px-7 text-[13px] font-medium uppercase tracking-[2px] transition hover:border-(--s-gold) hover:text-(--s-accent) active:scale-[.98]">Ver no GitHub</button>
            </Variant>
            <Variant m={M} title="Link editorial">
              <a href="#" onClick={(e) => e.preventDefault()} className="group inline-flex items-center gap-2 border-b border-(--s-ink) pb-1 text-[13px] font-medium uppercase tracking-[2px] text-(--s-accent) transition hover:border-(--s-gold) active:opacity-70">
                Abrir a biblioteca <CornerDownRight size={16} className="transition group-hover:translate-x-0.5" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="group inline-flex items-center gap-2 border-b border-(--s-line) pb-1 text-[13px] font-medium uppercase tracking-[2px] transition hover:border-(--s-gold) active:opacity-70">
                Ver no GitHub <CornerDownRight size={16} className="transition group-hover:translate-x-0.5" />
              </a>
            </Variant>
          </div>
        </section>

        <Rule />

        {/* Ficha de catálogo */}
        <section className="py-26">
          <Label m={M} n="05" t="Ficha de catálogo" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Entry D={D} M={M} n="01" name="Jelly Spiral" cat="3D Experiments" tech="Three.js · GSAP" status="Em desenvolvimento" text="Hélice 3D de imagens que gira e dobra como gelatina com o scroll." />
            <Entry D={D} M={M} n="02" name="Scroll Story" cat="Scroll Animations" tech="GSAP · ScrollTrigger" status="Em desenvolvimento" text="Painéis com clip-path, parallax e texto que sobe no scroll." filled />
          </div>
        </section>
      </main>
    </div>
  );
}

function Label({ m, n, t }: { m: string; n: string; t: string }) {
  return (
    <p className={`${m} flex items-center gap-3 text-[12px] uppercase tracking-[1.5px]`}>
      <span className="text-(--s-gold)">✦</span> {n} · {t}
    </p>
  );
}

function Rule() {
  return (
    <div aria-hidden className="flex items-center gap-4 text-(--s-gold)">
      <span className="h-px flex-1 bg-(--s-gold)/60" />
      <span className="text-[12px]">✦</span>
      <span className="h-px flex-1 bg-(--s-gold)/60" />
    </div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={`size-48 text-(--s-gold) ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="64" strokeOpacity=".5" />
      <path d="M100 0v200M0 100h200" strokeOpacity=".35" />
      <circle cx="100" cy="8" r="4" fill="var(--s-brand)" stroke="none" />
      <circle cx="164" cy="100" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Variant({ m, title, children }: { m: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-6 bg-(--s-bg) p-8">
      <p className={`${m} text-[12px] uppercase tracking-[1.5px] text-(--s-muted)`}>{title}</p>
      {children}
    </div>
  );
}

function Entry({ D, M, n, name, cat, tech, status, text, filled }: { D: string; M: string; n: string; name: string; cat: string; tech: string; status: string; text: string; filled?: boolean }) {
  return (
    <article className={`group relative flex flex-col justify-between gap-12 border p-8 transition hover:-translate-y-0.5 ${filled ? "border-(--s-gold) bg-(--s-brand) text-(--s-brandFg)" : "border-(--s-line) bg-(--s-surface) hover:border-(--s-gold)"}`}>
      <div className={`${M} flex justify-between text-[12px] uppercase tracking-[1.5px] ${filled ? "text-(--s-brandFg)/80" : "text-(--s-muted)"}`}>
        <span>{cat}</span><span>{status}</span>
      </div>
      <div>
        <span className={`${D} block text-[80px] italic leading-none ${filled ? "text-(--s-gold)" : "text-(--s-accent)"}`}>{n}</span>
        <h3 className={`${D} mt-2 text-[40px] leading-none tracking-[-1px]`}>{name}</h3>
        <p className={`mt-4 max-w-120 text-base leading-6 ${filled ? "text-(--s-brandFg)/85" : "text-(--s-muted)"}`}>{text}</p>
      </div>
      <div className={`flex items-center justify-between border-t pt-4 ${filled ? "border-(--s-gold)/50" : "border-(--s-line)"}`}>
        <span className={`${M} text-[12px] uppercase tracking-[1.5px]`}>{tech}</span>
        <span className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[2px]">Abrir peça <CornerDownRight size={16} /></span>
      </div>
    </article>
  );
}
