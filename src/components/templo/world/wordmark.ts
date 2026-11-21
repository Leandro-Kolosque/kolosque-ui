// KOLOSQUE dentro da cena: uma placa por letra (Playfair desenhada em canvas), de pé diante da escadaria,
// com um banco de capim e acanto na frente, de onde as letras sobem na entrada. Ao escurecer, o capim e as
// letras recebem a névoa da cena; ao andar para o próximo capítulo, as letras se desfazem e a câmera atravessa o capim.
// A técnica (letras em planos e um primeiro plano recortado dentro da cena) foi estudada no Kage; o desenho é nosso.
import {
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
  type Scene,
} from "three";
import { rng } from "./geometry";
import { LAYER_LIGHT } from "./sanctuary";

const FONT = '400 240px "Playfair Display Variable", "Playfair Display", Georgia, serif';
const SZ = 240, TRACK = 0.05, PAD = 24;
export const WORD_Z = 12;

type Glyph = { mesh: Mesh; baseY: number; night: CanvasTexture; day: CanvasTexture };

export type Wordmark = {
  layout(cam: PerspectiveCamera, narrow: boolean): void;
  setNight(night: boolean): void;
  // reveal: 0 a 1.2 na entrada; near: 0 a 1 conforme a câmera sai da Hero; camZ: para o capim sumir antes de ser atravessado
  update(reveal: number, near: number, camZ: number): void;
  dispose(): void;
};

function glyphCanvas(ch: string, w: number, h: number, asc: number, left: number, ascMax: number, descMax: number, stops: string[]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.font = FONT;
  x.textBaseline = "alphabetic";
  // um degradê só para a palavra inteira: o topo de todas as letras começa na mesma cor
  const g = x.createLinearGradient(0, PAD + asc - ascMax, 0, PAD + asc + descMax * 0.4);
  stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
  x.fillStyle = g;
  x.fillText(ch, PAD + left, PAD + asc);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Banco de capim seco e folhas de acanto, com o topo ondulado. Fundo transparente.
function grassTexture() {
  const W = 2048, H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const r = rng(31);
  const top = (px: number) => H * (0.42 + 0.14 * Math.sin(px * 0.0042 + 1.3) + 0.08 * Math.sin(px * 0.013 + 0.4));
  x.fillStyle = "#1f261b";
  x.beginPath();
  x.moveTo(0, H);
  for (let px = 0; px <= W; px += 16) x.lineTo(px, top(px) + 60);
  x.lineTo(W, H);
  x.fill();
  const greens = ["#2b3424", "#3a4430", "#4a4b35", "#26301f", "#55553a", "#343c29"];
  for (let i = 0; i < 2600; i++) {
    const bx = r() * W;
    const h = (H - top(bx)) * (0.55 + r() * 0.5);
    const lean = (r() - 0.5) * 60;
    const w = 2 + r() * 4;
    x.fillStyle = greens[Math.floor(r() * greens.length)];
    x.beginPath();
    x.moveTo(bx - w, H);
    x.quadraticCurveTo(bx + lean * 0.3, H - h * 0.6, bx + lean, H - h);
    x.quadraticCurveTo(bx + lean * 0.3 + w * 0.4, H - h * 0.6, bx + w, H);
    x.fill();
  }
  // folhas largas e recortadas de acanto, mais embaixo
  for (let i = 0; i < 70; i++) {
    const bx = r() * W, by = H - r() * 140;
    const len = 60 + r() * 90, ang = -Math.PI / 2 + (r() - 0.5) * 1.6;
    x.fillStyle = greens[Math.floor(r() * 3)];
    x.save();
    x.translate(bx, by);
    x.rotate(ang);
    x.beginPath();
    x.moveTo(0, 0);
    for (let k = 0; k <= 6; k++) x.lineTo(len * (k / 6), (k % 2 ? 1 : 0.55) * len * 0.22 * Math.sin((k / 6) * Math.PI));
    for (let k = 6; k >= 0; k--) x.lineTo(len * (k / 6), -(k % 2 ? 1 : 0.55) * len * 0.22 * Math.sin((k / 6) * Math.PI));
    x.fill();
    x.restore();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  return t;
}

export async function buildWordmark(scene: Scene, text = "KOLOSQUE"): Promise<Wordmark> {
  try {
    await document.fonts.load(FONT);
  } catch {
    // sem a fonte, as letras saem na serifa do sistema
  }
  const m = document.createElement("canvas").getContext("2d")!;
  m.font = FONT;
  type Metric = { ch: string; adv: number; asc: number; desc: number; l: number; r: number; pen: number };
  const metrics: Metric[] = [];
  let pen = 0, ascMax = 0, descMax = 0, xMin = Infinity, xMax = -Infinity;
  for (const ch of text) {
    const t = m.measureText(ch);
    const g = { ch, adv: t.width, asc: t.actualBoundingBoxAscent, desc: t.actualBoundingBoxDescent, l: t.actualBoundingBoxLeft, r: t.actualBoundingBoxRight, pen };
    metrics.push(g);
    ascMax = Math.max(ascMax, g.asc);
    descMax = Math.max(descMax, g.desc);
    xMin = Math.min(xMin, pen - g.l);
    xMax = Math.max(xMax, pen + g.r);
    pen += t.width + TRACK * SZ;
  }
  const ink = { cx: (xMin + xMax) / 2, w: xMax - xMin, asc: ascMax };

  const group = new Group();
  const glyphs: Glyph[] = metrics.map((g) => {
    const cw = Math.ceil(g.l + g.r) + PAD * 2, chh = Math.ceil(g.asc + g.desc) + PAD * 2;
    // noite: mármore claro, como o "KAGE" em osso; dia: tinta, para ler sobre o marfim da gravura
    const night = glyphCanvas(g.ch, cw, chh, g.asc, g.l, ascMax, descMax, ["#efe7d8", "#d6cab6", "#a8977f"]);
    const day = glyphCanvas(g.ch, cw, chh, g.asc, g.l, ascMax, descMax, ["#1e1412", "#3a2c27", "#5a4840"]);
    const mesh = new Mesh(new PlaneGeometry(cw, chh), new MeshBasicMaterial({ map: night, transparent: true, depthWrite: false, side: DoubleSide, fog: true }));
    const baseY = (g.asc - g.desc) / 2;
    mesh.position.set(g.pen + (g.r - g.l) / 2, baseY, 0);
    mesh.renderOrder = 12;
    mesh.frustumCulled = false;
    mesh.layers.set(LAYER_LIGHT);
    group.add(mesh);
    return { mesh, baseY, night, day };
  });
  group.position.z = WORD_Z;
  scene.add(group);

  const grassTex = grassTexture();
  const grass = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial({ map: grassTex, alphaTest: 0.45, side: DoubleSide, roughness: 1 }));
  grass.layers.set(LAYER_LIGHT);
  grass.renderOrder = 13;
  scene.add(grass);

  let scale = 1;
  const tmp = new Vector3();

  // Encaixa a palavra na largura do quadro da tomada 00 e põe a base dela logo acima do capim.
  function layout(cam: PerspectiveCamera, narrow: boolean) {
    cam.updateMatrixWorld(true);
    const hit = (nx: number, ny: number) => {
      tmp.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize();
      return cam.position.clone().addScaledVector(tmp, (WORD_Z - cam.position.z) / tmp.z);
    };
    const L = hit(-1, 0), R = hit(1, 0);
    scale = ((R.x - L.x) * (narrow ? 0.94 : 0.88)) / ink.w;
    // no celular a palavra fica no vão entre o botão da Hero e o índice de capítulos
    const base = hit(0, narrow ? -0.34 : -0.6);
    group.scale.setScalar(scale);
    group.position.set(-ink.cx * scale, base.y, WORD_Z);
    // capim: da altura do chão até um pouco acima da base das letras, mais largo que o quadro
    const gz = WORD_Z + 1.3;
    const gl = hit(-1.2, 0), gr = hit(1.2, 0);
    const top = base.y + ink.asc * scale * 0.24;
    const w = (gr.x - gl.x) * ((cam.position.z - gz) / (cam.position.z - WORD_Z));
    grass.scale.set(w, top + 1, 1);
    grass.position.set(0, (top - 1) / 2, gz);
    grassTex.repeat.x = w / (top + 1) / 4; // a textura tem 4:1; repete em vez de esticar
    grassTex.needsUpdate = true;
  }

  function setNight(night: boolean) {
    for (const g of glyphs) {
      (g.mesh.material as MeshBasicMaterial).map = night ? g.night : g.day;
      (g.mesh.material as MeshBasicMaterial).needsUpdate = true;
    }
  }

  function update(reveal: number, near: number, camZ: number) {
    glyphs.forEach((g, i) => {
      const st = Math.min(1, Math.max(0, (reveal - i * 0.075) / 0.62));
      const e = 1 - Math.pow(1 - st, 3);
      g.mesh.position.y = g.baseY - (1 - e) * ink.asc * 1.15;
      const mat = g.mesh.material as MeshBasicMaterial;
      mat.opacity = e * (1 - near * 0.96);
      g.mesh.visible = mat.opacity > 0.004;
    });
    // o capim some quando a câmera chega perto, para ela atravessar sem bater num plano
    const d = camZ - grass.position.z;
    const a = Math.min(1, Math.max(0, (d - 0.9) / 3.7));
    grass.visible = a > 0.01;
    (grass.material as MeshStandardMaterial).opacity = a;
    (grass.material as MeshStandardMaterial).transparent = a < 1;
  }

  return {
    layout,
    setNight,
    update,
    dispose() {
      glyphs.forEach((g) => {
        g.mesh.geometry.dispose();
        (g.mesh.material as MeshBasicMaterial).dispose();
        g.night.dispose();
        g.day.dispose();
      });
      grass.geometry.dispose();
      (grass.material as MeshStandardMaterial).dispose();
      grassTex.dispose();
      scene.remove(group, grass);
    },
  };
}
