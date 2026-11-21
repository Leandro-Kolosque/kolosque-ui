// Motor do mundo da /templo: renderer, o caminho da câmera guiado pelo scroll e o laço de quadros.
// Pipeline de cada quadro:
//   1. (só se a gravura estiver na tela) normais da arquitetura → normalRT
//   2. cena inteira em HDR → colorRT (com a profundidade numa textura)
//   3. passe final em tela cheia (ink.ts): pura, gravura ou as duas lado a lado
//
// Câmera: uma curva só atravessa o santuário. Cada capítulo da página ([data-cam]) é um ponto dela; o ponto
// chega quando o centro do capítulo cruza o centro da tela. Entre dois capítulos a câmera anda junto com o scroll.
import {
  CatmullRomCurve3,
  Color,
  DepthTexture,
  HalfFloatType,
  Mesh,
  MeshNormalMaterial,
  NoToneMapping,
  OrthographicCamera,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import gsap from "gsap";
import { buildSanctuary } from "./sanctuary";
import { buildWordmark, type Wordmark } from "./wordmark";
import { inkMaterial, srgb } from "./ink";

export type World = {
  setNight(night: boolean): void;
  setSplit(split: number): void;
  dispose(): void;
};

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

// O caminho. shot = capítulo que fica naquele ponto (os pontos sem shot só desviam a curva da arquitetura).
//   0 Propileus   ao pé da escadaria, lente longa: os Propileus, o templo no alto e a lua atrás do frontão
//   1 Pinacoteca  na escada, virando para a ala noroeste acesa (onde ficavam as pinturas)
//   –             por cima do telhado dos Propileus, para não atravessá-los
//   2 Biblioteca  na ponta da stoa, com a colunata fugindo para o fundo
//   3 Ordens      colada à coluna do canto do templo, olhando para cima
//   4 Epílogo     recuada e no alto, de frente para a fachada e a porta acesa
//   5 Colofão     do alto, o santuário na névoa
const PATH: { shot?: number; p: Vector3; t: Vector3; fov: number }[] = [
  { shot: 0, p: v(0, 4, 24), t: v(0, 14, -50), fov: 36 },
  { shot: 1, p: v(-3.5, 7.2, -1.5), t: v(-19, 10, -19), fov: 46 },
  { p: v(6, 21, -20), t: v(16, 16, -60), fov: 42 },
  { shot: 2, p: v(18.4, 16.8, -40), t: v(26.5, 15.6, -100), fov: 42 },
  { shot: 3, p: v(15.6, 15.8, -42.6), t: v(12.4, 26.5, -54), fov: 50 },
  { shot: 4, p: v(0, 22.5, -11), t: v(0, 25.5, -60), fov: 42 },
  { shot: 5, p: v(0, 52, -18), t: v(0, 8, -64), fov: 46 },
];
const SHOTS = PATH.map((k, i) => (k.shot === undefined ? -1 : i)).filter((i) => i >= 0);
const FACING = new Color(0.5, 0.5, 1);
const BLACK = new Color(0, 0, 0);

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Amortecimento que independe da taxa de quadros.
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function createWorld(canvas: HTMLCanvasElement, opts: { night: boolean; reduced: boolean; onReady?: () => void }): World | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const world = buildSanctuary();
  const camera = new PerspectiveCamera(PATH[0].fov, 1, 0.5, 600);
  camera.layers.enableAll();
  const curveP = new CatmullRomCurve3(PATH.map((k) => k.p), false, "catmullrom", 0.42);
  const curveT = new CatmullRomCurve3(PATH.map((k) => k.t), false, "catmullrom", 0.42);

  const colorRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 0 });
  colorRT.depthTexture = new DepthTexture(1, 1);
  const normalRT = new WebGLRenderTarget(1, 1);
  const normalMat = new MeshNormalMaterial();

  const ink = inkMaterial();
  ink.uniforms.tColor.value = colorRT.texture;
  ink.uniforms.tDepth.value = colorRT.depthTexture;
  ink.uniforms.tNormal.value = normalRT.texture;
  const post = new Scene();
  const quad = new Mesh(new PlaneGeometry(2, 2), ink);
  quad.frustumCulled = false;
  post.add(quad);
  const postCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // A palavra precisa da fonte carregada; entra assim que ficar pronta.
  let word: Wordmark | null = null;
  let disposed = false;
  let night = opts.night;
  buildWordmark(world.scene).then((w) => {
    if (disposed) return w.dispose();
    word = w;
    word.setNight(night);
    layoutWord();
    renderer.compile(world.scene, camera);
  });
  // Compila todos os materiais já na largada: sem isso, cada um compila na primeira vez que entra no quadro
  // e a câmera engasga no meio do caminho.
  renderer.compile(world.scene, camera);

  // ---------------------------------------------------------------- tamanho e desempenho
  // Resolução limitada e um regulador que baixa a escala quando os quadros ficam lentos.
  const DPR_CAP = matchMedia("(max-width: 820px)").matches ? 1.4 : 1.75;
  const perf = { scale: 1, acc: 0, n: 0 };
  // Quadro alto (celular): a câmera recua no próprio eixo e abre um pouco a lente, em vez de cortar o portal.
  let tall = 0;

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP) * perf.scale;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    const pw = Math.max(1, Math.floor(w * dpr)), ph = Math.max(1, Math.floor(h * dpr));
    colorRT.setSize(pw, ph);
    normalRT.setSize(pw, ph);
    ink.uniforms.uRes.value.set(pw, ph);
    ink.uniforms.uDpr.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    tall = clamp((1.62 - camera.aspect) / 1.05, 0, 1);
    world.setMoonAspect(tall);
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

  function setNight(n: boolean) {
    night = n;
    world.setNight(n);
    word?.setNight(n);
    ink.uniforms.uNight.value = n ? 1 : 0;
    ink.uniforms.uPaper.value.copy(srgb(n ? 0x17100f : 0xf9f1e7));
    ink.uniforms.uInk.value.copy(srgb(n ? 0xede4d3 : 0x1e1412));
    ink.uniforms.uGold.value.copy(srgb(n ? 0xc9a55c : 0xa8833e));
    renderer.shadowMap.needsUpdate = true;
  }

  // ---------------------------------------------------------------- câmera
  const rig = { prog: 0, smooth: 0, intro: opts.reduced ? 1 : 0, mx: 0, my: 0, tmx: 0, tmy: 0, cut: -1 };
  const p = new Vector3(), t = new Vector3(), d = new Vector3();
  const onPointer = (e: PointerEvent) => {
    rig.tmx = (e.clientX / innerWidth) * 2 - 1;
    rig.tmy = -((e.clientY / innerHeight) * 2 - 1);
  };
  if (!opts.reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) addEventListener("pointermove", onPointer, { passive: true });

  // Ajuste para quadro alto: recua no eixo de visão e abre a lente. Devolve a fov ajustada.
  function framed(pos: Vector3, target: Vector3, fov: number) {
    if (tall <= 0) return fov;
    d.subVectors(pos, target).normalize();
    pos.addScaledVector(d, tall * 14);
    pos.y += tall * 1.6;
    return fov * (1 + tall * 0.3);
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
    fov = framed(p, t, fov);
    // Entrada: uma lente mais longa que se aproxima de trás.
    const io = 1 - easeOut(rig.intro);
    p.z += io * 9;
    p.y += io * 1.2;
    fov += io * 6;
    // Paralaxe: um leve balanço de câmera na mão, mais forte na Hero.
    const par = 1 - smooth(0, 1.6, rig.smooth) * 0.55;
    p.x += rig.mx * 0.9 * par;
    p.y += rig.my * 0.45 * par;
    t.x -= rig.mx * 0.3 * par;
    t.y -= rig.my * 0.18 * par;
    camera.position.copy(p);
    camera.lookAt(t);
    if (Math.abs(camera.fov - fov) > 1e-4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  // ---------------------------------------------------------------- quadro
  let clock = 0, fade = 0, ready = false;
  const motion = !opts.reduced;

  function render() {
    const split = ink.uniforms.uSplit.value as number;
    if (split > 0) {
      camera.layers.set(0);
      world.scene.overrideMaterial = normalMat;
      renderer.setRenderTarget(normalRT);
      // Fundo "virado para a câmera" com alfa 0: o que não é arquitetura (lua, chamas, porta) fica marcado como luz.
      renderer.setClearColor(FACING, 0);
      renderer.clear();
      renderer.render(world.scene, camera);
      world.scene.overrideMaterial = null;
      camera.layers.enableAll();
    }
    renderer.setRenderTarget(colorRT);
    renderer.setClearColor(BLACK, 1);
    renderer.clear();
    renderer.render(world.scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(post, postCam);
  }

  function frame(_time: number, deltaMs: number) {
    const raw = deltaMs / 1000;
    const dt = Math.min(raw, 0.05);
    clock += dt;
    if (!ready) {
      ready = true;
      measure();
      opts.onReady?.();
    }
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
      fade = Math.min(1, fade + dt / 0.7);
      rig.intro = Math.min(1, rig.intro + dt / 2.4);
      rig.mx = damp(rig.mx, rig.tmx, 2.6, dt);
      rig.my = damp(rig.my, rig.tmy, 2.6, dt);
    }
    ink.uniforms.uFade.value = fade;
    applyCamera();
    world.update(dt, clock, motion);
    word?.update(opts.reduced ? 1.2 : Math.min(1.2, clock / 1.5), smooth(0.02, 0.92, rig.smooth), camera.position.z);
    render();
  }

  resize();
  setNight(opts.night);
  addEventListener("resize", resize, { passive: true });
  gsap.ticker.add(frame);

  return {
    setNight,
    setSplit: (s) => { ink.uniforms.uSplit.value = clamp(s, 0, 1); },
    dispose() {
      disposed = true;
      gsap.ticker.remove(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
      ro.disconnect();
      word?.dispose();
      world.dispose();
      colorRT.dispose();
      normalRT.dispose();
      normalMat.dispose();
      ink.dispose();
      quad.geometry.dispose();
      renderer.dispose();
    },
  };
}
