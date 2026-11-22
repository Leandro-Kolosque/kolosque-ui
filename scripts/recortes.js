// Processa os recortes do primeiro plano da /templo: remove fundo branco (imagens do Gemini), limpa franjas
// coloridas nas bordas, apaga ilhas soltas (objetos fantasmas), corta rente e exporta WebP com alfa.
// Os originais ficam em images/ (fora do git); a saída vai para public/templo/.
// Uso, da raiz do projeto: node scripts/recortes.js .
const sharp = require("sharp");
const { raw, removeWhite, defringe, keepLargest, groundLine, save: saveTo } = require("./cutout");
const path = require("path");
const fs = require("fs");

const ROOT = process.argv[2];
const IN = path.join(ROOT, "images");
const OUT = path.join(ROOT, "public", "templo");
fs.mkdirSync(OUT, { recursive: true });

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
    await saveTo(img, name, mw, undefined, OUT);
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
    await saveTo(img, "blocos.webp", 1100, undefined, OUT);
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
    await saveTo(img, "tripode.webp", undefined, 900, OUT);
  }
})();
