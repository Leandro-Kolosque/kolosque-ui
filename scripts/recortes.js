// Processa os recortes do primeiro plano da /templo: remove fundo branco (imagens do Gemini), limpa franjas
// coloridas nas bordas, apaga ilhas soltas (objetos fantasmas), corta rente e exporta WebP com alfa.
// Os originais ficam em images/ (fora do git); a saída vai para public/templo/.
// Uso, da raiz do projeto: node scripts/recortes.js .
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = process.argv[2];
const IN = path.join(ROOT, "images");
const OUT = path.join(ROOT, "public", "templo");
fs.mkdirSync(OUT, { recursive: true });

async function raw(file, crop) {
  let img = sharp(file).ensureAlpha();
  if (crop) img = img.extract(crop);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Fundo branco ligado às bordas vira transparente; a borda do objeto ganha alfa parcial pela claridade.
function removeWhite({ data, w, h }) {
  const isBg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > 228 && mx - mn < 20;
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
  for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  fill(border, 0);
  // vãos fechados (entre as pernas do trípode, entre blocos): brancos grandes também são fundo
  for (let p = 0; p < w * h; p++) if (!seen[p] && isBg(p * 4)) fill([p], 1500);
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

async function save(img, name, maxW, maxH) {
  let s = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).trim({ threshold: 1 });
  const buf = await s.png().toBuffer();
  s = sharp(buf).resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: true });
  const out = path.join(OUT, name);
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

(async () => {
  // GPT, já com transparência
  for (const [src, name, mw] of [
    ["Gravura Botânica de Folhagens Mediterrâneas.webp", "acantos.webp", 1600],
    ["Ilustração de Oliveira Antiga em Gravura.webp", "oliveira-arvore.webp", 950],
    ["Ruínas Clássicas em Gravura Sepia.webp", "estilobato.webp", 1000],
    ["realistas/Fragmento de Capitel Iônico em Gravura Antiga.webp", "capitel.webp", 880],
    ["realistas/Tambor de Coluna Antiga Gravado-1.webp", "tambor.webp", 440],
    ["realistas/Pergaminho Antigo em Gravura Sepia.webp", "pergaminho.webp", 800],
    ["realistas/Lira Antiga Ornamentada em Gravura.webp", "lira.webp", 440],
    ["realistas/Fragmentos de Ruínas Clássicas em Gravura.webp", "fragmentos.webp", 900],
  ]) {
    const img = await raw(path.join(IN, src));
    defringe(img);
    keepLargest(img, 0.004);
    await save(img, name, mw);
  }

  // Gemini: blocos caídos. Corta logo acima da linha de chão, tira o fundo branco.
  {
    const file = path.join(IN, "Gemini_Generated_Image_fa2ymxfa2ymxfa2y.webp");
    const meta = await sharp(file).metadata();
    const probe = await raw(file);
    const gy = groundLine(probe);
    console.log("linha de chão em y =", gy);
    const img = await raw(file, { left: 0, top: 0, width: meta.width, height: gy > 0 ? gy - 3 : meta.height });
    removeWhite(img);
    keepLargest(img, 0.01);
    await save(img, "blocos.webp", 1100);
  }

  // Gemini: trípode. Recorta só a peça (a oliveira esfumada e a névoa ficam de fora) e apaga ilhas.
  {
    const file = path.join(IN, "Gemini_Generated_Image_wgwqhhwgwqhhwgwq.webp");
    // a altura para logo acima do pedestal (mais largo que o recorte): as patas ficam rentes à base
    const img = await raw(file, { left: 950, top: 0, width: 700, height: 1652 });
    // a névoa da direita fica no alto (y < 640), à direita da bacia: pinta de branco antes de tirar o fundo
    // (até a altura da borda da bacia ela chega mais perto; abaixo, a voluta da direita avança mais)
    for (let y = 0; y < 640; y++) for (let x = y < 480 ? 572 : 592; x < img.w; x++) img.data.fill(255, (y * img.w + x) * 4, (y * img.w + x) * 4 + 3);
    removeWhite(img);
    keepLargest(img, 0.002, ([x0, , x1], n) => n > 400 && x0 > 6 && x1 < img.w - 6 || n > 20000);
    await save(img, "tripode.webp", undefined, 900);
  }
})();
