import { ArrowRight } from "lucide-react";
import HeroBackground from "./HeroBackground";
import StackStrip from "./StackStrip";

export default function Hero() {
  return (
    <section className="sticky top-0 z-0 h-svh overflow-hidden bg-[#0B0D17] text-white">
      <HeroBackground />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_13_23/.8),transparent_65%),linear-gradient(0deg,rgb(11_13_23/.92),transparent_55%)]" />
      <div className="relative flex h-full flex-col justify-end">
        <div className="px-6 pb-12 md:px-10 md:pb-14">
          <p className="text-xs font-medium uppercase tracking-[2px] text-white/80">Arquivo pessoal de UI/UX</p>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-[-2px] md:text-7xl md:tracking-[-3px] lg:text-[88px]">
            A playground<br />for interfaces.
          </h1>
          <a href="#biblioteca" className="group mt-8 inline-flex h-12 items-center gap-4 rounded-full border-2 border-white bg-white pl-6 pr-2 text-[13px] font-bold uppercase tracking-[1px] text-black transition duration-200 hover:bg-transparent hover:text-white active:scale-[.97]">
            Explorar biblioteca
            <span className="grid size-8 place-items-center rounded-full bg-black text-white transition group-hover:bg-white group-hover:text-black"><ArrowRight size={16} /></span>
          </a>
        </div>
        <StackStrip />
      </div>
    </section>
  );
}
