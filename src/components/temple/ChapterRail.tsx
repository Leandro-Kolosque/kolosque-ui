"use client";
import { useRef } from "react";
import Column from "./Column";
import { useChapterScroll } from "./useChapterScroll";

// Trilho de capítulos.
// Desktop (≥1280px): coluna dórica fixa à esquerda, na mesma posição da coluna do pórtico; as caneluras douram com o scroll
// e cada capítulo é uma junta entre tambores, clicável. Abaixo disso: linha dourada de progresso sob a navbar.
// O progresso vai na variável CSS --p, escrita direto no DOM para não renderizar a cada frame.
// lineTop: posição da linha de progresso no mobile, logo abaixo da navbar da página (a padrão tem 64px + 1px de borda).
export default function ChapterRail({ lineTop = "top-[65px]" }: { lineTop?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { chapters, active, visible } = useChapterScroll((p) => root.current?.style.setProperty("--p", p.toFixed(4)));

  return (
    <div ref={root} className={`transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <nav aria-label="Capítulos" className="fixed bottom-6 left-5 top-24 z-20 hidden w-11 text-ink/45 xl:flex">
        <Column order="doric" gild className="h-full w-full">
          {chapters.map((c) => {
            const on = active === c.id;
            return (
              <a key={c.id} href={`#${c.id}`} aria-label={`${c.n} — ${c.title}`} aria-current={on ? "location" : undefined} style={{ top: `${c.pos * 100}%` }}
                className="group absolute -inset-x-2 h-6 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-accent">
                <span aria-hidden className={`absolute inset-x-2 top-1/2 -translate-y-1/2 transition-all ${on ? "h-0.5 bg-gold" : "h-px bg-current group-hover:bg-gold"}`} />
                <span className={`pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap border border-line bg-bg px-2 py-1 font-mono text-[11px] uppercase tracking-[1.5px] text-ink opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100`}>
                  <b className="font-medium text-accent">{c.n}</b> — {c.title}
                </span>
              </a>
            );
          })}
        </Column>
      </nav>

      <div aria-hidden className={`fixed inset-x-0 z-20 h-0.5 xl:hidden ${lineTop}`}>
        <div className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(var(--p, 0))" }} />
        {chapters.map((c) => (
          <span key={c.id} className="absolute -top-0.5 h-1.5 w-px bg-ink/40" style={{ left: `${c.pos * 100}%` }} />
        ))}
      </div>
    </div>
  );
}
