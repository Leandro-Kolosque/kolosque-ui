"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import { useChapterScroll } from "@/components/temple/useChapterScroll";
import { temploNav } from "@/data/templo";
import Mark from "./Mark";

// Dia e noite em um botão só. A escolha fica salva (next-themes) e vale para o site inteiro.
function DayNight() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  // Até montar, o servidor não sabe o tema salvo: assume noite (o padrão da /templo) para o HTML bater na hidratação.
  const night = ready ? resolvedTheme !== "light" : true;
  return (
    <button type="button" className="t-icon" onClick={() => setTheme(night ? "light" : "dark")}
      aria-label={night ? "Ver o templo de dia" : "Ver o templo à noite"}>
      {ready ? (night ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />) : <span className="size-[17px]" />}
    </button>
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

        <div className="flex items-center gap-2 max-lg:ml-auto lg:ml-6">
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
