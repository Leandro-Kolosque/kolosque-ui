// Motor do mundo da /templo: renderer, câmera da tomada 00 e o laço de quadros.
// Pipeline de cada quadro:
//   1. (só se a gravura estiver na tela) normais da arquitetura → normalRT
//   2. cena inteira em HDR → colorRT (com a profundidade numa textura)
//   3. passe final em tela cheia (ink.ts): gravura, pura ou as duas lado a lado
// Fase 2 (protótipo): a câmera fica na tomada 00, com a aproximação de entrada e a paralaxe do mouse.
// O caminho por todas as tomadas, guiado pelo scroll, entra na fase 3.
import {
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
import { inkMaterial, srgb } from "./ink";

export type World = {
  setNight(night: boolean): void;
  setSplit(split: number): void;
  dispose(): void;
};

// Tomada 00: ao pé da escadaria, lente longa, olhando os Propileus e o templo no alto.
const SHOT0 = { p: new Vector3(0, 4, 24), t: new Vector3(0, 14, -50), fov: 36 };
const FACING = new Color(0.5, 0.5, 1);
const BLACK = new Color(0, 0, 0);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
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
  const camera = new PerspectiveCamera(SHOT0.fov, 1, 0.5, 600);
  camera.layers.enableAll();

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

  // Desempenho: resolução limitada e um regulador que baixa a escala quando os quadros ficam lentos.
  const DPR_CAP = matchMedia("(max-width: 820px)").matches ? 1.4 : 1.75;
  const perf = { scale: 1, acc: 0, n: 0 };

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
  }

  function setNight(night: boolean) {
    world.setNight(night);
    ink.uniforms.uNight.value = night ? 1 : 0;
    ink.uniforms.uPaper.value.copy(srgb(night ? 0x17100f : 0xf9f1e7));
    ink.uniforms.uInk.value.copy(srgb(night ? 0xede4d3 : 0x1e1412));
    ink.uniforms.uGold.value.copy(srgb(night ? 0xc9a55c : 0xa8833e));
    renderer.shadowMap.needsUpdate = true;
  }

  // ---------------------------------------------------------------- câmera
  const rig = { intro: opts.reduced ? 1 : 0, mx: 0, my: 0, tmx: 0, tmy: 0 };
  const p = new Vector3(), t = new Vector3(), d = new Vector3();
  const onPointer = (e: PointerEvent) => {
    rig.tmx = (e.clientX / innerWidth) * 2 - 1;
    rig.tmy = -((e.clientY / innerHeight) * 2 - 1);
  };
  if (!opts.reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) addEventListener("pointermove", onPointer, { passive: true });

  function applyCamera() {
    p.copy(SHOT0.p);
    t.copy(SHOT0.t);
    let fov = SHOT0.fov;
    // Quadro alto (celular): a câmera recua no próprio eixo e abre um pouco a lente, em vez de cortar o portal.
    const tall = clamp((1.62 - camera.aspect) / 1.05, 0, 1);
    d.subVectors(p, t).normalize();
    p.addScaledVector(d, tall * 16);
    p.y += tall * 2;
    fov *= 1 + tall * 0.32;
    // Entrada: uma lente mais longa que se aproxima de trás.
    const io = 1 - easeOut(rig.intro);
    p.z += io * 9;
    p.y += io * 1.2;
    fov += io * 6;
    // Paralaxe: um leve balanço de câmera na mão.
    p.x += rig.mx * 0.9;
    p.y += rig.my * 0.45;
    t.x -= rig.mx * 0.3;
    t.y -= rig.my * 0.18;
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
    fade = opts.reduced ? 1 : Math.min(1, fade + dt / 0.7);
    if (!opts.reduced) rig.intro = Math.min(1, rig.intro + dt / 2.4);
    rig.mx = damp(rig.mx, rig.tmx, 2.6, dt);
    rig.my = damp(rig.my, rig.tmy, 2.6, dt);
    ink.uniforms.uFade.value = fade;
    applyCamera();
    world.update(dt, clock, motion);
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
      gsap.ticker.remove(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
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
