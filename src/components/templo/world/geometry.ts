// Utilitários de geometria e o aleatório com semente. Restaram do santuário procedural: o capitel jônico das
// Ordens (capital.ts) usa box, merge e shaft; os placeholders do diorama (paint.ts) usam rng.
import { BoxGeometry, BufferGeometry, CylinderGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const TAU = Math.PI * 2;

// Aleatório com semente: o mundo sai igual em toda visita.
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Junta várias geometrias numa só (menos chamadas de desenho). Todas viram não indexadas para poderem se misturar.
export function merge(list: BufferGeometry[]): BufferGeometry {
  const flat = list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const key of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(key)) n.deleteAttribute(key);
    return n;
  });
  const out = mergeGeometries(flat, false);
  if (!out) throw new Error("templo: geometrias incompatíveis ao juntar");
  return out;
}

export function box(w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

// Fuste dórico: 20 caneluras côncavas com arestas vivas e uma êntase leve (o fuste incha um pouco antes de afinar).
export function shaft(h: number, r0: number, r1: number, flutes = 20, seg = 120) {
  const g = new CylinderGeometry(r1, r0, h, seg, 10, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = y / h + 0.5;
    const u = ((((Math.atan2(z, x) / TAU) * flutes) % 1) + 1) % 1;
    const k = (1 + 0.03 * Math.sin(Math.PI * Math.min(1, t / 0.85))) * (1 - 0.06 * Math.sin(Math.PI * u));
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  g.translate(0, h / 2, 0);
  return g;
}
