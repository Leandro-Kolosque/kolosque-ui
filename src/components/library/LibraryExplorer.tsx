"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { experiments } from "@/data/components";
import { applyFilters, defaultFilters, hasActiveFilters, parseFilters, toQueryString, type Filters } from "@/lib/filters";
import ExperimentCard from "@/components/ExperimentCard";
import FilterBar from "./FilterBar";

export default function LibraryExplorer() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const urlFilters = useMemo(() => parseFilters(sp), [sp]);

  const [text, setText] = useState(urlFilters.q);
  const pushedQ = useRef(urlFilters.q.trim());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (urlFilters.q.trim() !== pushedQ.current) {
      pushedQ.current = urlFilters.q.trim();
      setText(urlFilters.q);
    }
  }, [urlFilters.q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const filters: Filters = { ...urlFilters, q: text };
  const results = useMemo(() => applyFilters(experiments, { ...urlFilters, q: text }), [urlFilters, text]);

  // Lê a URL atual no momento do evento para nunca sobrescrever com estado velho.
  function commit(patch: Partial<Filters>) {
    const current = parseFilters(new URLSearchParams(window.location.search));
    const qs = toQueryString({ ...current, ...patch });
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  function onText(value: string) {
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pushedQ.current = value.trim();
      commit({ q: value });
    }, 250);
  }

  function onClear() {
    clearTimeout(timer.current);
    setText("");
    pushedQ.current = "";
    commit({ ...defaultFilters, sort: urlFilters.sort });
  }

  const active = hasActiveFilters(filters);

  return (
    <div className="mt-12 space-y-8">
      <FilterBar filters={filters} onText={onText} onChange={commit} />

      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <p aria-live="polite">
          {results.length} de {experiments.length} {experiments.length === 1 ? "experimento" : "experimentos"}
        </p>
        {active && <button type="button" onClick={onClear} className="link-u text-ink">Limpar filtros</button>}
      </div>

      {results.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((e) => <ExperimentCard key={e.id} experiment={e} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-line px-8 py-16 text-center">
          <h2 className="font-display text-2xl leading-none tracking-[-1px]">Nenhum experimento encontrado.</h2>
          <p className="mx-auto mt-4 max-w-160 text-base leading-6 text-muted">
            Nada combina com esses filtros.<br />
            Remova alguns para ver mais resultados.
          </p>
          <button type="button" onClick={onClear} className="btn btn-ghost mt-8">Limpar filtros</button>
        </div>
      )}
    </div>
  );
}