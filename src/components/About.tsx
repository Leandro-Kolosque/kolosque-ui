import AboutStage from "./AboutStage";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function About() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-bg">
      <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(circle,var(--dot)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_28%_50%,var(--bg)_40%,transparent_100%)]" />
      <div className="wrap relative grid min-h-[calc(100svh-64px)] items-center gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="rise h-display text-5xl tracking-[-2px] md:text-7xl md:tracking-[-3px]">A personal archive of digital experiences.</h2>
          <p className="rise copy mt-6 text-muted" style={delay(120)}>
            Componentes, animações e experimentos de UI/UX que construí enquanto aprendia front-end.<br />
            Cada um traz uma demo, o código e o que aprendi no caminho.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-4" style={delay(240)}>
            <a href="#biblioteca" className="btn btn-primary">Explorar biblioteca</a>
            <a href="#jornada" className="btn btn-ghost">Ver a jornada</a>
          </div>
        </div>
        <div className="rise" style={delay(360)}><AboutStage /></div>
      </div>
    </section>
  );
}
