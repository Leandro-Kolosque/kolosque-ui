import { BookOpenCheck, FlaskConical, Repeat, TrendingUp } from "lucide-react";

const points = [
  [BookOpenCheck, "Registro do que aprendo", "Cada experimento guarda a técnica, as dependências e uma nota pessoal."],
  [FlaskConical, "Espaço para testar", "Controles ao vivo para mexer em velocidade, cor e intensidade."],
  [Repeat, "Conhecimento reutilizável", "O código fica pronto para voltar em outros projetos."],
  [TrendingUp, "Evolução visível", "O status mostra o que está pronto e o que ainda vem."],
] as const;

export default function Journey() {
  return (
    <section id="jornada" className="py-26">
      <div className="wrap grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="h-display text-4xl tracking-[-2px] md:text-5xl">Um diário de aprendizado, escrito em código.</h2>
          <div className="copy mt-8 space-y-4 text-muted">
            <p>Comecei com HTML e CSS, copiando designs que eu admirava. Hoje refaço tudo com React, Tailwind e animações, entendendo cada decisão.</p>
            <p>Este espaço não compete com bibliotecas prontas. Ele guarda o que aprendi, o que ainda estou testando e o que quero tentar a seguir.</p>
          </div>
        </div>
        <ul className="space-y-6">
          {points.map(([Icon, title, text]) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon size={24} /></span>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-base leading-6 text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
