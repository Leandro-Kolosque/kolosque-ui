import HeroBackground from "./HeroBackground";
import StackStrip from "./StackStrip";
import Portico from "./temple/Portico";
import Action from "@/components/Action";

// A Hero segue o tema: papel marfim de dia; à noite, as gravuras invertidas viram traço claro sobre o escuro (ver HeroBackground).
export default function Hero() {
  return (
    <section className="sticky top-0 z-0 h-svh overflow-hidden bg-bg">
      <HeroBackground />
      {/* Véu de papel: protege o texto no mobile (embaixo) e, no desktop, só a borda esquerda. */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--bg)_20%,color-mix(in_srgb,var(--bg)_75%,transparent)_45%,transparent_70%)] md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_70%,transparent),transparent_45%)]" />
      <Portico />
      <div className="relative flex h-full flex-col justify-end">
        <div data-hero-content className="px-6 pb-8 md:px-10 md:pb-14 lg:pl-32">
          <p data-reveal="fade" className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent md:text-xs">Nº 00 · Arquivo pessoal de UI/UX</p>
          <h1 data-reveal="words" className="mt-4 font-display text-[44px] leading-none tracking-[-1.5px] text-accent md:mt-6 md:text-7xl md:tracking-[-3px] lg:text-[96px]">
            {/* O espaço antes do <br> mantém as palavras separadas no rótulo de acessibilidade do SplitText. */}
            A playground{" "}<br />for interfaces.
          </h1>
          <div data-reveal="up" className="mt-8 md:mt-10">
            <Action href="#biblioteca" variant="primary">Explorar biblioteca</Action>
          </div>
        </div>
        <StackStrip />
      </div>
    </section>
  );
}
