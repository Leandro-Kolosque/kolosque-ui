// Placeholders do diorama: desenhos simples em nanquim, feitos em canvas, que seguram o lugar de cada imagem até
// a gravura de verdade chegar (images/prompts-diorama.md). Mesma convenção das imagens finais: traço preto,
// miolo branco opaco (o objeto tapa o que está atrás) e fundo transparente. Servem para acertar composição,
// câmera e luz; não são arte final.
import { CanvasTexture, LinearMipmapLinearFilter, NoColorSpace } from "three";
import { rng } from "./geometry";

export type Kind =
  | "portal" | "musa" | "folhagem" | "cipreste" | "escadaria" | "coluna" | "arco" | "flores"
  | "sebe" | "armaria" | "abside" | "apolo" | "pedestal" | "nuvem" | "piso";

const INK = "#141010";

function pad(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.lineCap = "round";
  x.lineJoin = "round";
  return { c, x };
}

function solid(x: CanvasRenderingContext2D, p: Path2D, lw = 3, rule: CanvasFillRule = "nonzero") {
  x.fillStyle = "#fff";
  x.fill(p, rule);
  x.strokeStyle = INK;
  x.lineWidth = lw;
  x.stroke(p);
}

// Linhas paralelas na região p (recortada por uma faixa opcional): a sombra da gravura.
function hatch(x: CanvasRenderingContext2D, p: Path2D, o: { ang?: number; gap?: number; lw?: number; a?: number; band?: [number, number, number, number]; rule?: CanvasFillRule } = {}) {
  const { ang = -0.9, gap = 7, lw = 1.4, a = 0.85, band, rule = "nonzero" } = o;
  const W = x.canvas.width, H = x.canvas.height, D = Math.hypot(W, H);
  x.save();
  x.clip(p, rule);
  if (band) {
    x.beginPath();
    x.rect(...band);
    x.clip();
  }
  x.strokeStyle = INK;
  x.globalAlpha = a;
  x.lineWidth = lw;
  x.beginPath();
  const cx = W / 2, cy = H / 2, dx = Math.cos(ang), dy = Math.sin(ang);
  for (let s = -D; s < D; s += gap) {
    const ox = cx - dy * s, oy = cy + dx * s;
    x.moveTo(ox - dx * D, oy - dy * D);
    x.lineTo(ox + dx * D, oy + dy * D);
  }
  x.stroke();
  x.restore();
}

function rect(px: number, py: number, w: number, h: number) {
  const p = new Path2D();
  p.rect(px, py, w, h);
  return p;
}

// Massa orgânica (folhagem, nuvem, flores): muitos círculos dentro de uma silhueta.
function blob(r: () => number, n: number, place: () => [number, number, number]) {
  const p = new Path2D();
  const dots: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const [cx, cy, rad] = place();
    p.moveTo(cx + rad, cy);
    p.arc(cx, cy, rad, 0, Math.PI * 2);
    dots.push([cx, cy, rad]);
  }
  return { p, dots };
}

function leaves(x: CanvasRenderingContext2D, r: () => number, dots: [number, number, number][], dark: number) {
  x.strokeStyle = INK;
  x.lineWidth = 1.6;
  for (const [cx, cy, rad] of dots) {
    for (let k = 0; k < 5; k++) {
      const a = r() * Math.PI * 2, d = r() * rad * 0.8;
      const lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d;
      x.beginPath();
      x.arc(lx, ly, 3 + r() * 6, Math.PI * (0.9 + r() * 0.3), Math.PI * (1.9 + r() * 0.3));
      x.stroke();
    }
  }
  // sombra embaixo e à direita de cada tufo
  x.fillStyle = INK;
  for (const [cx, cy, rad] of dots) {
    for (let k = 0; k < rad * dark; k++) {
      const a = r() * Math.PI * 0.9 + 0.1, d = (0.55 + r() * 0.45) * rad;
      x.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6, 1.6);
    }
  }
}

function column(w: number, h: number, worn: boolean) {
  const { c, x } = pad(w, h);
  const m = w * 0.08, cx = w / 2;
  const base = h * 0.06, capH = h * 0.12, archH = h * 0.06;
  const r0 = w * 0.3, r1 = w * 0.26, top = archH + capH, bot = h - base;
  const p = new Path2D();
  p.rect(m, bot, w - 2 * m, base); // plinto
  p.rect(m, 2, w - 2 * m, archH); // arquitrave
  p.moveTo(cx - r1 * 1.55, top);
  p.lineTo(cx + r1 * 1.55, top);
  p.lineTo(cx + r1, top + capH * 0.95);
  p.lineTo(cx - r1, top + capH * 0.95);
  p.closePath(); // capitel
  const fuste = new Path2D();
  fuste.moveTo(cx - r1, top);
  fuste.quadraticCurveTo(cx - r0 * 1.04, (top + bot) / 2, cx - r0, bot);
  fuste.lineTo(cx + r0, bot);
  fuste.quadraticCurveTo(cx + r0 * 1.04, (top + bot) / 2, cx + r1, top);
  fuste.closePath();
  solid(x, fuste, 3);
  solid(x, p, 3);
  // caneluras
  x.strokeStyle = INK;
  x.lineWidth = 1.3;
  for (let i = -3; i <= 3; i++) {
    x.beginPath();
    x.moveTo(cx + (i / 4) * r1, top + 6);
    x.lineTo(cx + (i / 4) * r0, bot - 4);
    x.stroke();
  }
  // folhas de acanto no capitel
  for (let i = 0; i < 5; i++) {
    x.beginPath();
    x.arc(cx - r1 * 1.2 + i * r1 * 0.6, top + capH * 0.7, r1 * 0.3, Math.PI, 0);
    x.stroke();
  }
  hatch(x, fuste, { band: [cx + r0 * 0.3, 0, w, h], gap: 5 });
  hatch(x, p, { band: [cx + r1 * 0.4, 0, w, h], gap: 5 });
  if (worn) {
    const r = rng(9);
    x.lineWidth = 2;
    x.beginPath();
    let yy = top + (bot - top) * 0.45, xx = cx - r0;
    x.moveTo(xx, yy);
    for (let i = 0; i < 6; i++) x.lineTo((xx += (r0 * 2) / 6), (yy += (r() - 0.4) * 18));
    x.stroke();
  }
  return c;
}

function arch(w: number, h: number, kind: "portal" | "arco") {
  const { c, x } = pad(w, h);
  const ow = kind === "portal" ? w * 0.42 : w * 0.34; // vão
  const top = kind === "portal" ? h * 0.12 : h * 0.16;
  const springY = kind === "portal" ? h * 0.42 : h * 0.46; // onde o arco começa
  const cx = w / 2;
  const outer = new Path2D();
  if (kind === "portal") {
    outer.rect(w * 0.04, top + h * 0.08, w * 0.92, h - top - h * 0.08 - 2);
    outer.rect(w * 0.0 + 2, top, w - 4, h * 0.09); // entablamento
    outer.rect(w * 0.2, 4, w * 0.6, top - 4); // ático
  } else {
    outer.rect(2, top, w - 4, h - top - 2);
  }
  const hole = new Path2D();
  hole.moveTo(cx - ow / 2, h - 2);
  hole.lineTo(cx - ow / 2, springY);
  hole.arc(cx, springY, ow / 2, Math.PI, 0);
  hole.lineTo(cx + ow / 2, h - 2);
  hole.closePath();
  x.fillStyle = "#fff";
  x.fill(outer);
  x.globalCompositeOperation = "destination-out";
  x.fill(hole);
  x.globalCompositeOperation = "source-over";
  x.strokeStyle = INK;
  x.lineWidth = 3;
  x.stroke(outer);
  x.stroke(hole);
  // pilastras e aduelas
  x.lineWidth = 2;
  const pil = kind === "portal" ? [0.1, 0.17, 0.83, 0.9] : [0.12, 0.88];
  for (const f of pil) {
    x.beginPath();
    x.moveTo(w * f, top + h * 0.1);
    x.lineTo(w * f, h - 4);
    x.stroke();
  }
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * ow * 0.5, springY + Math.sin(a) * ow * 0.5);
    x.lineTo(cx + Math.cos(a) * ow * 0.62, springY + Math.sin(a) * ow * 0.62);
    x.stroke();
  }
  // sombra na metade direita e no entablamento
  hatch(x, outer, { band: [cx + ow * 0.5, top, w, h], gap: 6, a: 0.7 });
  hatch(x, outer, { band: [0, top, w, h * 0.09 + top], gap: 4, ang: 0, a: 0.5 });
  if (kind === "arco") {
    // trepadeiras no alto do muro
    const r = rng(21);
    const { p, dots } = blob(r, 46, () => [r() * w, top + r() * h * 0.22, 24 + r() * 40]);
    solid(x, p, 2.5);
    leaves(x, r, dots, 1.2);
    hatch(x, p, { band: [0, top + h * 0.12, w, h], gap: 6, a: 0.5 });
  }
  return c;
}

function figure(w: number, h: number, kind: "musa" | "apolo", face: 1 | -1) {
  const { c, x } = pad(w, h);
  const cx = w / 2, plinth = h * (kind === "musa" ? 0.08 : 0.025);
  const headR = w * 0.11, headY = h * 0.09;
  const p = new Path2D();
  p.arc(cx + face * w * 0.03, headY, headR, 0, Math.PI * 2);
  const body = new Path2D();
  body.moveTo(cx - w * 0.07, headY + headR * 0.9);
  body.lineTo(cx - w * 0.26, h * 0.22);
  body.quadraticCurveTo(cx - w * 0.3, h * 0.55, cx - w * 0.38, h - plinth);
  body.lineTo(cx + w * 0.38, h - plinth);
  body.quadraticCurveTo(cx + w * 0.3, h * 0.55, cx + w * 0.26, h * 0.22);
  body.lineTo(cx + w * 0.07, headY + headR * 0.9);
  body.closePath();
  solid(x, body, 3);
  solid(x, p, 3);
  const base = rect(w * 0.08, h - plinth, w * 0.84, plinth - 2);
  solid(x, base, 3);
  // dobras do manto
  x.strokeStyle = INK;
  x.lineWidth = 1.6;
  for (let i = 0; i < 9; i++) {
    const fx = cx - w * 0.22 + i * w * 0.055;
    x.beginPath();
    x.moveTo(fx, h * 0.26 + (i % 3) * 14);
    x.bezierCurveTo(fx + face * 10, h * 0.45, fx - face * 8, h * 0.7, fx + face * 6, h - plinth - 6);
    x.stroke();
  }
  hatch(x, body, { band: face > 0 ? [cx + w * 0.08, 0, w, h] : [0, 0, cx - w * 0.08, h], gap: 6, ang: face > 0 ? -0.9 : -2.2 });
  hatch(x, p, { band: [cx + face * w * 0.05 - (face < 0 ? w : 0), 0, w, h], gap: 5 });
  if (kind === "apolo") {
    // a lira (cítara) apoiada no lado esquerdo
    const lx = cx - w * 0.2, ly = h * 0.34;
    const lyre = new Path2D();
    lyre.moveTo(lx - w * 0.12, ly - h * 0.1);
    lyre.quadraticCurveTo(lx - w * 0.16, ly + h * 0.1, lx, ly + h * 0.14);
    lyre.quadraticCurveTo(lx + w * 0.16, ly + h * 0.1, lx + w * 0.12, ly - h * 0.1);
    lyre.lineTo(lx + w * 0.09, ly - h * 0.1);
    lyre.quadraticCurveTo(lx + w * 0.1, ly + h * 0.06, lx, ly + h * 0.09);
    lyre.quadraticCurveTo(lx - w * 0.1, ly + h * 0.06, lx - w * 0.09, ly - h * 0.1);
    lyre.closePath();
    solid(x, lyre, 2.6);
    x.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      x.beginPath();
      x.moveTo(lx + i * w * 0.018, ly - h * 0.08);
      x.lineTo(lx + i * w * 0.012, ly + h * 0.08);
      x.stroke();
    }
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(lx - w * 0.13, ly - h * 0.1);
    x.lineTo(lx + w * 0.13, ly - h * 0.1);
    x.stroke();
    // coroa de louros
    x.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.05 + i * 0.13);
      x.beginPath();
      x.ellipse(cx + w * 0.03 + Math.cos(a) * headR, headY + Math.sin(a) * headR, 6, 3, a, 0, Math.PI * 2);
      x.stroke();
    }
  }
  return c;
}

function foliage(w: number, h: number, seed: number, band: boolean) {
  const { c, x } = pad(w, h);
  const r = rng(seed);
  const { p, dots } = band
    ? blob(r, 90, () => {
      const px = r() * w;
      const top = h * (0.35 + 0.25 * Math.sin(px * 0.006 + seed));
      return [px, top + r() * (h - top), 26 + r() * 46];
    })
    : blob(r, 70, () => {
      const t = r();
      const width = w * (0.18 + 0.28 * Math.sin(Math.PI * Math.min(1, t * 1.2)));
      return [w / 2 + (r() - 0.5) * width * 2, h * 0.08 + t * h * 0.86, 30 + r() * 40];
    });
  solid(x, p, 2.6);
  leaves(x, r, dots, 1.6);
  hatch(x, p, { band: [w * 0.55, 0, w, h], gap: 6, a: 0.45 });
  if (!band) {
    x.strokeStyle = INK;
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(w / 2, h);
    x.lineTo(w / 2 + 6, h * 0.82);
    x.stroke();
  }
  return c;
}

function cypress(w: number, h: number) {
  const { c, x } = pad(w, h);
  const r = rng(5);
  const p = new Path2D();
  p.moveTo(w / 2, 4);
  p.bezierCurveTo(w * 0.95, h * 0.35, w * 0.9, h * 0.8, w * 0.6, h - 2);
  p.lineTo(w * 0.4, h - 2);
  p.bezierCurveTo(w * 0.1, h * 0.8, w * 0.05, h * 0.35, w / 2, 4);
  solid(x, p, 3);
  x.save();
  x.clip(p);
  x.strokeStyle = INK;
  x.lineWidth = 1.5;
  for (let i = 0; i < 260; i++) {
    const px = r() * w, py = r() * h;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (r() - 0.5) * 6, py + 10 + r() * 14);
    x.stroke();
  }
  x.restore();
  hatch(x, p, { band: [w * 0.5, 0, w, h], gap: 5, a: 0.7 });
  return c;
}

function steps(w: number, h: number, n: number) {
  const { c, x } = pad(w, h);
  const sh = h / n;
  for (let i = 0; i < n; i++) {
    const inset = (n - 1 - i) * w * 0.012;
    const y = i * sh;
    const p = rect(inset + 2, y + 1, w - inset * 2 - 4, sh);
    solid(x, p, 2.4);
    hatch(x, p, { band: [0, y + sh * 0.4, w, sh], ang: 0, gap: 4, a: 0.55 });
  }
  return c;
}

function niches(w: number, h: number) {
  const { c, x } = pad(w, h);
  const r = rng(13);
  const wall = rect(2, 2, w - 4, h - 4);
  solid(x, wall, 3);
  hatch(x, rect(2, 2, w - 4, h * 0.1), { ang: 0, gap: 4, a: 0.5 });
  const n = 5, gap = w / n;
  for (let i = 0; i < n; i++) {
    const nx = i * gap + gap * 0.16, nw = gap * 0.68, ny = h * 0.18, nh = h * 0.72;
    const niche = rect(nx, ny, nw, nh);
    hatch(x, niche, { gap: 4, a: 0.9 });
    x.strokeStyle = INK;
    x.lineWidth = 3;
    x.stroke(niche);
    // prateleiras com rolos de papiro
    for (let s = 0; s < 4; s++) {
      const sy = ny + nh * (0.25 + s * 0.24);
      x.fillStyle = "#fff";
      x.fillRect(nx + 3, sy, nw - 6, 5);
      x.strokeRect(nx + 3, sy, nw - 6, 5);
      for (let k = 0; k < 6; k++) {
        const rx = nx + 12 + r() * (nw - 24), ry = sy - 10 - r() * 26;
        x.beginPath();
        x.ellipse(rx, ry, 9, 9, 0, 0, Math.PI * 2);
        x.fill();
        x.stroke();
      }
    }
    // coluna embutida entre os nichos
    const col = rect(i * gap - 10, h * 0.1, 20, h * 0.9 - 2);
    if (i > 0) {
      solid(x, col, 2.4);
      hatch(x, col, { band: [i * gap, 0, 20, h], gap: 4 });
    }
  }
  return c;
}

function apse(w: number, h: number) {
  const { c, x } = pad(w, h);
  const cx = w / 2, nw = w * 0.56, spring = h * 0.42;
  const wall = rect(2, h * 0.04, w - 4, h * 0.96 - 2);
  solid(x, wall, 3);
  const niche = new Path2D();
  niche.moveTo(cx - nw / 2, h - 2);
  niche.lineTo(cx - nw / 2, spring);
  niche.arc(cx, spring, nw / 2, Math.PI, 0);
  niche.lineTo(cx + nw / 2, h - 2);
  niche.closePath();
  hatch(x, niche, { gap: 7, a: 0.45 });
  hatch(x, niche, { band: [cx + nw * 0.1, 0, w, h], gap: 5, ang: -2.3, a: 0.5 });
  x.strokeStyle = INK;
  x.lineWidth = 3;
  x.stroke(niche);
  // caixotões da meia cúpula
  x.lineWidth = 1.6;
  for (let i = 1; i < 4; i++) {
    x.beginPath();
    x.arc(cx, spring, (nw / 2) * (1 - i * 0.2), Math.PI, 0);
    x.stroke();
  }
  for (let i = 1; i < 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * nw * 0.1, spring + Math.sin(a) * nw * 0.1);
    x.lineTo(cx + Math.cos(a) * nw * 0.5, spring + Math.sin(a) * nw * 0.5);
    x.stroke();
  }
  for (const side of [-1, 1]) {
    const col = rect(cx + side * (nw / 2 + w * 0.08) - w * 0.035, h * 0.1, w * 0.07, h * 0.9 - 2);
    solid(x, col, 2.6);
    hatch(x, col, { band: [cx + side * (nw / 2 + w * 0.08), 0, w, h], gap: 4 });
  }
  return c;
}

function pedestal(w: number, h: number) {
  const { c, x } = pad(w, h);
  const p = new Path2D();
  p.rect(2, h * 0.88, w - 4, h * 0.12 - 2);
  p.rect(w * 0.06, h * 0.8, w * 0.88, h * 0.08);
  p.rect(w * 0.12, h * 0.16, w * 0.76, h * 0.64);
  p.rect(w * 0.06, h * 0.07, w * 0.88, h * 0.09);
  p.rect(2, 2, w - 4, h * 0.07);
  solid(x, p, 3);
  hatch(x, p, { band: [w * 0.66, 0, w, h], gap: 5 });
  return c;
}

function cloud(w: number, h: number, seed: number) {
  const { c, x } = pad(w, h);
  const r = rng(seed);
  const { p } = blob(r, 34, () => {
    const t = r();
    const rad = h * (0.16 + r() * 0.22);
    return [w * 0.12 + t * w * 0.76, h - rad * (0.6 + r() * 0.9) - 4, rad];
  });
  solid(x, p, 2);
  x.fillStyle = INK;
  for (let i = 0; i < 2600; i++) {
    const px = r() * w, py = h * 0.4 + r() * h * 0.6;
    if (x.isPointInPath(p, px, py) && r() < (py / h) * 0.9) x.fillRect(px, py, 1.5, 1.5);
  }
  return c;
}

function flowers(w: number, h: number, seed: number) {
  const { c, x } = pad(w, h);
  const r = rng(seed);
  const { p, dots } = blob(r, 26, () => [w * 0.1 + r() * w * 0.8, h * 0.3 + r() * h * 0.6, h * (0.1 + r() * 0.16)]);
  solid(x, p, 2.4);
  x.strokeStyle = INK;
  x.lineWidth = 1.4;
  for (const [cx, cy, rad] of dots) {
    for (let k = 0; k < 4; k++) {
      const fx = cx + (r() - 0.5) * rad, fy = cy + (r() - 0.5) * rad;
      x.beginPath();
      for (let pp = 0; pp < 5; pp++) {
        const a = (pp / 5) * Math.PI * 2;
        x.moveTo(fx, fy);
        x.arc(fx + Math.cos(a) * 4, fy + Math.sin(a) * 4, 3.5, 0, Math.PI * 2);
      }
      x.stroke();
    }
  }
  hatch(x, p, { band: [0, h * 0.6, w, h], gap: 5, a: 0.6 });
  return c;
}

function floor(w: number) {
  const { c, x } = pad(w, w);
  const r = rng(3);
  x.fillStyle = "#fff";
  x.fillRect(0, 0, w, w);
  x.strokeStyle = INK;
  x.lineWidth = 2;
  const rows = 4, sh = w / rows;
  for (let i = 0; i < rows; i++) {
    x.beginPath();
    x.moveTo(0, i * sh);
    x.lineTo(w, i * sh);
    x.stroke();
    const off = i % 2 ? sh * 0.75 : 0;
    for (let k = -1; k < 3; k++) {
      const vx = off + k * w * 0.5;
      x.beginPath();
      x.moveTo(vx, i * sh);
      x.lineTo(vx, (i + 1) * sh);
      x.stroke();
    }
  }
  x.globalAlpha = 0.5;
  x.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const px = r() * w, py = r() * w;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (r() - 0.5) * 50, py + (r() - 0.5) * 20);
    x.stroke();
  }
  return c;
}

// Cada tipo com o tamanho do canvas (a proporção define a largura do plano na cena).
export function paint(kind: Kind, seed = 1): HTMLCanvasElement {
  switch (kind) {
    case "portal": return arch(1000, 1180, "portal");
    case "arco": return arch(1500, 1220, "arco");
    case "musa": return figure(420, 1000, "musa", seed % 2 ? 1 : -1);
    case "apolo": return figure(520, 1240, "apolo", 1);
    case "folhagem": return foliage(560, 1300, seed, false);
    case "sebe": return foliage(2000, 640, seed, true);
    case "cipreste": return cypress(300, 1200);
    case "escadaria": return steps(2000, 150, 6);
    case "coluna": return column(200, 1300, seed % 2 === 0);
    case "flores": return flowers(560, 380, seed);
    case "armaria": return niches(2200, 820);
    case "abside": return apse(1200, 1500);
    case "pedestal": return pedestal(460, 560);
    case "nuvem": return cloud(1100, 520, seed);
    case "piso": return floor(512);
  }
}

export function canvasTexture(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c);
  t.colorSpace = NoColorSpace;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = 4;
  return t;
}
