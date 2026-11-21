// Camadas do diorama: cada imagem (nanquim preto sobre branco, com fundo transparente) vira um plano de pé na cena.
// A cor não vem da imagem, vem daqui:
//   dia   → a gravura em sépia sobre o marfim; a névoa leva o que está longe para a cor do papel (perspectiva aérea);
//   noite → o branco da imagem vira mármore sob o luar fraco, as tochas próximas acendem a pedra em tom quente
//           e a névoa escura engole o fundo.
// Todos os materiais dividem os mesmos uniformes (tema, tempo, luzes), então trocar o tema é mudar um número.
import {
  Color,
  DoubleSide,
  LinearSRGBColorSpace,
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector4,
  type Texture,
} from "three";

export const MAX_LIGHTS = 20;

// Cor em sRGB guardada sem conversão. O three converte hexadecimais para o espaço linear por padrão; aqui os
// shaders trabalham direto em sRGB (e a saída não converte de volta), então o valor tem de chegar cru.
export const raw = (hex: number) => new Color().setRGB(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, LinearSRGBColorSpace);

export function sharedUniforms() {
  return {
    uNight: { value: 1 },
    uTime: { value: 0 },
    uSway: { value: 1 }, // 0 com movimento reduzido
    uPaper: { value: raw(0xf9f1e7) },
    uPaperLow: { value: raw(0xefe2cd) },
    uSepia: { value: raw(0x3a281e) },
    uInkN: { value: raw(0x0e0908) },
    uMarble: { value: raw(0xcdc1ab) },
    uAmbient: { value: new Color(0.16, 0.16, 0.2) },
    uTorch: { value: new Color(1.0, 0.6, 0.3) },
    uHazeN: { value: raw(0x251916) },
    uZenithN: { value: raw(0x0b0706) },
    uFogDay: { value: new Vector2(30, 165) },
    uFogNight: { value: new Vector2(12, 120) },
    uLights: { value: Array.from({ length: MAX_LIGHTS }, () => new Vector4(0, -999, 0, 0)) },
  };
}
export type Shared = ReturnType<typeof sharedUniforms>;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSway;
  uniform float uSwayAmt;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    // folhagem: o topo balança devagar, a base fica presa
    float k = uv.y * uv.y * uSwayAmt * uSway;
    w.x += sin(uTime * 0.55 + w.z * 0.37 + w.x * 0.21) * k;
    w.y += sin(uTime * 0.8 + w.x * 0.5) * k * 0.12;
    vWorld = w.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

const FRAG = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 uRepeat;
  uniform float uOpacity;
  uniform vec3 uTint;
  uniform float uTintAmt;
  uniform float uNight;
  uniform vec3 uPaper;
  uniform vec3 uSepia;
  uniform vec3 uInkN;
  uniform vec3 uMarble;
  uniform vec3 uAmbient;
  uniform vec3 uTorch;
  uniform vec3 uHazeN;
  uniform vec2 uFogDay;
  uniform vec2 uFogNight;
  uniform vec4 uLights[${MAX_LIGHTS}];
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vec4 tex = texture2D(map, vUv * uRepeat);
    if (tex.a < 0.35) discard;
    float L = smoothstep(0.04, 0.96, dot(tex.rgb, vec3(0.299, 0.587, 0.114)));

    // dia: sépia sobre marfim; uTint (bordô das flores) tinge a tinta
    vec3 day = mix(uSepia, uPaper, L);
    day = mix(day, mix(uTint * 0.7, mix(uTint, uPaper, 0.55), L), uTintAmt);

    // noite: mármore sob o luar e as tochas
    vec3 alb = mix(uInkN, uMarble, L);
    alb = mix(alb, mix(uTint * 0.25, uTint * 1.15, L), uTintAmt);
    vec3 light = uAmbient;
    for (int i = 0; i < ${MAX_LIGHTS}; i++) {
      vec3 d = uLights[i].xyz - vWorld;
      light += uTorch * uLights[i].w / (1.0 + 0.16 * dot(d, d));
    }
    vec3 night = alb * light;

    float dist = distance(cameraPosition, vWorld);
    day = mix(day, uPaper, smoothstep(uFogDay.x, uFogDay.y, dist) * 0.94);
    night = mix(night, uHazeN, smoothstep(uFogNight.x, uFogNight.y, dist));
    gl_FragColor = vec4(mix(day, night, uNight), uOpacity);
  }`;

export type LayerOpts = { tint?: Color; tintAmt?: number; sway?: number; repeat?: [number, number] };

export function layerMaterial(shared: Shared, map: Texture, o: LayerOpts = {}) {
  return new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: true,
    side: DoubleSide,
    uniforms: {
      ...shared,
      map: { value: map },
      uRepeat: { value: new Vector2(...(o.repeat ?? [1, 1])) },
      uOpacity: { value: 1 },
      uTint: { value: o.tint ?? raw(0x6e1423) },
      uTintAmt: { value: o.tintAmt ?? 0 },
      uSwayAmt: { value: o.sway ?? 0 },
    },
  });
}

// Plano com a origem no meio da base: posicionar é dizer onde a peça pisa.
const UNIT = new PlaneGeometry(1, 1).translate(0, 0.5, 0);

export function layerMesh(shared: Shared, map: Texture, w: number, h: number, o: LayerOpts = {}) {
  const mesh = new Mesh(UNIT, layerMaterial(shared, map, o));
  mesh.scale.set(w, h, 1);
  return mesh;
}

export function repeatTexture(t: Texture) {
  t.wrapS = t.wrapT = RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

export function disposeUnit() {
  UNIT.dispose();
}
