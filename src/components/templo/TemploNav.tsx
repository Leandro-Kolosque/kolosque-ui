"use client";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import { useChapterScroll } from "@/components/temple/useChapterScroll";
import { temploNav } from "@/data/templo";
import Mark from "./Mark";

// Noite e dia numa pílula. O marcador desliza e estica no caminho; o tema só troca quando ele chega, porque o
// next-themes desliga as transições no instante da troca e cortaria o movimento no meio.
// A escolha fica salva (next-themes) e vale para o site inteiro. No celular, só os ícones.
const MODES = [["dark", "Noite", Moon], ["light", "Dia", Sun]] as const;

function DayNight() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState<string | null>(null);
  const timer = useRef(0);
  useEffect(() => setReady(true), []);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Até montar, o servidor não sabe o tema salvo: assume noite (o padrão da /templo) para o HTML bater na hidratação.
  const current = ready ? (resolvedTheme === "light" ? "light" : "dark") : "dark";
  const on = going ?? current;

  const pick = (key: string) => {
    if (key === on) return;
    clearTimeout(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setTheme(key);
    setGoing(key);
    timer.current = window.setTimeout(() => {
      setTheme(key);
      setGoing(null);
    }, 340);
  };

  return (
    <div role="group" aria-label="Tema" className="t-tg" data-on={on}>
      <span aria-hidden className="t-tg-knob" />
      {MODES.map(([key, label, Icon]) => (
        <button key={key} type="button" aria-pressed={on === key} onClick={() => pick(key)}
          aria-label={key === "dark" ? "Ver o templo à noite" : "Ver o templo de dia"}>
          <Icon size={14} strokeWidth={1.5} aria-hidden />
          <span aria-hidden>{label}</span>
        </button>
      ))}
    </div>
  );
}

// Navbar da /templo. Transparente no topo; ao rolar ganha um véu em gradiente, se esconde quando você desce
// e volta quando sobe. Links completos a partir de 1024px; abaixo disso, folha lateral.
export default function TemploNav() {
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const lenis = useLenis();
  const { active } = useChapterScroll();

  useEffect(() => {
    let last = scrollY;
    const update = () => {
      const y = scrollY;
      setStuck(y > 40);
      // Pequena folga para o scroll suave não fazer a barra piscar.
      if (y > last + 2 && y > innerHeight * 0.8) setHidden(true);
      else if (y < last - 2) setHidden(false);
      last = y;
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (menu) lenis?.stop();
    else lenis?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const wide = () => innerWidth >= 1024 && setMenu(false);
    addEventListener("keydown", esc);
    addEventListener("resize", wide);
    return () => {
      removeEventListener("keydown", esc);
      removeEventListener("resize", wide);
      lenis?.start();
    };
  }, [menu, lenis]);

  return (
    <>
      <header className={`t-nav ${stuck || menu ? "is-stuck" : ""} ${hidden && !menu ? "is-hidden" : ""}`}>
        <a href="#top" className="t-brand" aria-label="Kolosque UI, voltar ao início">
          <Mark size={32} />
          <span>
            <b>KOLOSQUE</b>
            <i>MOUSEION · PORTFÓLIO</i>
          </span>
        </a>

        <nav aria-label="Capítulos" className="t-links max-lg:hidden">
          {temploNav.map((l) => (
            <a key={l.href} href={l.href} className="t-link" aria-current={active === l.href.slice(1) ? "location" : undefined}>
              <span>{l.label}</span>
              <span aria-hidden className="alt">{l.greek}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 max-lg:ml-auto lg:ml-8">
          <DayNight />
          <button type="button" className="t-burger lg:hidden" onClick={() => setMenu(!menu)}
            aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} aria-controls="t-sheet">
            <i /><i />
          </button>
        </div>
      </header>

      <div aria-hidden className={`t-sheet-backdrop lg:hidden ${menu ? "is-open" : ""}`} onClick={() => setMenu(false)} />
      <nav id="t-sheet" aria-label="Capítulos" className={`t-sheet lg:hidden ${menu ? "is-open" : ""}`}>
        {temploNav.map((l) => (
          // O Lenis volta antes do clique chegar a ele (o handler do React roda primeiro); parado, ele ignoraria a âncora.
          <a key={l.href} href={l.href} onClick={() => { lenis?.start(); setMenu(false); }}>
            <span className="block font-display text-[28px] leading-none tracking-[-0.02em]">{l.label}</span>
            <span aria-hidden className="mt-2 block font-mono text-[10px] tracking-[.2em] text-muted">{l.greek}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
