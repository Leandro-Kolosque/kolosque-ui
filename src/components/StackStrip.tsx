import { stack } from "@/data/stack";

const row = [...stack, ...stack];
const items = [...row, ...row];

export default function StackStrip() {
  return (
    <div className="px-6 pb-10 md:px-10 md:pb-20">
      <p className="text-sm text-white/70 md:text-lg">Stack:</p>
      <div className="mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] md:mt-6">
        <ul className="marquee flex w-max">
          {items.map(({ name, role, icon: Icon }, i) => (
            <li key={i} aria-hidden={i >= stack.length} className="flex items-center gap-3 pr-16 md:gap-4 md:pr-28">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white md:size-16">
                <Icon className="size-5 md:size-8" />
              </span>
              <span>
                <b className="block text-base font-semibold leading-5 md:text-2xl md:leading-8">{name}</b>
                <span className="text-[13px] text-white/60 md:text-base">{role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}