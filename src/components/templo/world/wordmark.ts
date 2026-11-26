// KOLOSQUE dentro da cena: uma placa por letra (Playfair desenhada em canvas), de pé entre os braseiros e os
// acantos do primeiro plano, que cobrem a base das letras. Na entrada as letras sobem uma a uma; ao andar para o
// próximo capítulo, elas se desfazem. A técnica (letras em planos dentro da cena) foi estudada no Kage; o desenho é nosso.
import {
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  Vector3,
  type Scene,
} from "three";

const FONT = '400 240px "Playfair Display Variable", "Playfair Display", Georgia, serif';
const SZ = 240, TRACK = 0.05, PAD = 24;
export const WORD_Z = 4.5;

type Glyph = { mesh: Mesh; baseY: number; night: CanvasTexture; day: CanvasTexture };

export type Wordmark = {
  layout(cam: PerspectiveCamera, narrow: boolean): void;
  setNight(night: boolean): void;
  // reveal: 0 a 1.2 na entrada; near: 0 a 1 conforme a câmera sai da Hero
  update(reveal: number, near: number): void;
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
  t.colorSpace = NoColorSpace;
  t.anisotropy = 8;
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
    const mesh = new Mesh(new PlaneGeometry(cw, chh), new MeshBasicMaterial({ map: night, transparent: true, depthWrite: false, side: DoubleSide }));
    const baseY = (g.asc - g.desc) / 2;
    mesh.position.set(g.pen + (g.r - g.l) / 2, baseY, 0);
    mesh.renderOrder = 12;
    mesh.frustumCulled = false;
    group.add(mesh);
    return { mesh, baseY, night, day };
  });
  group.position.z = WORD_Z;
  scene.add(group);

  let scale = 1;
  const tmp = new Vector3();

  // Encaixa a palavra na largura do quadro da tomada 00, com a base no terço de baixo (os acantos cobrem o pé).
  function layout(cam: PerspectiveCamera, narrow: boolean) {
    cam.updateMatrixWorld(true);
    const hit = (nx: number, ny: number) => {
      tmp.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize();
      return cam.position.clone().addScaledVector(tmp, (WORD_Z - cam.position.z) / tmp.z);
    };
    const L = hit(-1, 0), R = hit(1, 0);
    scale = ((R.x - L.x) * (narrow ? 0.94 : 0.88)) / ink.w;
    // no celular a palavra fica sobre a escadaria, entre o portal e o índice de capítulos
    const base = hit(0, narrow ? -0.5 : -0.6);
    group.scale.setScalar(scale);
    group.position.set(-ink.cx * scale, base.y, WORD_Z);
  }

  function setNight(night: boolean) {
    for (const g of glyphs) {
      (g.mesh.material as MeshBasicMaterial).map = night ? g.night : g.day;
      (g.mesh.material as MeshBasicMaterial).needsUpdate = true;
    }
  }

  function update(reveal: number, near: number) {
    glyphs.forEach((g, i) => {
      const st = Math.min(1, Math.max(0, (reveal - i * 0.075) / 0.62));
      const e = 1 - Math.pow(1 - st, 3);
      g.mesh.position.y = g.baseY - (1 - e) * ink.asc * 1.15;
      const mat = g.mesh.material as MeshBasicMaterial;
      mat.opacity = e * (1 - near * 0.96);
      g.mesh.visible = mat.opacity > 0.004;
    });
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
      scene.remove(group);
    },
  };
}
