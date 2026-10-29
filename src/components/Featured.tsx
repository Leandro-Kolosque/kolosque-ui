import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { experiments } from "@/data/components";
import ExperimentCard from "./ExperimentCard";

export default function Featured() {
  const featured = experiments.filter((e) => e.featured);
  return (
    <section id="biblioteca" className="py-26">
      <div className="wrap">
        <h2 className="h-display text-4xl tracking-[-2px] md:text-5xl">Experimentos em destaque</h2>
        <p className="copy mt-4 text-muted">
          Cada prévia reage ao mouse, como o componente real vai reagir.<br />
          O status mostra em que ponto do aprendizado cada um está.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featured.map((e, i) => (
            <ExperimentCard key={e.id} experiment={e} className={i === 0 ? "md:col-span-2" : ""} />
          ))}
        </div>
        <Link href="/library" className="btn btn-ghost mt-12 gap-2">
          Ver todos os experimentos <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}