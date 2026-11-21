// Motor do mundo da /templo: renderer, o caminho da câmera guiado pelo scroll e o laço de quadros.
// O mundo é um diorama (diorama.ts): camadas de gravura de pé ao longo de um eixo, com o céu atrás (sky.ts) e a
// luz por cima (fx.ts). Não há passe de pós-processamento: cada material já sai com a cor final do tema.
//
// Câmera: uma curva só atravessa o diorama, quase sempre para a frente (é andar de lado que entrega que as
// camadas são planas). Cada capítulo da página ([data-cam]) é um ponto dela; o ponto chega quando o centro do
// capítulo cruza o centro da tela. Entre dois capítulos a câmera anda junto com o scroll.
import {
  CatmullRomCurve3,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import gsap from "gsap";
import { buildDiorama } from "./diorama";
import { raw, sharedUniforms } from "./layers";
import { buildSky } from "./sky";
import { buildWordmark, type Wordmark } from "./wordmark";

export type World = {
  setNight(night: boolean): void;
  dispose(): void;
};

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

// O caminho. shot = capítulo que fica naquele ponto (os pontos sem shot só guiam a curva).
//   0 Propileus   diante dos braseiros: o KOLOSQUE, o portal entre as musas e, pelo vão, o corredor
//   –             atravessando o vão do portal
//   1 Pinacoteca  dentro do corredor, as colunas fugindo para o arco do fundo
//   –             atravessando o arco do fundo
//   2 Biblioteca  entre as paredes de nichos, o facho do Apolo lá no fim
//   3 Ordens      ao pé do pedestal, olhando o Apolo de baixo para cima
//   4 Epílogo     subindo pelo Apolo até o céu
//   5 Colofão     só o céu e as estrelas
const PATH: { shot?: number; p: Vector3; t: Vector3; fov: number }[] = [
  { shot: 0, p: v(0, 2.3, 17), t: v(0, 5.4, -20), fov: 40 },
  { p: v(0, 3.3, -4), t: v(0, 4.0, -40), fov: 44 },
  { shot: 1, p: v(0, 3.6, -22), t: v(0, 4.6, -70), fov: 46 },
  { p: v(0, 3.6, -90), t: v(0, 4.2, -130), fov: 46 },
  { shot: 2, p: v(0, 3.5, -108), t: v(0, 4.4, -150), fov: 48 },
  { shot: 3, p: v(0, 2.8, -157), t: v(0, 7.8, -172), fov: 46 },
  { shot: 4, p: v(0, 9.0, -160), t: v(0, 40, -200), fov: 50 },
  { shot: 5, p: v(0, 11, -163), t: v(0, 70, -190), fov: 56 },
];
const SHOTS = PATH.map((k, i) => (k.shot === undefined ? -1 : i)).filter((i) => i >= 0);

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Amortecimento que independe da taxa de quadros.
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const BG = { night: raw(0x17100f), day: raw(0xf9f1e7) };

export function createWorld(canvas: HTMLCanvasElement, opts: { night: boolean; reduced: boolean; onReady?: () => void }): World | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  // As cores dos materiais já estão em sRGB e saem cruas; sem conversão na saída.
  renderer.outputColorSpace = LinearSRGBColorSpace;

  const motion = !opts.reduced;
  const scene = new Scene();
  const shared = sharedUniforms();
  shared.uSway.value = motion ? 1 : 0;
  shared.uNight.value = opts.night ? 1 : 0;

  const camera = new PerspectiveCamera(PATH[0].fov, 1, 0.1, 700);
  const curveP = new CatmullRomCurve3(PATH.map((k) => k.p), false, "catmullrom", 0.42);
  const curveT = new CatmullRomCurve3(PATH.map((k) => k.t), false, "catmullrom", 0.42);

  const sky = buildSky(shared);
  scene.add(sky.quad, sky.moon);
  let loaded = false;
  const diorama = buildDiorama(scene, shared, { motion, onLoad: () => (loaded = true) });

  // Véu da entrada: o mundo aparece a partir da cor do fundo da página.
  const veil = new Scene();
  const veilMat = new MeshBasicMaterial({ color: BG.night.clone(), transparent: true, depthTest: false, depthWrite: false });
  const veilQuad = new Mesh(new PlaneGeometry(2, 2), veilMat);
  veilQuad.frustumCulled = false;
  veil.add(veilQuad);
  const veilCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // A palavra precisa da fonte carregada; entra assim que ficar pronta.
  let word: Wordmark | null = null;
  let disposed = false;
  let night = opts.night;
  buildWordmark(scene).then((w) => {
    if (disposed) return w.dispose();
    word = w;
    word.setNight(night);
    layoutWord();
    renderer.compile(scene, camera);
  });
  // Compila todos os materiais já na largada: sem isso, cada um compila na primeira vez que entra no quadro
  // e a câmera engasga no meio do caminho.
  renderer.compile(scene, camera);

  // ---------------------------------------------------------------- tamanho e desempenho
  // Resolução limitada e um regulador que baixa a escala quando os quadros ficam lentos.
  const DPR_CAP = matchMedia("(max-width: 820px)").matches ? 1.4 : 1.75;
  const perf = { scale: 1, acc: 0, n: 0 };
  let dpr = 1;
  // Quadro alto (celular): a câmera recua no próprio eixo e abre um pouco a lente, em vez de cortar o portal.
  let tall = 0;

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    dpr = Math.min(devicePixelRatio || 1, DPR_CAP) * perf.scale;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    diorama.setViewport(Math.floor(h * dpr));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    tall = clamp((1.62 - camera.aspect) / 1.05, 0, 1);
    layoutWord();
    measure();
  }

  // A palavra é medida sempre no quadro da tomada 00, onde ela mora.
  const layoutCam = new PerspectiveCamera();
  function layoutWord() {
    if (!word) return;
    layoutCam.aspect = camera.aspect;
    const p = PATH[0].p.clone(), t = PATH[0].t;
    layoutCam.fov = framed(p, t, PATH[0].fov);
    layoutCam.position.copy(p);
    layoutCam.lookAt(t);
    layoutCam.updateProjectionMatrix();
    word.layout(layoutCam, camera.aspect < 1.05);
  }

  // ---------------------------------------------------------------- scroll → capítulos
  let anchors: number[] = [0];
  function measure() {
    const secs = [...document.querySelectorAll<HTMLElement>("[data-cam]")];
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    anchors = secs.map((el, i) => {
      if (i === 0) return 0;
      if (i === secs.length - 1) return max;
      const top = el.getBoundingClientRect().top + scrollY;
      return clamp(top + el.offsetHeight / 2 - innerHeight / 2, 0, max);
    });
    for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  }
  // Progresso em capítulos: 0 na Hero, 1 na Pinacoteca... (fracionário entre eles).
  function progressFor(y: number) {
    if (anchors.length < 2 || y <= anchors[0]) return 0;
    for (let i = 0; i < anchors.length - 1; i++) if (y <= anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
    return anchors.length - 1;
  }
  const ro = new ResizeObserver(() => measure());
  ro.observe(document.body);

  // O tema troca na página de uma vez; no mundo, cruza em meio segundo.
  let nightTarget = night ? 1 : 0;
  function setNight(n: boolean) {
    night = n;
    nightTarget = n ? 1 : 0;
    word?.setNight(n);
    if (opts.reduced) shared.uNight.value = nightTarget;
  }

  // ---------------------------------------------------------------- câmera
  const rig = { prog: 0, smooth: 0, intro: opts.reduced ? 1 : 0, mx: 0, my: 0, tmx: 0, tmy: 0, cut: -1 };
  const p = new Vector3(), t = new Vector3(), d = new Vector3();
  const onPointer = (e: PointerEvent) => {
    rig.tmx = (e.clientX / innerWidth) * 2 - 1;
    rig.tmy = -((e.clientY / innerHeight) * 2 - 1);
  };
  if (motion && matchMedia("(hover: hover) and (pointer: fine)").matches) addEventListener("pointermove", onPointer, { passive: true });

  // Ajuste para quadro alto: recua no eixo de visão e abre a lente. Devolve a fov ajustada.
  function framed(pos: Vector3, target: Vector3, fov: number) {
    if (tall <= 0) return fov;
    d.subVectors(pos, target).normalize();
    pos.addScaledVector(d, tall * 6);
    return fov * (1 + tall * 0.32);
  }

  // Posição na curva para um progresso em capítulos (0 a 5).
  function pathAt(s: number) {
    const i = clamp(Math.floor(s), 0, SHOTS.length - 2), f = clamp(s - i, 0, 1);
    const idx = lerp(SHOTS[i], SHOTS[i + 1], f); // índice fracionário nos pontos da curva
    const u = idx / (PATH.length - 1);
    curveP.getPoint(u, p);
    curveT.getPoint(u, t);
    const k = Math.min(Math.floor(idx), PATH.length - 2);
    return lerp(PATH[k].fov, PATH[k + 1].fov, idx - k);
  }

  function applyCamera() {
    let fov = pathAt(rig.smooth);
    // longe da Hero, o recuo do celular diminui: dentro do corredor ele faria a câmera atravessar o portal de costas
    const back = tall;
    tall = back * (1 - smooth(0.15, 0.9, rig.smooth) * 0.85);
    fov = framed(p, t, fov);
    tall = back;
    // Entrada: a câmera chega de trás, devagar.
    const io = 1 - easeOut(rig.intro);
    p.z += io * 7;
    p.y += io * 0.8;
    fov += io * 5;
    // Paralaxe: um leve balanço de câmera na mão, mais forte na Hero. Pouco deslocamento lateral, para as
    // camadas não mostrarem que são planas.
    const par = 1 - smooth(0, 1.6, rig.smooth) * 0.55;
    p.x += rig.mx * 0.45 * par;
    p.y += rig.my * 0.25 * par;
    t.x -= rig.mx * 0.4 * par;
    t.y -= rig.my * 0.2 * par;
    camera.position.copy(p);
    camera.lookAt(t);
    if (Math.abs(camera.fov - fov) > 1e-4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- quadro
  let clock = 0, fade = 0, ready = false;
  renderer.autoClear = false;

  function frame(_time: number, deltaMs: number) {
    const raw = deltaMs / 1000;
    const dt = Math.min(raw, 0.05);
    clock += dt;
    if (!ready && loaded) {
      ready = true;
      measure();
      opts.onReady?.();
    }
    if (!ready) return; // espera as imagens para não aparecer pela metade
    // regulador de qualidade, depois que a entrada assenta
    if (clock > 2.5) {
      perf.acc += raw;
      perf.n++;
      if (perf.n >= 40) {
        const avg = perf.acc / perf.n;
        perf.acc = perf.n = 0;
        if (avg > 0.024 && perf.scale > 0.55) {
          perf.scale = Math.max(0.55, perf.scale * (avg > 0.05 ? 0.7 : 0.86));
          resize();
        } else if (avg < 0.014 && perf.scale < 1) {
          perf.scale = Math.min(1, perf.scale + 0.08);
          resize();
        }
      }
    }

    rig.prog = progressFor(scrollY);
    if (opts.reduced) {
      // Movimento reduzido: sem viagem presa ao scroll. A câmera corta para o capítulo mais próximo,
      // e o corte é coberto por um fade curto a partir da cor do fundo.
      const shot = Math.round(rig.prog);
      if (shot !== rig.cut) {
        if (rig.cut >= 0) fade = 0;
        rig.cut = shot;
        rig.smooth = shot;
      }
      fade = Math.min(1, fade + dt / 0.4);
    } else {
      // O scroll do Lenis já chega suavizado; aqui só um amortecimento curto para assentar os quadros.
      rig.smooth = damp(rig.smooth, rig.prog, 8, dt);
      fade = Math.min(1, fade + dt / 0.9);
      rig.intro = Math.min(1, rig.intro + dt / 2.6);
      rig.mx = damp(rig.mx, rig.tmx, 2.6, dt);
      rig.my = damp(rig.my, rig.tmy, 2.6, dt);
      shared.uNight.value = damp(shared.uNight.value, nightTarget, 7, dt);
      shared.uTime.value = clock;
    }
    applyCamera();
    sky.update(camera, tall, dpr);
    diorama.update(camera, clock);
    word?.update(opts.reduced ? 1.2 : Math.min(1.2, clock / 1.6), smooth(0.02, 0.6, rig.smooth));

    renderer.clear();
    renderer.render(scene, camera);
    if (fade < 1) {
      veilMat.color.copy(night ? BG.night : BG.day);
      veilMat.opacity = 1 - fade;
      renderer.render(veil, veilCam);
    }
  }

  resize();
  setNight(opts.night);
  addEventListener("resize", resize, { passive: true });
  gsap.ticker.add(frame);

  return {
    setNight,
    dispose() {
      disposed = true;
      gsap.ticker.remove(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
      ro.disconnect();
      word?.dispose();
      diorama.dispose();
      sky.dispose();
      veilQuad.geometry.dispose();
      veilMat.dispose();
      renderer.dispose();
    },
  };
}

