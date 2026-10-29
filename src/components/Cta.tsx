import Link from "next/link";

export default function Cta() {
  return (
    <section className="pb-26">
      <div className="wrap">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-8 py-16 text-center shadow-sm md:py-26">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent)]" />
          <div className="relative">
            <h2 className="h-display mx-auto max-w-160 text-4xl tracking-[-2px] md:text-5xl">Veja o que já saiu do papel.</h2>
            <p className="copy mx-auto mt-4 text-muted">
              Explore a biblioteca completa, com busca, filtros e ordenação.<br />
              Cada experimento mostra em que ponto do aprendizado está.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/library" className="btn btn-primary">Abrir a biblioteca</Link>
              <a href="https://github.com/Leandro-Kolosque" className="btn btn-ghost">Ver no GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="wrap flex flex-wrap justify-between gap-4 text-sm text-muted">
        <span>© 2026 Leandro Kolosque</span>
        <span>Feito com Next.js, React e Tailwind.</span>
      </div>
    </footer>
  );
}
