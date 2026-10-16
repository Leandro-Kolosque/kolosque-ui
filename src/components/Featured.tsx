import { experiments, statusDot, statusLabel, type Kind } from "@/data/components";

function Preview({ kind }: { kind: Kind }) {
  const wrap = "grid h-full place-items-center";
  if (kind === "login") return (
    <div className={wrap}>
      <div className="w-48 space-y-2 rounded-2xl border border-line bg-surface/80 p-4 shadow-lg backdrop-blur">
        <div className="h-3 w-16 rounded bg-ink/80" />
        <div className="h-8 rounded-lg border border-line transition group-hover:border-primary group-hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]" />
        <div className="h-8 rounded-lg border border-line" />
        <div className="h-8 rounded-full bg-primary transition group-hover:scale-[.97]" />
      </div>
    </div>
  );
  if (kind === "card") return (
    <div className={wrap}>
      <div className="h-32 w-24 rounded-2xl bg-linear-to-br from-primary to-ink/70 shadow-xl transition duration-500 [transform:perspective(600px)_rotateY(-14deg)] group-hover:[transform:perspective(600px)_rotateY(14deg)_rotateX(8deg)]" />
    </div>
  );
  if (kind === "zoom") return (
    <div className={wrap}>
      <div className="size-28 overflow-hidden rounded-2xl shadow-lg">
        <div className="size-full bg-linear-to-tr from-primary/80 via-primary/30 to-line transition duration-700 group-hover:scale-125" />
      </div>
    </div>
  );
  if (kind === "scroll") return (
    <div className={`${wrap} content-center`}>
      <div className="space-y-2">
        {["w-32 group-hover:translate-x-6", "w-24 group-hover:translate-x-3", "w-40 group-hover:-translate-x-3"].map((c) => (
          <div key={c} className={`h-3 rounded-full bg-primary/70 transition duration-500 ${c}`} />
        ))}
      </div>
    </div>
  );
  return (
    <div className={wrap}>
      <span className="font-display text-6xl tracking-[-4px] transition-all duration-500 group-hover:tracking-[4px]">Aa</span>
    </div>
  );
}

export default function Featured() {
  return (
    <section id="biblioteca" className="py-26">
      <div className="wrap">
        <h2 className="h-display text-4xl tracking-[-2px] md:text-5xl">Experimentos em destaque</h2>
        <p className="copy mt-4 text-muted">
          Cada prévia reage ao mouse, como o componente real vai reagir.<br />
          O status mostra em que ponto do aprendizado cada um está.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {experiments.map((e, i) => (
            <article key={e.id} className={`group overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${i === 0 ? "md:col-span-2" : ""}`}>
              <div className="h-56 [background-image:radial-gradient(circle,var(--dot)_1px,transparent_1px)] [background-size:24px_24px]">
                <Preview kind={e.kind} />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl leading-none tracking-[-1px]">{e.name}</h3>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
                    <i className={`size-2 rounded-full ${statusDot[e.status]}`} />{statusLabel[e.status]}
                  </span>
                </div>
                <p className="text-base leading-6 text-muted">{e.interaction}</p>
                <ul className="flex flex-wrap gap-2 text-sm">
                  <li className="rounded-full bg-primary/10 px-4 py-1 text-primary">{e.category}</li>
                  {e.tech.map((t) => <li key={t} className="rounded-full border border-line px-4 py-1 text-muted">{t}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
