import { ArrowUpRight } from "lucide-react";
import { LANDING_LIMIT, sortWorks, works, type Work } from "@/data/works";
import ChapterHead from "./ChapterHead";

const pad = (i: number) => String(i + 1).padStart(2, "0");

function WorkCard({ work: w, index }: { work: Work; index: number }) {
  const frame = (
    <div className="relative aspect-16/10 overflow-hidden border border-line bg-surface">
      {w.cover ? (
        <img src={w.cover} alt="" loading="lazy" decoding="async" className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" />
      ) : (
        <div className="grid size-full place-items-center bg-[repeating-linear-gradient(135deg,transparent_0_11px,var(--line)_11px_12px)]">
          <span className="bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
            {w.draft ? "Em preparação" : "Sem preview"}
          </span>
        </div>
      )}
    </div>
  );

  const meta = (
    <div className="mt-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">Nº {pad(index)} · {w.year}</p>
        <h3 className="mt-2 font-display text-2xl leading-none tracking-[-1px]">{w.name}</h3>
        <p className="mt-2 text-base leading-6 text-muted">{w.summary}</p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[1.5px]">{w.tech.join(" · ")}</p>
      </div>
      {w.url && <ArrowUpRight size={20} className="mt-1 shrink-0 text-accent transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
    </div>
  );

  return (
    <article data-reveal="up" className="group relative">
      {w.url && !w.draft ? (
        <a href={w.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${w.name} em nova aba`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          {frame}
          {meta}
        </a>
      ) : (
        <>
          {frame}
          {meta}
        </>
      )}
      {w.repo && !w.draft && (
        <a href={w.repo} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-block font-mono text-[11px] uppercase tracking-[1.5px] text-muted hover:text-accent">
          Código
        </a>
      )}
    </article>
  );
}

export default function Pinacoteca() {
  const list = sortWorks(works).slice(0, LANDING_LIMIT);
  return (
    <section id="pinacoteca" data-chapter="01" data-title="Pinacoteca" className="py-26">
      <div className="wrap">
        <ChapterHead n="01" title="Pinacoteca" greek="ΠΙΝΑΚΟΘΗΚΗ" />
        <h2 data-reveal="words" className="h-display mt-12 text-4xl tracking-[-2px] md:text-5xl">Landing pages em exposição</h2>
        <p data-reveal="up" className="copy mt-4 text-muted">
          Sites e landing pages que desenhei e construí.<br />
          Cada peça abre a página publicada.
        </p>
        <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {list.map((w, i) => <WorkCard key={w.id} work={w} index={i} />)}
        </div>
      </div>
    </section>
  );
}
