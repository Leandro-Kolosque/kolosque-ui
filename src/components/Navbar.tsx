"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { ThemeToggle } from "./theme";
import { experiments } from "@/data/components";
import { nav } from "@/data/hero";
import Link from "next/link";


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (menu) lenis?.stop();
    else lenis?.start();
    return () => lenis?.start();
  }, [menu, lenis]);

  const term = q.trim().toLowerCase();
  const hits = term ? experiments.filter((e) => [e.name, e.category, ...e.tech].join(" ").toLowerCase().includes(term)).slice(0, 5) : [];
  const solid = scrolled || menu;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? "border-b border-line bg-bg/90 text-ink backdrop-blur-md" : "text-white"}`}>
        <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-black/60 to-transparent transition-opacity duration-300 ${solid ? "opacity-0" : ""}`} />
        <div className="flex h-16 items-center justify-between gap-6 px-6 md:px-10">
          <div className="flex items-center gap-8">
            <a href="#" className="font-display text-2xl tracking-[-1px]">Kolosque UI</a>
            <div className="relative hidden md:block">
              <label className={`flex h-10 w-64 items-center gap-2 rounded-full border px-4 backdrop-blur transition focus-within:border-primary ${solid ? "border-line bg-surface" : "border-white/20 bg-white/10"}`}>
                <Search size={16} className="opacity-70" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setTimeout(() => setFocus(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") location.hash = "biblioteca";
                    if (e.key === "Escape") (e.target as HTMLInputElement).blur();
                  }}
                  placeholder="Buscar experimentos"
                  aria-label="Buscar experimentos"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:opacity-60"
                />
              </label>
              {focus && hits.length > 0 && (
                <ul className="absolute left-0 top-12 w-72 rounded-2xl border border-line bg-surface p-2 text-ink shadow-2xl">
                  {hits.map((e) => (
                    <li key={e.id}>
                      <Link href={e.href ?? "#biblioteca"} className="block rounded-xl px-4 py-2 hover:bg-primary/10">
                        <span className="block text-[15px] font-medium">{e.name}</span>
                        <span className="text-sm text-muted">{e.category}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-medium uppercase tracking-[1px] md:flex">
            <div className="group relative">
              <button className="link-u flex items-center gap-1 uppercase">Sobre <ChevronDown size={14} /></button>
              <ul className="invisible absolute left-0 top-8 w-48 rounded-2xl border border-line bg-surface p-2 text-[15px] normal-case tracking-normal text-ink opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {nav.about.map(([label, href]) => (
                  <li key={href}><a href={href} className="block rounded-xl px-4 py-2 hover:bg-primary/10">{label}</a></li>
                ))}
              </ul>
            </div>
            {nav.links.map(([label, href]) => <a key={href} href={href} className="link-u">{label}</a>)}
            <ThemeToggle />
            <a href={nav.cta[1]} className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-[13px] font-medium tracking-[1px] text-primary-fg transition hover:-translate-y-0.5 active:scale-[.97]">{nav.cta[0]}</a>
          </nav>

          <button className="-mr-3 grid size-12 place-items-center md:hidden" onClick={() => setMenu(!menu)} aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu}>
            {menu ? <X size={32} /> : <Menu size={36} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-30 flex flex-col bg-bg px-6 pt-24 text-ink md:hidden">
          <nav className="flex flex-col gap-6 text-lg font-medium uppercase tracking-[1px]">
            {[...nav.about, ...nav.links].map(([label, href]) => (
              <a key={href} href={href} onClick={() => { lenis?.start(); setMenu(false); }}>{label}</a>
            ))}
          </nav>
          <div className="mt-8 flex items-center justify-between border-t border-line pt-8">
            <span className="text-muted">Tema</span>
            <ThemeToggle />
          </div>
          <a href={nav.cta[1]} className="mt-8 grid h-12 place-items-center rounded-full bg-primary font-medium tracking-[1px] text-primary-fg">{nav.cta[0]}</a>
        </div>
      )}
    </>
  );
}
