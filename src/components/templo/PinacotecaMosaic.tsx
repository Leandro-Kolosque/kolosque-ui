import { ArrowUpRight } from "lucide-react";
import { LANDING_LIMIT, sortWorks, works, type Work } from "@/data/works";
import ChapterHead from "@/components/ChapterHead";

const pad = (i: number) => String(i + 1).padStart(2, "0");

// Cada obra é um quadro na parede: a moldura leva o nome e o ano; a ficha embaixo traz o número e a técnica.
// O quadro inteiro abre a página publicada (nova aba). Rascunhos aparecem como "Em preparação", sem link.
function WorkFrame({ work: w, index, total }: { work: Work; index: number; total: number }) {
  const live = Boolean(w.url && !w.draft);
  const frame = (
    <span className="t-frame">
      {w.cover ? (
        <img src={w.cover} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="t-draft">
          <span className="bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[.16em] text-muted">
            {w.draft ? "Em preparação" : "Sem prévia"}
          </span>
        </span>
      )}
      {live && <ArrowUpRight aria-hidden size={22} strokeWidth={1.5} className="t-frame-ar text-ink" />}
      <span className="t-frame-lab">
        <b className="font-display text-[clamp(18px,1.5vw,24px)] font-normal leading-none tracking-[-0.01em] [text-shadow:var(--shadow-text)]">{w.name}</b>
        <span className="font-mono text-[10px] tracking-[.16em] text-muted">{w.year}</span>
      </span>
    </span>
  );

  return (
    <article data-reveal="up" className="t-work">
      {live ? (
        <a href={w.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${w.name} em nova aba`}
          className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          {frame}
        </a>
      ) : (
        <div className="flex flex-1 flex-col">{frame}</div>
      )}
      <div className="t-meta">
        <span>Nº {pad(index)} · {w.tech.join(" · ")}</span>
        <span className="flex gap-4">
          {w.repo && !w.draft && <a href={w.repo} target="_blank" rel="noopener noreferrer" className="link-u hover:text-accent">Código</a>}
          {pad(index)} / {pad(total - 1)}
        </span>
      </div>
    </article>
  );
}

export default function PinacotecaMosaic() {
  const list = sortWorks(works).slice(0, LANDING_LIMIT);
  return (
    <section id="pinacoteca" data-chapter="01" data-title="Pinacoteca" data-cam="1" aria-labelledby="pinacoteca-titulo" className="t-sec">
      <ChapterHead n="01" title="Pinacoteca" greek="ΠΙΝΑΚΟΘΗΚΗ" />
      <h2 id="pinacoteca-titulo" className="sr-only">Pinacoteca: landing pages em exposição</h2>
      <div className="t-mosaic" data-count={list.length}>
        {list.map((w, i) => <WorkFrame key={w.id} work={w} index={i} total={list.length} />)}
      </div>
      <p data-reveal="up" className="t-body mt-8 max-w-[640px]">
        Sites e landing pages que desenhei e construí. Cada peça abre a página publicada.
      </p>
    </section>
  );
}
