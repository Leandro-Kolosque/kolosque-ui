"use client";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { categories } from "@/data/categories";
import { experiments, statusLabel, type Status } from "@/data/components";
import type { Filters, SortKey } from "@/lib/filters";

const usedCategories = categories.filter((c) => experiments.some((e) => e.category === c.name));
const allTech = [...new Set(experiments.flatMap((e) => e.tech))].sort((a, b) => a.localeCompare(b));

const select =
  "h-12 rounded-full border border-line bg-surface px-5 text-[15px] text-ink transition hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 rounded-full border px-4 text-sm transition active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active ? "border-primary bg-primary/10 text-primary" : "border-line text-muted hover:border-ink/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

type Props = {
  filters: Filters; // q já vem do texto digitado
  onText: (value: string) => void;
  onChange: (patch: Partial<Filters>) => void;
};

export default function FilterBar({ filters, onText, onChange }: Props) {
  const toggleTech = (t: string) =>
    onChange({ tech: filters.tech.includes(t) ? filters.tech.filter((x) => x !== t) : [...filters.tech, t] });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <label className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line bg-surface px-5 transition focus-within:border-primary">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={filters.q}
            onChange={(e) => onText(e.target.value)}
            placeholder="Buscar por nome, categoria ou tecnologia"
            aria-label="Buscar experimentos"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
        </label>
        <select aria-label="Filtrar por status" value={filters.status} onChange={(e) => onChange({ status: e.target.value as Status | "" })} className={select}>
          <option value="">Todos os status</option>
          {(Object.keys(statusLabel) as Status[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <select aria-label="Ordenar por" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortKey })} className={select}>
          <option value="manual">Ordem padrão</option>
          <option value="name">Nome (A–Z)</option>
          <option value="status">Status</option>
        </select>
      </div>

      <Group label="Categoria">
        {usedCategories.map((c) => (
          <Chip key={c.id} active={filters.category === c.id} onClick={() => onChange({ category: filters.category === c.id ? "" : c.id })}>
            {c.name}
          </Chip>
        ))}
      </Group>

      <Group label="Tecnologia">
        {allTech.map((t) => (
          <Chip key={t} active={filters.tech.includes(t)} onClick={() => toggleTech(t)}>
            {t}
          </Chip>
        ))}
      </Group>
    </div>
  );
}