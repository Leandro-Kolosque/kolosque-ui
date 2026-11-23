// Ferramentas de recorte das gravuras geradas (usadas por recortes.js e diorama.js): tirar o fundo branco
// (Gemini), limpar franjas coloridas nas bordas (GPT), apagar ilhas soltas (objetos fantasmas), achar a linha
// de chão e salvar em WebP com alfa, cortado rente.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function raw(file, crop) {
  let img = sharp(file).ensureAlpha();
  if (crop) img = img.extract(crop);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Fundo branco ligado às bordas vira transparente; a borda do objeto ganha alfa parcial pela claridade.
// holeMin: os vãos fechados (ex.: entre balaústres) só viram fundo se forem branco quase puro; o mármore claro
// fica um pouco abaixo disso e não é furado.
// fromSides = false: a peça emenda de lado (o muro), então o fundo só é procurado a partir do alto e da base.
function removeWhite({ data, w, h }, minHole = 1500, holeMin = 228, fromSides = true) {
  let floor = 228;
  const isBg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > floor && mx - mn < 20;
  };
  const seen = new Uint8Array(w * h);
  const fill = (seeds, minArea) => {
    // preenche a região branca a partir das sementes; se for menor que minArea, desfaz (é um brilho do objeto)
    const region = [];
    const stack = [...seeds];
    while (stack.length) {
      const p = stack.pop();
      if (seen[p] || !isBg(p * 4)) continue;
      seen[p] = 1;
      region.push(p);
      const x = p % w, y = (p / w) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - w);
      if (y < h - 1) stack.push(p + w);
    }
    if (region.length < minArea) {
      for (const p of region) seen[p] = 2; // marcado como visto, mas fica opaco
      return;
    }
    for (const p of region) data[p * 4 + 3] = 0;
  };
  const border = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  if (fromSides) for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  fill(border, 0);
  // vãos fechados (entre as pernas do trípode, entre blocos): brancos grandes também são fundo
  floor = holeMin;
  for (let p = 0; p < w * h; p++) if (!seen[p] && isBg(p * 4)) fill([p], minHole);
  for (let p = 0; p < w * h; p++) if (seen[p] === 2) seen[p] = 0;
  // antisserrilhado: pixels claros encostados no fundo ficam parcialmente transparentes
  for (let p = 0; p < w * h; p++) {
    if (seen[p]) continue;
    const x = p % w, y = (p / w) | 0;
    const nb = (x > 0 && seen[p - 1]) || (x < w - 1 && seen[p + 1]) || (y > 0 && seen[p - w]) || (y < h - 1 && seen[p + w]);
    if (!nb) continue;
    const i = p * 4;
    const L = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (L > 200) data[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (245 - L) / 45)));
  }
}

// Franjas: pixels semitransparentes muito saturados (vermelho, amarelo) viram a sépia do traço.
// Alfa quase cheio (o WebP com perda deixa ~252) vira cheio.
function defringe({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    if (a >= 245) {
      data[i + 3] = 255;
      continue;
    }
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn > 45) {
      data[i] = 88;
      data[i + 1] = 68;
      data[i + 2] = 52;
    }
  }
}

// Mantém só os pedaços grandes (o objeto); ilhas pequenas e soltas somem.
function keepLargest({ data, w, h }, minShare = 0.02, keep) {
  const label = new Int32Array(w * h).fill(-1);
  const sizes = [], boxes = [];
  for (let s = 0; s < w * h; s++) {
    if (label[s] !== -1 || data[s * 4 + 3] < 24) continue;
    const id = sizes.length;
    let n = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
    const st = [s];
    label[s] = id;
    while (st.length) {
      const p = st.pop();
      n++;
      const x = p % w, y = (p / w) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && label[q] === -1 && data[q * 4 + 3] >= 24) {
          label[q] = id;
          st.push(q);
        }
      }
    }
    sizes.push(n);
    boxes.push([x0, y0, x1, y1]);
  }
  const big = Math.max(...sizes);
  const ok = sizes.map((n, id) => n >= big * minShare && (!keep || keep(boxes[id], n)));
  for (let p = 0; p < w * h; p++) {
    const id = label[p];
    if (id >= 0 && !ok[id]) data[p * 4 + 3] = 0;
    if (id === -1 && data[p * 4 + 3] < 24) data[p * 4 + 3] = 0;
  }
}

async function save(img, name, maxW, maxH, outDir) {
  let s = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).trim({ threshold: 1 });
  const buf = await s.png().toBuffer();
  s = sharp(buf).resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: true });
  const out = path.join(outDir, name);
  await s.webp({ quality: 70, alphaQuality: 85, effort: 6 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(name, `${m.width}x${m.height}`, Math.round(fs.statSync(out).size / 1024) + "KB");
}

// Linha de chão do Gemini: a primeira linha de baixo para cima com tinta em mais de 60% da largura.
function groundLine({ data, w, h }) {
  for (let y = h - 1; y > h * 0.5; y--) {
    let dark = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i] + data[i + 1] + data[i + 2] < 300) dark++;
    }
    if (dark > w * 0.6) return y;
  }
  return -1;
}

module.exports = { raw, removeWhite, defringe, keepLargest, groundLine, save };
