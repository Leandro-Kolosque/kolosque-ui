import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { experiments, statusLabel } from "@/data/components";
import { categories } from "@/data/categories";
import ChapterHead from "@/components/ChapterHead";

// 02 · Biblioteca: os experimentos em destaque numa grade de pranchas (duas em cima, três embaixo),
// depois o índice das categorias, cada uma abrindo a /library já filtrada.
export default function Atlas() {
  const featured = experiments.filter((e) => e.featured);
  return (
    <section id="biblioteca" data-chapter="02" data-title="Biblioteca" data-cam="2" className="t-sec">
      <ChapterHead n="02" title="Biblioteca" greek="ΒΙΒΛΙΟΘΗΚΗ" />
      <div className="t-split">
        <h2 data-reveal="words" className="t-h2">Experimentos em destaque</h2>
        <p data-reveal="up" className="t-lead">
          Componentes e experimentos de UI, cada um com a técnica e o código. Os que já têm demo abrem em tela cheia;
          o status mostra em que ponto do aprendizado cada um está.
        </p>
      </div>

      <ol className="t-atlas">
        {featured.map((e, i) => (
          <li key={e.id} data-reveal="up" className="t-cell">
            <span className="k t-label">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-[clamp(22px,2vw,30px)] leading-none tracking-[-0.015em]">
              {e.href ? (
                <Link href={e.href} className="t-cell-link">{e.name}</Link>
              ) : e.name}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted">{e.category}</span>
            <p className="t-body max-w-[34ch]">{e.interaction}</p>
            <span className="mt-auto font-mono text-[10px] uppercase tracking-[.16em] text-muted">
              {statusLabel[e.status]} · {e.tech.join(" · ")}
            </span>
            {e.href && <ArrowUpRight aria-hidden size={20} strokeWidth={1.5} className="absolute right-6 top-6 text-muted" />}
          </li>
        ))}
      </ol>

      <div className="mt-[clamp(48px,8vh,96px)]">
        <div data-reveal="up" className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <p className="t-label">Categorias · {String(categories.length).padStart(2, "0")}</p>
          <Link href="/library" className="btn btn-ghost btn-sm">Abrir a biblioteca <ArrowRight size={16} /></Link>
        </div>
        <ul data-reveal="up" className="t-index">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/library?category=${c.id}`} className="font-mono text-[11px] uppercase tracking-[.14em]">{c.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
