import Link from "next/link";
import { statusDot, statusLabel, type Experiment, type Kind } from "@/data/components";

export function ExperimentPreview({ kind }: { kind: Kind }) {
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
      <div className="h-32 w-24 rounded-2xl bg-linear-to-br from-primary to-ink/70 shadow-xl transition duration-500 transform-[perspective(600px)_rotateY(-14deg)] group-hover:transform-[perspective(600px)_rotateY(14deg)_rotateX(8deg)]" />
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
   if (kind === "helix") return (
    <div className={`${wrap} perspective-[700px]`}>
      <div className="relative size-0 transition duration-1400 transform-3d transform-[rotateX(-12deg)_rotateY(0deg)] group-hover:transform-[rotateX(-12deg)_rotateY(180deg)]">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute -left-6 -top-8 h-16 w-12 rounded-lg bg-linear-to-br from-primary to-ink/60 shadow-lg"
            style={{ transform: `translateY(${(i - 2.5) * 18}px) rotateY(${i * 60}deg) translateZ(84px)` }}
          />
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

export default function ExperimentCard({ experiment: e, className = "" }: { experiment: Experiment; className?: string }) {
  return (
    <article className={`group relative overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}>
      {e.href && <Link href={e.href} aria-label={`Abrir ${e.name}`} className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-2 focus-visible:outline-primary" />}
      <div className="h-56 bg-[radial-gradient(circle,var(--dot)_1px,transparent_1px)] bg-size-[24px_24px]">
        <ExperimentPreview kind={e.kind} />
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
  );
}