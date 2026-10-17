import { stack } from "@/data/stack";

const row = [...stack, ...stack];
const items = [...row, ...row];

export default function StackStrip() {
  return (
    <div className="px-6 pb-8 md:px-10">
      <p className="text-sm text-white/70">Stack:</p>
      <div className="mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="marquee flex w-max">
          {items.map(({ name, role, icon: Icon }, i) => (
            <li key={i} aria-hidden={i >= stack.length} className="flex items-center gap-3 pr-12 md:pr-16">
              <span className="grid size-10 place-items-center rounded-full bg-white/10 text-white"><Icon size={20} /></span>
              <span>
                <b className="block font-medium leading-5">{name}</b>
                <span className="text-sm text-white/60">{role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
