// Peças do santuário geradas por código: colunas dóricas caneladas, entablamentos, frontões, escadarias,
// muros de blocos e vegetação. Tudo em metros, com a base de cada peça em y = 0 e a frente em z = 0.
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  LatheGeometry,
  Quaternion,
  Shape,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const TAU = Math.PI * 2;

// Aleatório com semente: o santuário sai igual em toda visita.
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

// Capitel dórico: equino (a almofada que abre para fora) e ábaco (a laje quadrada).
export function doricCapital(r: number, hE: number, hA: number) {
  const pts: Vector2[] = [new Vector2(0.001, 0)];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(new Vector2(r * (1 + 0.36 * Math.pow(Math.sin((t * Math.PI) / 2), 1.6)), t * hE));
  }
  pts.push(new Vector2(0.001, hE));
  const w = r * 2 * 1.42;
  return merge([new LatheGeometry(pts, 40), box(w, hA, w, 0, hE + hA / 2, 0)]);
}

export function doricColumn(h: number, r0: number) {
  const r1 = r0 * 0.78;
  const hE = r0 * 0.62, hA = r0 * 0.3;
  const cap = doricCapital(r1, hE, hA);
  cap.translate(0, h, 0);
  return { geometry: merge([shaft(h, r0, r1), cap]), top: h + hE + hA };
}

// Entablamento sobre uma fachada de largura W e profundidade D, começando em y0, com a frente em z = 0:
// arquitrave, friso com tríglifos sobre cada coluna e entre elas, e a cornija que avança um pouco.
export function entablature(W: number, D: number, y0: number, xs: number[], hA: number, hF: number, hC: number) {
  const list = [box(W, hA, D, 0, y0 + hA / 2, -D / 2), box(W - 0.12, hF, D - 0.12, 0, y0 + hA + hF / 2, -D / 2)];
  const tw = hF * 0.62;
  const glyphs = [...xs];
  for (let i = 0; i < xs.length - 1; i++) glyphs.push((xs[i] + xs[i + 1]) / 2);
  for (const x of glyphs) {
    list.push(box(tw, hF * 0.96, 0.14, x, y0 + hA + hF / 2, 0.01));
    // dois sulcos verticais em cada tríglifo
    for (const s of [-1, 1]) list.push(box(tw * 0.12, hF * 0.8, 0.06, x + s * tw * 0.17, y0 + hA + hF / 2, 0.1));
  }
  list.push(box(W + 0.5, hC, D + 0.5, 0, y0 + hA + hF + hC / 2, -D / 2));
  return { geometry: merge(list), top: y0 + hA + hF + hC };
}

// Frontão: o triângulo atravessa o prédio inteiro (faz as vezes do telhado) e a cornija inclinada emoldura a frente.
export function pediment(W: number, D: number, y0: number, hp: number) {
  const s = new Shape();
  s.moveTo(-W / 2, 0);
  s.lineTo(W / 2, 0);
  s.lineTo(0, hp);
  s.closePath();
  const tri = new ExtrudeGeometry(s, { depth: D, bevelEnabled: false });
  tri.translate(0, y0, -D + 0.02);
  const len = Math.hypot(W / 2, hp) + 0.3;
  const ang = Math.atan2(hp, W / 2);
  const rakes = [-1, 1].map((side) => {
    const g = new BoxGeometry(len, 0.32, 0.55);
    g.rotateZ(-side * ang);
    g.translate((side * W) / 4, y0 + hp / 2 + 0.1, 0.25);
    return g;
  });
  return merge([tri, ...rakes]);
}

// Lance de escada: degraus maciços do chão até a altura de cada um, subindo para o fundo (-z) a partir de z0.
export function flight(n: number, rise: number, run: number, width: number, y0: number, z0: number, cheek = 0) {
  const list: BufferGeometry[] = [];
  for (let i = 0; i < n; i++) {
    const h = (i + 1) * rise;
    list.push(box(width, h, run, 0, y0 + h / 2, z0 - i * run - run / 2));
    if (cheek > 0) for (const s of [-1, 1]) list.push(box(cheek, h + 0.45, run, s * (width / 2 + cheek / 2), y0 + (h + 0.45) / 2, z0 - i * run - run / 2));
  }
  return merge(list);
}

// Crepidoma: os três degraus da base de um templo, cada um recuando um pouco.
export function crepidoma(W: number, D: number, y0: number, h: number, inset: number, z0: number) {
  const list: BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const g = (2 - i) * inset;
    list.push(box(W + g * 2, h, D + g * 2, 0, y0 + h * i + h / 2, z0 - D / 2));
  }
  return merge(list);
}

// Muro de arrimo em blocos (aparelho de pedra), com juntas fundas e cada bloco um pouco fora de prumo.
export function ashlar(x0: number, x1: number, y0: number, y1: number, z: number, rand: () => number) {
  const list: BufferGeometry[] = [];
  const bh = 0.75, gap = 0.07;
  const rows = Math.round((y1 - y0) / bh);
  for (let r = 0; r < rows; r++) {
    let x = x0 - (r % 2) * 0.9;
    while (x < x1) {
      const bw = 1.4 + rand() * 1.2;
      const cx = Math.max(x0, x), ex = Math.min(x1, x + bw);
      if (ex - cx > 0.3) list.push(box(ex - cx - gap, bh - gap, 0.6, (cx + ex) / 2, y0 + r * bh + bh / 2, z + 0.3 + rand() * 0.07));
      x += bw;
    }
  }
  return merge(list);
}

// Haste de a até b (raio r0 na ponta a, r1 na ponta b).
function rod(a: Vector3, b: Vector3, r0: number, r1: number, seg = 6) {
  const dir = new Vector3().subVectors(b, a);
  const g = new CylinderGeometry(r1, r0, dir.length(), seg);
  g.translate(0, dir.length() / 2, 0);
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
}

// Trípode de bronze: três pernas abertas embaixo que se fecham sob a bacia do braseiro. Base em y = 0.
export function tripod(h = 1.7) {
  const list: BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    list.push(rod(new Vector3(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46), new Vector3(Math.cos(a) * 0.2, h - 0.05, Math.sin(a) * 0.2), 0.05, 0.035));
  }
  const bowl = new LatheGeometry([new Vector2(0.001, 0), new Vector2(0.22, 0.05), new Vector2(0.4, 0.22), new Vector2(0.44, 0.3), new Vector2(0.001, 0.3)], 20);
  bowl.translate(0, h - 0.05, 0);
  list.push(bowl);
  return merge(list);
}

// Cipreste: cone estreito e irregular.
export function cypress(h: number, r: number, rand: () => number) {
  const g = new ConeGeometry(r, h, 9, 5);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (rand() - 0.5) * 0.28;
    p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k);
  }
  g.computeVertexNormals();
  g.translate(0, h / 2, 0);
  return g;
}

// Oliveira: tronco torto e copa larga feita de tufos.
export function olive(rand: () => number) {
  const trunk = new CylinderGeometry(0.18, 0.32, 2.2, 7);
  trunk.translate(0, 1.1, 0);
  trunk.rotateZ(0.12);
  const crown: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const g = new IcosahedronGeometry(1 + rand() * 0.6, 1);
    g.scale(1.3, 0.75, 1.1);
    g.translate((rand() - 0.5) * 3, 2.5 + rand() * 1.1, (rand() - 0.5) * 2.2);
    crown.push(g);
  }
  return { trunk, crown: merge(crown) };
}

export function rock(r: number, rand: () => number) {
  const g = new DodecahedronGeometry(r, 0);
  g.scale(1 + rand() * 0.6, 0.6 + rand() * 0.3, 1 + rand() * 0.4);
  g.rotateY(rand() * TAU);
  return g;
}
