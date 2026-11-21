// O diorama: um eixo só, do portal ao Apolo, com as camadas de gravura de pé ao longo de -z.
//   Propileus  (z  +8 a -12)  acantos e ruínas na frente, braseiros, a escadaria, o portal com o muro dos dois lados e as musas
//   Pinacoteca (z -14 a -96)  o corredor: pares de colunas a cada 8 m, sebes floridas dos lados, tochas e pétalas
//   Biblioteca (z -100 a -142) paredes de nichos com rolos de papiro dos dois lados
//   Ordens     (z -146 a -180) a abside com o Apolo no pedestal, nuvens aos pés e o facho de luz
// Medidas em metros. O chão da frente fica em y = 0; do topo da escadaria em diante, em y = 1,2.
// Cada peça diz onde pisa (x, y, z) e a altura; a largura sai da proporção da imagem.
import { Group, MathUtils, Mesh, NoColorSpace, TextureLoader, type BufferGeometry, type PerspectiveCamera, type Scene, type ShaderMaterial, type Texture } from "three";
import { DIORAMA, RECORTES, type Recorte } from "./assets";
import { buildFx } from "./fx";
import { layerMesh, MAX_LIGHTS, raw, repeatTexture, type Shared } from "./layers";
import { canvasTexture, paint, type Kind } from "./paint";

type Piece = {
  /** nome da gravura final (images/diorama/<nome>.png → public/templo/diorama/<nome>.webp) */
  name?: string;
  /** placeholder desenhado enquanto a gravura não existe */
  paint?: Kind;
  seed?: number;
  /** recorte provisório que já existe em public/templo */
  cut?: Recorte;
  x: number;
  y: number;
  z: number;
  h: number;
  flip?: boolean;
  rotY?: number;
  tint?: number;
  sway?: number;
  /** a câmera atravessa esta peça: ela some quando a câmera chega perto */
  pass?: boolean;
};

const UP = 1.2; // altura do terraço (topo da escadaria)
const BORDO = raw(0x6e1423);

function layout() {
  const P: Piece[] = [];
  // luzes: tochas (com chama, um pouco acima do topo do tripé) e a luz do facho sobre o Apolo (sem chama)
  const L: { x: number; y: number; z: number; w: number; flame: boolean }[] = [];
  const both = (p: Piece) => {
    P.push({ ...p, seed: (p.seed ?? 0) * 2 + 1 }, { ...p, x: -p.x, flip: !p.flip, seed: (p.seed ?? 0) * 2 + 2 });
  };
  const torch = (x: number, y: number, z: number, h: number) => {
    P.push({ cut: "tripode", x, y, z, h });
    L.push({ x, y: y + h + 0.18, z: z + 0.05, w: 1.5, flame: true });
  };

  // ---------------------------------------------------------------- Propileus
  P.push({ name: "folhagem-baixa", cut: "acantos", x: -5.6, y: -0.25, z: 7.6, h: 2.4, sway: 0.05 });
  P.push({ name: "folhagem-baixa", cut: "acantos", x: 6.6, y: -0.3, z: 8.2, h: 2.2, flip: true, sway: 0.05 });
  P.push({ cut: "blocos", x: -10.5, y: 0, z: 2.5, h: 1.5 });
  P.push({ cut: "fragmentos", x: 9.8, y: 0, z: 3.5, h: 0.8 });
  torch(-6.2, 0, -1.5, 2.6);
  torch(6.2, 0, -1.5, 2.6);
  for (const x of [-16, 0, 16]) P.push({ name: "escadaria", paint: "escadaria", x, y: 0, z: -6, h: UP });
  torch(-3.6, UP, -7.6, 2.2);
  torch(3.6, UP, -7.6, 2.2);
  P.push({ name: "portal", paint: "portal", x: 0, y: UP, z: -9, h: 13.5, pass: true });
  // o muro continua o portal dos dois lados até sair da tela; as trepadeiras caem do alto dele
  const WALL = 7.5;
  for (const x of [13.2, 28.2, 43.2]) {
    P.push({ name: "muro", paint: "muro", x: -x, y: UP, z: -9.15, h: WALL });
    P.push({ name: "muro", paint: "muro", x, y: UP, z: -9.15, h: WALL, flip: true });
  }
  for (let i = 0; i < 6; i++) {
    const x = 9.6 + i * 7.4;
    P.push({ name: "trepadeira", paint: "trepadeira", seed: i, x: -x, y: UP + WALL - 1.6, z: -9.0, h: 2.1, tint: 0.45 });
    P.push({ name: "trepadeira", paint: "trepadeira", seed: i + 9, x: x + 1.8, y: UP + WALL - 1.8, z: -9.0, h: 2.3, tint: 0.45, flip: true });
  }
  // as musas de pé na frente do muro, sobre plintos altos
  P.push({ name: "musa-esquerda", paint: "musa", seed: 1, x: -9.4, y: UP, z: -7.4, h: 7.4 });
  P.push({ name: "musa-direita", paint: "musa", seed: 2, x: 9.4, y: UP, z: -7.4, h: 7.4 });
  both({ name: "ciprestes", paint: "cipreste", x: -14, y: UP, z: -30, h: 14, sway: 0.08 });
  both({ name: "ciprestes", paint: "cipreste", x: -22, y: 0, z: -24, h: 15, sway: 0.08 });
  both({ name: "ciprestes", paint: "cipreste", x: -31, y: 0, z: -40, h: 19, sway: 0.08 });

  // ---------------------------------------------------------------- Pinacoteca: o corredor
  for (let i = 0; i < 10; i++) {
    const z = -16 - i * 8;
    const name = i % 2 ? "coluna-b" : "coluna-a";
    P.push({ name, paint: "coluna", seed: i, x: -4.6, y: UP, z, h: 10.5 });
    P.push({ name, paint: "coluna", seed: i + 1, x: 4.6, y: UP, z, h: 10.5, flip: true });
    if (i % 2 === 0) {
      P.push({ name: `flores-${(i / 2) % 3 + 1}`, paint: "flores", seed: i, x: -5.4, y: UP, z: z + 1.4, h: 1.5, tint: 0.85 });
      P.push({ name: `flores-${((i / 2) + 1) % 3 + 1}`, paint: "flores", seed: i + 7, x: 5.5, y: UP, z: z - 1.2, h: 1.3, tint: 0.85, flip: true });
    }
  }
  for (const z of [-28, -55, -82]) {
    P.push({ name: "dossel", paint: "sebe", seed: Math.abs(z), x: -7.6, y: UP, z, h: 8.6, rotY: Math.PI / 2, tint: 0.35 });
    P.push({ name: "dossel", paint: "sebe", seed: Math.abs(z) + 1, x: 7.6, y: UP, z, h: 8.6, rotY: -Math.PI / 2, tint: 0.35 });
  }
  P.push({ cut: "blocos", x: -3.0, y: UP, z: -37, h: 0.9 });
  P.push({ cut: "tambor", x: 3.2, y: UP, z: -53, h: 1.1 });
  P.push({ cut: "capitel", x: -3.1, y: UP, z: -69, h: 0.9 });
  P.push({ cut: "fragmentos", x: 2.9, y: UP, z: -85, h: 0.5 });
  for (const z of [-28, -44, -60, -76]) {
    torch(-3.3, UP, z, 2.2);
    torch(3.3, UP, z, 2.2);
  }
  P.push({ name: "arco-fundo", paint: "arco", x: 0, y: UP, z: -96, h: 13, pass: true });

  // ---------------------------------------------------------------- Biblioteca
  for (const z of [-111, -131]) {
    P.push({ name: "armaria", paint: "armaria", x: -7.2, y: UP, z, h: 7.5, rotY: Math.PI / 2 });
    P.push({ name: "armaria", paint: "armaria", x: 7.2, y: UP, z, h: 7.5, rotY: -Math.PI / 2 });
  }
  P.push({ name: "pergaminhos", cut: "pergaminho", x: -3.4, y: UP, z: -107, h: 0.85 });
  P.push({ name: "pergaminhos", cut: "pergaminho", x: 3.6, y: UP, z: -124, h: 0.8, flip: true });
  P.push({ cut: "lira", x: -3.0, y: UP, z: -136, h: 1.0 });
  torch(-4.4, UP, -118, 2.2);
  torch(4.4, UP, -118, 2.2);

  // ---------------------------------------------------------------- Ordens: o Apolo
  for (const z of [-150, -160]) {
    P.push({ name: "coluna-a", paint: "coluna", seed: 20, x: -6.2, y: UP, z, h: 10.5 });
    P.push({ name: "coluna-a", paint: "coluna", seed: 21, x: 6.2, y: UP, z, h: 10.5, flip: true });
  }
  P.push({ name: "abside", paint: "abside", x: 0, y: UP, z: -179, h: 17 });
  P.push({ name: "apolo", paint: "apolo", x: 0, y: UP + 3.2, z: -172, h: 8 });
  P.push({ name: "pedestal", paint: "pedestal", x: 0, y: UP, z: -171.6, h: 3.2 });
  P.push({ name: "nuvens-1", paint: "nuvem", seed: 1, x: -2.6, y: 0.9, z: -170.6, h: 2.4 });
  P.push({ name: "nuvens-3", paint: "nuvem", seed: 2, x: 2.7, y: 0.9, z: -170.4, h: 2.2, flip: true });
  P.push({ name: "nuvens-2", paint: "nuvem", seed: 3, x: -5.4, y: 1.0, z: -174, h: 4 });
  P.push({ name: "nuvens-2", paint: "nuvem", seed: 4, x: 5.6, y: 1.0, z: -174.4, h: 4, flip: true });
  torch(-3.2, UP, -167.5, 1.6);
  torch(3.2, UP, -167.5, 1.6);
  // o facho acende o Apolo: uma luz no alto, à esquerda, e outra mais fraca no peito
  L.push({ x: -1.2, y: 10.5, z: -169.4, w: 1.5, flame: false });
  L.push({ x: 0.8, y: 6, z: -169.6, w: 0.7, flame: false });

  return { P, L };
}

export function buildDiorama(scene: Scene, shared: Shared, o: { motion: boolean; onLoad: () => void }) {
  const group = new Group();
  scene.add(group);
  const { P, L } = layout();

  // ---------------------------------------------------------------- texturas
  const loader = new TextureLoader();
  const cache = new Map<string, Texture>();
  let pending = 0;
  const done = () => {
    if (--pending === 0) o.onLoad();
  };
  function load(url: string) {
    let t = cache.get(url);
    if (!t) {
      pending++;
      t = loader.load(url, done, undefined, done);
      t.colorSpace = NoColorSpace;
      t.anisotropy = 4;
      cache.set(url, t);
    }
    return t;
  }
  function painted(kind: Kind, seed: number) {
    const key = `paint:${kind}:${seed}`;
    let t = cache.get(key);
    if (!t) {
      t = canvasTexture(paint(kind, seed));
      cache.set(key, t);
    }
    return t;
  }
  // Ordem: gravura final (se já foi processada) → recorte provisório → placeholder desenhado.
  function source(p: Piece): { tex: Texture; aspect: number } {
    const fin = p.name ? DIORAMA[p.name] : undefined;
    if (fin) return { tex: load(`/templo/diorama/${p.name}.webp`), aspect: fin.w / fin.h };
    if (p.cut) return { tex: load(`/templo/${p.cut}.webp`), aspect: RECORTES[p.cut].w / RECORTES[p.cut].h };
    const tex = painted(p.paint ?? "folhagem", p.seed ?? 1);
    const img = tex.image as HTMLCanvasElement;
    return { tex, aspect: img.width / img.height };
  }

  // ---------------------------------------------------------------- peças
  const passing: { mesh: Mesh; z: number }[] = [];
  for (const p of P) {
    const { tex, aspect } = source(p);
    const mesh = layerMesh(shared, tex, p.h * aspect * (p.flip ? -1 : 1), p.h, { tint: BORDO, tintAmt: p.tint ?? 0, sway: p.sway ?? 0 });
    mesh.position.set(p.x, p.y, p.z);
    if (p.rotY) mesh.rotation.y = p.rotY;
    group.add(mesh);
    if (p.pass) passing.push({ mesh, z: p.z });
  }

  // ---------------------------------------------------------------- chão
  const floorTex = repeatTexture(painted("piso", 1));
  const floors: [number, number, number, number, number][] = [
    // x, y, z (centro), largura, comprimento
    [0, 0, 8, 70, 28],
    [0, UP, -10, 54, 8],
    [0, UP, -97.5, 15.6, 175],
  ];
  const floorGeos: BufferGeometry[] = [];
  for (const [x, y, z, w, d] of floors) {
    const f = layerMesh(shared, floorTex, w, d, { repeat: [w / 4, d / 4] });
    f.geometry = f.geometry.clone().translate(0, -0.5, 0); // o plano unitário pisa na base; o chão é centrado
    floorGeos.push(f.geometry);
    f.rotation.x = -Math.PI / 2;
    f.position.set(x, y, z);
    f.renderOrder = -5;
    group.add(f);
  }

  // ---------------------------------------------------------------- luzes (tochas)
  const lights = shared.uLights.value;
  const base: number[] = [];
  L.slice(0, MAX_LIGHTS).forEach((l, i) => {
    lights[i].set(l.x, l.y, l.z, l.w);
    base[i] = l.w;
  });

  const fx = buildFx(scene, shared, {
    flames: L.filter((l) => l.flame),
    petals: [-6.5, 6.5, -92, -14],
    shaft: { x: -1.3, y: 9.6, z: -173.2, w: 4.6, h: 16.5, tilt: 0.2 },
    motion: o.motion,
  });

  if (pending === 0) queueMicrotask(o.onLoad);

  return {
    update(cam: PerspectiveCamera, t: number) {
      // as tochas tremem sem ritmo regular (a luz do facho, não)
      for (let i = 0; i < base.length; i++) {
        if (!L[i].flame) continue;
        const n = Math.sin(t * 7.3 + i * 1.7) * 0.5 + Math.sin(t * 13.1 + i * 3.1) * 0.3 + Math.sin(t * 2.3 + i) * 0.2;
        lights[i].w = base[i] * (0.86 + 0.14 * n);
      }
      // o portal e o arco do fundo somem quando a câmera chega perto, para ela atravessar sem bater num plano
      for (const p of passing) {
        const a = MathUtils.clamp((cam.position.z - p.z - 0.6) / 5, 0, 1);
        (p.mesh.material as ShaderMaterial).uniforms.uOpacity.value = a;
        p.mesh.visible = a > 0.01;
      }
    },
    setViewport: fx.setViewport,
    dispose() {
      fx.dispose();
      group.traverse((obj) => {
        if (obj instanceof Mesh) (obj.material as ShaderMaterial).dispose();
      });
      floorGeos.forEach((g) => g.dispose());
      cache.forEach((t) => t.dispose());
      scene.remove(group);
    },
  };
}

export type Diorama = ReturnType<typeof buildDiorama>;
