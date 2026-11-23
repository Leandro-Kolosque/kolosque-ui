// Processa as gravuras do diorama da /templo (geradas a partir de images/prompts-diorama.md).
//   entrada: images/diorama/<nome>.png|webp|jpg (originais, fora do git)
//   saída:   public/templo/diorama/<nome>.webp, com o fundo transparente e cortada rente
//   e reescreve a lista DIORAMA em src/components/templo/world/assets.ts com o tamanho de cada uma:
//   a cena troca o placeholder pela gravura sozinha.
// Imagem com transparência (GPT): limpa as franjas e as ilhas soltas. Sem transparência (Gemini, ampliações):
// tira o fundo branco ligado às bordas e os vãos brancos grandes (o vão do portal, por exemplo).
// As texturas (piso, céu) não são recortadas, só reduzidas.
// Uso, da raiz do projeto: node scripts/diorama.js .
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { raw, removeWhite, defringe, keepLargest, save } = require("./cutout");

const ROOT = process.argv[2] || ".";
const IN = path.join(ROOT, "images", "diorama");
const OUT = path.join(ROOT, "public", "templo", "diorama");
const ASSETS = path.join(ROOT, "src", "components", "templo", "world", "assets.ts");
fs.mkdirSync(OUT, { recursive: true });

const TEXTURES = new Set(["piso", "ceu-nuvens"]);
// maior lado na saída: as peças que enchem a tela pedem mais pixels
const MAX = { portal: 2400, apolo: 2400, abside: 2048, piso: 1024 };
const DEFAULT_MAX = 1800;
// a partir de que fração da imagem um vão fechado de branco quase puro vira fundo (o resto é brilho do mármore
// e fica); a balaustrada do muro tem vãos pequenos entre os balaústres
const HOLE = { muro: 0.0005 };
const DEFAULT_HOLE = 0.004;
// peças que emendam lado a lado: o fundo não entra pelas bordas laterais
const TILES = new Set(["muro"]);

async function hasTransparency(file) {
  const m = await sharp(file).metadata();
  if (!m.hasAlpha) return false;
  const { data } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let clear = 0;
  for (let i = 0; i < data.length; i += 7) if (data[i] < 16) clear++;
  return clear > data.length / 7 / 50; // ao menos 2% transparente
}

(async () => {
  const files = fs.readdirSync(IN).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).sort();
  const sizes = {};
  for (const f of files) {
    const name = path.parse(f).name.toLowerCase();
    const file = path.join(IN, f);
    const max = MAX[name] ?? DEFAULT_MAX;
    if (TEXTURES.has(name)) {
      const out = path.join(OUT, `${name}.webp`);
      await sharp(file).resize({ width: max, height: max, fit: "inside", withoutEnlargement: true }).webp({ quality: 74, effort: 6 }).toFile(out);
      const m = await sharp(out).metadata();
      console.log(`${name}.webp`, `${m.width}x${m.height}`, Math.round(fs.statSync(out).size / 1024) + "KB", "(textura)");
      sizes[name] = { w: m.width, h: m.height };
      continue;
    }
    const img = await raw(file);
    if (await hasTransparency(file)) {
      defringe(img);
    } else {
      removeWhite(img, Math.round(img.w * img.h * (HOLE[name] ?? DEFAULT_HOLE)), 246, !TILES.has(name));
    }
    keepLargest(img, 0.004);
    await save(img, `${name}.webp`, max, max, OUT);
    const m = await sharp(path.join(OUT, `${name}.webp`)).metadata();
    sizes[name] = { w: m.width, h: m.height };
  }

  // reescreve só a lista DIORAMA em assets.ts
  const src = fs.readFileSync(ASSETS, "utf8");
  const body = Object.entries(sizes).map(([k, v]) => `  ${JSON.stringify(k)}: { w: ${v.w}, h: ${v.h} },`).join("\n");
  const list = `export const DIORAMA: Record<string, { w: number; h: number }> = {${body ? `\n${body}\n` : ""}};`;
  const next = src.replace(/export const DIORAMA: Record<string, \{ w: number; h: number \}> = \{[\s\S]*?\n?\};/, list);
  if (next === src && !src.includes(list)) throw new Error("diorama.js: não achei a lista DIORAMA em assets.ts");
  fs.writeFileSync(ASSETS, next);
  console.log(`assets.ts: ${Object.keys(sizes).length} gravura(s) registradas`);
})();
