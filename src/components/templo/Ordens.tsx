import { stack } from "@/data/stack";
import { journey } from "@/data/templo";
import ChapterHead from "@/components/ChapterHead";

// 03 · Ordens: quem sou e como trabalho. O título atravessa duas colunas, o texto fica na terceira,
// a jornada vira uma faixa de quatro colunas e a stack fecha o capítulo.
export default function Ordens() {
  return (
    <section id="ordens" data-chapter="03" data-title="Ordens" data-cam="3" className="t-sec">
      <ChapterHead n="03" title="Ordens" greek="ΤΑΞΙΣ" />
      <div className="t-spread">
        <h2 data-reveal="words" className="t-h2">A personal archive of digital experiences.</h2>
        <div className="t-copy">
          <h3 data-reveal="up" className="font-display text-[clamp(22px,1.8vw,28px)] italic leading-none tracking-[-0.01em]">
            Um diário de aprendizado, escrito em código.
          </h3>
          <p data-reveal="up" className="t-lead mt-6">
            Componentes, animações e experimentos de UI/UX que construí enquanto aprendia front-end.
            Cada um traz uma demo, o código e o que aprendi no caminho.
          </p>
          <p data-reveal="up" className="t-body mt-4">
            Comecei com HTML e CSS, copiando designs que eu admirava. Hoje refaço tudo com React, Tailwind e animações,
            entendendo cada decisão.
          </p>
        </div>
      </div>

      <ol id="jornada" className="t-band">
        {journey.map((p, i) => (
          <li key={p.title} data-reveal="up">
            <span className="block font-display text-[32px] italic leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="mt-4 text-[15px] font-medium">{p.title}</h4>
            <p className="mt-2 text-sm leading-[1.5] text-muted">{p.text}</p>
          </li>
        ))}
      </ol>

      <div data-reveal="up" className="t-stack mt-12">
        <p className="t-label mr-4">Stack</p>
        {stack.map(({ name, role, icon: Icon }) => (
          <span key={name} className="flex items-center gap-2">
            <Icon aria-hidden className="size-4 text-accent" />
            <span className="text-sm font-medium">{name}</span>
            <span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted">{role}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
