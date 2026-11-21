import { experiments } from "@/data/components";
import ExperimentCard from "./ExperimentCard";
import ChapterHead from "./ChapterHead";
import Action from "@/components/Action";

export default function Featured() {
  const featured = experiments.filter((e) => e.featured);
  return (
    <section id="biblioteca" data-chapter="02" data-title="Biblioteca" className="py-26">
      <div className="wrap">
        <ChapterHead n="02" title="Biblioteca" greek="ΒΙΒΛΙΟΘΗΚΗ" />
        <h2 data-reveal="words" className="h-display mt-12 text-4xl tracking-[-2px] md:text-5xl">Experimentos em destaque</h2>
        <p data-reveal="up" className="copy mt-4 text-muted">
          Cada prévia reage ao mouse, como o componente real vai reagir.<br />
          O status mostra em que ponto do aprendizado cada um está.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* O wrapper leva a revelação; o card é o mesmo da /library, onde a lista muda com os filtros e não deve ser revelada. */}
          {featured.map((e, i) => (
            <div key={e.id} data-reveal="up" className={i === 0 ? "md:col-span-2" : ""}>
              <ExperimentCard experiment={e} className="h-full" />
            </div>
          ))}
        </div>
        <div data-reveal="up" className="mt-12">
          <Action href="/library">Ver todos os experimentos</Action>
        </div>
      </div>
    </section>
  );
}
