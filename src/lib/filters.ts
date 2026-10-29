import { categories } from "@/data/categories";
import type { Experiment, Status } from "@/data/components";
import { matchesQuery } from "./search";

export type SortKey = "manual" | "name" | "status";

export type Filters = {
  q: string;
  category: string; // id da categoria (ex.: "3d")
  tech: string[]; // o experimento precisa ter todas
  status: Status | "";
  sort: SortKey;
};

export const defaultFilters: Filters = { q: "", category: "", tech: [], status: "", sort: "manual" };

const statuses: Status[] = ["done", "wip", "planned"];
const sorts: SortKey[] = ["manual", "name", "status"];

type ParamsLike = { get(name: string): string | null; getAll(name: string): string[] };

export function parseFilters(sp: ParamsLike): Filters {
  const status = sp.get("status") ?? "";
  const sort = sp.get("sort") ?? "";
  return {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "",
    tech: sp.getAll("tech"),
    status: (statuses as string[]).includes(status) ? (status as Status) : "",
    sort: (sorts as string[]).includes(sort) ? (sort as SortKey) : "manual",
  };
}

// Valores padrão ficam fora da URL para ela continuar limpa.
export function toQueryString(f: Filters): string {
  const p = new URLSearchParams();
  const q = f.q.trim();
  if (q) p.set("q", q);
  if (f.category) p.set("category", f.category);
  f.tech.forEach((t) => p.append("tech", t));
  if (f.status) p.set("status", f.status);
  if (f.sort !== "manual") p.set("sort", f.sort);
  return p.toString();
}

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.q.trim() || f.category || f.tech.length || f.status);
}

export function applyFilters(list: Experiment[], f: Filters): Experiment[] {
  // Experiment.category guarda o nome; a URL usa o id. Id desconhecido é ignorado.
  const categoryName = f.category ? categories.find((c) => c.id === f.category)?.name : undefined;
  const out = list.filter(
    (e) =>
      matchesQuery(e, f.q) &&
      (!categoryName || e.category === categoryName) &&
      f.tech.every((t) => e.tech.includes(t)) &&
      (!f.status || e.status === f.status),
  );
  if (f.sort === "name") return out.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  if (f.sort === "status") return out.sort((a, b) => statuses.indexOf(a.status) - statuses.indexOf(b.status));
  return out;
}