import { ArrowRight } from "lucide-react";
import HeroBackground from "./HeroBackground";
import StackStrip from "./StackStrip";

// A Hero é sempre papel marfim (theme-light), nos dois temas.
export default function Hero() {
  return (
    <section className="theme-light sticky top-0 z-0 h-svh overflow-hidden bg-bg">
      <HeroBackground />
      {/* Véu de papel: protege o texto no mobile (embaixo) e, no desktop, só a borda esquerda. */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--bg)_20%,color-mix(in_srgb,var(--bg)_75%,transparent)_45%,transparent_70%)] md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_70%,transparent),transparent_45%)]" />
      <div className="relative flex h-full flex-col justify-end">
        <div className="px-6 pb-8 md:px-10 md:pb-14">
          <p className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent md:text-xs">Nº 00 · Arquivo pessoal de UI/UX</p>
          <h1 className="mt-4 font-display text-[44px] leading-none tracking-[-1.5px] text-accent md:mt-6 md:text-7xl md:tracking-[-3px] lg:text-[96px]">
            A playground<br />for interfaces.
          </h1>
          <a href="#biblioteca" className="btn btn-primary mt-8 md:mt-10">
            Explorar biblioteca <ArrowRight size={16} />
          </a>
        </div>
        <StackStrip />
      </div>
    </section>
  );
}
