import Link from "next/link";
import Lyra from "@/components/temple/Lyra";
import { GITHUB } from "@/data/templo";
import EpilogoBlaze from "./EpilogoBlaze";

// 04 · Epílogo: o convite final. A palavra pende na vertical à direita (decorativa); a frase, o texto e os
// botões descem pela esquerda. À noite, a constelação de Lyra aparece no céu e faíscas sobem da base (Blaze).
export default function Epilogo() {
  return (
    <section id="contato" data-chapter="04" data-title="Epílogo" data-cam="4" className="t-sec t-fin">
      <EpilogoBlaze />
      <p data-reveal="fade" className="t-label col-start-1 row-start-1"><b className="font-medium text-accent">04</b> — Epílogo</p>
      <div className="col-start-1 row-start-2">
        <h2 data-reveal="words" className="t-h2 max-w-[12ch] text-[clamp(36px,3.6vw,56px)]">Veja o que já saiu do papel.</h2>
        <p data-reveal="up" className="t-lead mt-6 max-w-[44ch]">
          Explore a biblioteca completa, com busca, filtros e ordenação. Cada experimento mostra em que ponto do aprendizado está.
        </p>
      </div>
      <div data-reveal="up" className="col-start-1 row-start-3 flex flex-wrap gap-4">
        <Link href="/library" className="btn btn-primary">Abrir a biblioteca</Link>
        <a href={GITHUB} className="btn btn-ghost">Ver no GitHub</a>
      </div>
      <Lyra className="t-lyra pointer-events-none hidden min-[821px]:dark:block" />
      <p aria-hidden data-reveal="fade" className="t-vword">Epilogue</p>
    </section>
  );
}
