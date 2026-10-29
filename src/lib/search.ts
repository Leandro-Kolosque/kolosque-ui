import type { Experiment } from "@/data/components";

export function matchesQuery(e: Experiment, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [e.name, e.category, ...e.tech].join(" ").toLowerCase().includes(term);
}