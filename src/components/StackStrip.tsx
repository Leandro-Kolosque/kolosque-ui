import { stack } from "@/data/stack";

const row = [...stack, ...stack];
const items = [...row, ...row];

// Faixa fina de catálogo no rodapé da Hero: linha dourada, rótulo em mono e marquee.
export default function StackStrip() {
  return (
    <div className="flex items-center gap-6 border-t border-gold/60 bg-bg/80 px-6 backdrop-blur-sm md:px-10">
      <p className="shrink-0 font-mono text-[11px] uppercase tracking-[1.5px] text-muted md:text-xs">Stack</p>
      <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="marquee flex w-max">
          {items.map(({ name, role, icon: Icon }, i) => (
            <li key={i} aria-hidden={i >= stack.length} className="flex h-14 items-center gap-3 pr-12 md:h-16 md:pr-16">
              <Icon className="size-4 shrink-0 text-accent md:size-5" />
              <span className="text-sm font-medium md:text-[15px]">{name}</span>
              <span className="font-mono text-[11px] uppercase tracking-[1px] text-muted">{role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
