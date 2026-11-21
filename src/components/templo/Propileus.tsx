import { sortWorks, works } from "@/data/works";
import { experiments } from "@/data/components";
import { chapterIndex } from "@/data/templo";
import { ExperimentPreview } from "@/components/ExperimentCard";

// A janela da Hero mostra a obra em destaque: a primeira obra publicada da Pinacoteca ou,
// enquanto não houver nenhuma, o primeiro experimento em destaque que tem demo. Um clique até a obra.
function featured() {
  const w = sortWorks(works).find((x) => !x.draft && x.url);
  if (w) return { href: w.url!, external: true, greek: "ΠΙΝΑΚΟΘΗΚΗ", caption: `Nº 01 — ${w.name}`, cover: w.cover, kind: undefined };
  const e = experiments.find((x) => x.featured && x.href);
  if (e) return { href: e.href!, external: false, greek: "ΒΙΒΛΙΟΘΗΚΗ", caption: `Nº 01 — ${e.name}`, cover: undefined, kind: e.kind };
  return null;
}

// data-exit: como cada peça deixa a Hero no começo do scroll ("início duração [shift|blur]", em fração dos
// primeiros 58% de tela). A janela some primeiro e se desfaz; o índice esvazia um capítulo por vez; a estela por último.
export default function Propileus() {
  const peek = featured();
  return (
    <section id="top" aria-label="Propileus" data-reveal-now data-cam="0" className="t-hero">
      <div className="t-hero-top">
        <p data-reveal="fade" className="t-label flex items-center gap-3">
          <span aria-hidden className="t-dot" />Nº 00 — Propileus
        </p>
        <h1 data-reveal="words" className="t-h1 mt-6">A playground{" "}<br />for interfaces.</h1>
        <p data-reveal="up" className="t-lead mt-6 max-w-[36ch]">
          Portfólio de design e front-end de Leandro Kolosque. As landing pages ficam na Pinacoteca; os experimentos, na Biblioteca.
        </p>
        <div data-reveal="up" className="mt-8">
          <a href="#pinacoteca" className="btn btn-primary">Ver a Pinacoteca</a>
        </div>
      </div>

      <div className="t-hero-spacer" />

      <div className="t-hero-foot">
        <div data-exit=".1 .3 shift">
          <p data-reveal="fade" className="t-cue">Role para entrar<span aria-hidden className="track"><i /></span></p>
        </div>
        <nav aria-label="Capítulos" data-exit=".6 .3">
          <ol className="t-chips">
            {chapterIndex.map((c, i) => (
              <li key={c.n} data-exit={`${(0.2 + i * 0.1).toFixed(1)} .3 shift`}>
                <a data-reveal="up" href={c.href} className="t-chip">
                  <span className="num">{c.n}</span>
                  <span className="lab">{c.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {peek && (
        <div data-exit="0 .26 blur" className="t-peek">
          <a data-reveal="fade" href={peek.href} {...(peek.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group block" aria-label={`Obra em destaque: ${peek.caption.replace("Nº 01 — ", "")}`}>
            <span className="t-peek-fr">
              {peek.cover ? (
                <img src={peek.cover} alt="" className="size-full object-cover object-top" />
              ) : peek.kind ? (
                <span className="block size-full"><ExperimentPreview kind={peek.kind} /></span>
              ) : null}
              <span className="t-peek-play">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden><path d="M8 5.6 16.4 11 8 16.4z" fill="var(--ink)" /></svg>
              </span>
            </span>
            <span className="t-peek-cap">
              <b aria-hidden className="t-greek text-lg leading-none font-normal tracking-[.12em] text-muted">{peek.greek}</b>
              <i className="font-mono text-[9px] not-italic uppercase tracking-[.2em] text-muted">{peek.caption}</i>
            </span>
          </a>
        </div>
      )}

      <div aria-hidden data-exit="0 1" className="t-word">KOLOSQUE</div>

      <div aria-hidden data-exit=".7 .3" className="t-stele">ΜΟΥΣΕΙΟΝ</div>
    </section>
  );
}
