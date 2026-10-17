"use client";
import { useRef } from "react";
import { Search, TrendingUp } from "lucide-react";
import { experiments, statusDot, statusLabel, type Status } from "@/data/components";

const layer = (d: number) => ({ transform: `translate3d(calc(var(--mx,0)*${d}px),calc(var(--my,0)*${d}px),0)` });
const move = "transition-transform duration-200 ease-out";

export default function AboutStage() {
  const ref = useRef<HTMLDivElement>(null);
  const set = (x: number, y: number) => {
    ref.current?.style.setProperty("--mx", String(x));
    ref.current?.style.setProperty("--my", String(y));
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={() => set(0, 0)} aria-hidden className="relative h-[400px] w-full select-none md:h-[480px]">
      <div style={layer(20)} className={`absolute left-0 top-4 ${move}`}>
        <div className="flex h-12 w-72 items-center gap-2 rounded-full border border-line bg-surface/90 px-4 shadow-xl backdrop-blur">
          <Search size={16} className="text-muted" />
          <span className="text-[15px] text-muted">Buscar experimentos</span>
        </div>
      </div>
      <div style={layer(36)} className={`absolute right-0 top-24 ${move}`}>
        <div className="w-64 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-2xl">
          <p className="font-display text-2xl leading-none tracking-[-1px]">Entrar</p>
          <div className="h-12 rounded-xl border-2 border-primary px-4 text-[15px] leading-[44px] text-muted shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_18%,transparent)]">voce@exemplo.com</div>
          <div className="h-12 rounded-xl border border-line" />
          <div className="h-12 rounded-full bg-primary" />
        </div>
      </div>
      <div style={layer(12)} className={`absolute bottom-0 left-8 ${move}`}>
        <div className="w-60 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-xl">
          <p className="flex items-center gap-2 font-medium"><TrendingUp size={16} className="text-primary" />Progresso</p>
          <ul className="space-y-2 text-[15px]">
            {(Object.keys(statusLabel) as Status[]).map((s) => (
              <li key={s} className="flex items-center justify-between text-muted">
                <span className="flex items-center gap-2"><i className={`size-2 rounded-full ${statusDot[s]}`} />{statusLabel[s]}</span>
                <b className="font-medium text-ink">{experiments.filter((e) => e.status === s).length}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
