import AboutStage from "./AboutStage";
import ChapterHead from "./ChapterHead";

export default function About() {
  return (
    <section id="ordens" data-chapter="03" data-title="Ordens" className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(circle,var(--dot)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_28%_50%,var(--bg)_40%,transparent_100%)]" />
      <div className="wrap relative grid min-h-[calc(100svh-64px)] items-center gap-12 py-16 lg:grid-cols-2">
        <div>
          <ChapterHead n="03" title="Ordens" greek="ΤΑΞΙΣ" className="mb-12" />
          <h2 data-reveal="words" className="h-display text-5xl tracking-[-2px] md:text-7xl md:tracking-[-3px]">A personal archive of digital experiences.</h2>
          <p data-reveal="up" className="copy mt-6 text-muted">
            Componentes, animações e experimentos de UI/UX que construí enquanto aprendia front-end.<br />
            Cada um traz uma demo, o código e o que aprendi no caminho.
          </p>
          <div data-reveal="up" className="mt-8 flex flex-wrap gap-4">
            <a href="#biblioteca" className="btn btn-primary">Explorar biblioteca</a>
            <a href="#jornada" className="btn btn-ghost">Ver a jornada</a>
          </div>
        </div>
        <div data-reveal="fade"><AboutStage /></div>
      </div>
    </section>
  );
}
