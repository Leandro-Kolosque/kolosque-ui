// Canvas UI (https://canvasui.dev), de David Haz. © 2026 David Haz. Licença MIT + Commons Clause (ver LICENSE.md nesta pasta):
// usado aqui como parte do site; os componentes não podem ser vendidos nem redistribuídos (por isso não entram na Biblioteca).

export function resolveOptions<T extends object>(
  defaults: T,
  options: Partial<T>,
): Partial<T> {
  const resolved: Partial<T> = {};
  for (const key of Object.keys(options) as (keyof T)[]) {
    const value = options[key];
    resolved[key] = value === undefined ? defaults[key] : value;
  }
  return resolved;
}
