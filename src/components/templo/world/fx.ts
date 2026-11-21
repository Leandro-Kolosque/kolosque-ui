// O que é luz e movimento no diorama, desenhado por código (não depende das imagens):
//   chamas  → uma por tocha, tremendo; só à noite
//   brasas  → sobem das chamas e se apagam; só à noite
//   pétalas → caem devagar no corredor da Pinacoteca, em bordô (a única cor da gravura de dia)
//   poeira  → grãos no facho de luz do Apolo; só à noite
//   facho   → a luz que desce sobre o Apolo: um véu quente à noite, raios gravados em linhas finas de dia
// Com movimento reduzido, brasas, pétalas e poeira ficam de fora e as chamas param.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  NormalBlending,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  type Scene,
} from "three";
import { rng } from "./geometry";
import { raw, type Shared } from "./layers";

const SIZE_VERT = /* glsl */ `
  uniform float uHalfH;
  float pointSize(float meters, vec4 mv) { return meters * projectionMatrix[1][1] * uHalfH / -mv.z; }
`;

function points(n: number, fill: (i: number, pos: Float32Array, seed: Float32Array) => void) {
  const pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) fill(i, pos, seed);
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new BufferAttribute(seed, 1));
  return g;
}

export type Shaft = { x: number; y: number; z: number; w: number; h: number; tilt: number };

type Flame = { x: number; y: number; z: number };

export function buildFx(scene: Scene, shared: Shared, o: { flames: Flame[]; petals: [number, number, number, number]; shaft: Shaft; motion: boolean }) {
  const halfH = { value: 400 };
  const r = rng(77);
  const disposables: { dispose(): void }[] = [];
  const add = (obj: Mesh | Points, mat: ShaderMaterial) => {
    obj.frustumCulled = false;
    scene.add(obj);
    disposables.push(obj.geometry, mat);
    return obj;
  };

  // ---------------------------------------------------------------- chamas
  const lit = o.flames;
  const flameGeo = points(lit.length, (i, pos, seed) => {
    pos.set([lit[i].x, lit[i].y, lit[i].z], i * 3);
    seed[i] = r();
  });
  const flameMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { ...shared, uHalfH: halfH },
    vertexShader: SIZE_VERT + /* glsl */ `
      attribute float aSeed;
      varying float vSeed;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = pointSize(1.1, mv);
        gl_Position = projectionMatrix * mv;
        vSeed = aSeed;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uNight;
      varying float vSeed;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        p.y = -p.y;
        float t = uTime * 6.0 + vSeed * 17.0;
        p.x += sin(p.y * 4.0 - t) * 0.07 * (p.y + 1.0);
        float w = mix(0.3, 0.02, clamp((p.y + 0.7) / 1.5, 0.0, 1.0));
        float body = exp(-(p.x * p.x) / (w * w)) * smoothstep(-0.95, -0.6, p.y) * (1.0 - smoothstep(0.25 + 0.25 * sin(t * 1.3), 0.9, p.y));
        float core = exp(-(p.x * p.x) / (w * w * 0.25)) * smoothstep(-0.85, -0.55, p.y) * (1.0 - smoothstep(-0.3, 0.3, p.y));
        vec3 col = vec3(1.0, 0.42, 0.1) * body + vec3(1.0, 0.85, 0.55) * core + vec3(1.0, 0.5, 0.18) * exp(-dot(p, p) * 2.4) * 0.16;
        gl_FragColor = vec4(col * uNight, 1.0);
      }`,
  });
  add(new Points(flameGeo, flameMat), flameMat).renderOrder = 6;

  // ---------------------------------------------------------------- brasas
  if (o.motion) {
    const per = 9;
    const g = points(lit.length * per, (i, pos, seed) => {
      const l = lit[Math.floor(i / per)];
      pos.set([l.x + (r() - 0.5) * 0.3, l.y + 0.2, l.z + (r() - 0.5) * 0.3], i * 3);
      seed[i] = r();
    });
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...shared, uHalfH: halfH },
      vertexShader: SIZE_VERT + /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        varying float vA;
        void main() {
          float life = fract(uTime * 0.22 * (0.6 + aSeed) + aSeed * 7.0);
          vec3 p = position;
          p.y += life * 3.4;
          p.x += sin(life * 6.0 + aSeed * 20.0) * 0.4 * life;
          p.z += cos(life * 5.0 + aSeed * 11.0) * 0.3 * life;
          vA = (1.0 - life) * smoothstep(0.0, 0.08, life);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = max(1.5, pointSize(0.05, mv));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        varying float vA;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA;
          gl_FragColor = vec4(vec3(1.0, 0.55, 0.2) * a * uNight, 1.0);
        }`,
    });
    add(new Points(g, m), m).renderOrder = 7;
  }

  // ---------------------------------------------------------------- pétalas
  if (o.motion) {
    const [x0, x1, z0, z1] = o.petals;
    const g = points(150, (i, pos, seed) => {
      pos.set([x0 + r() * (x1 - x0), 0, z0 + r() * (z1 - z0)], i * 3);
      seed[i] = r();
    });
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: { ...shared, uHalfH: halfH, uDay: { value: raw(0x6e1423) }, uNightC: { value: raw(0x4a1015) } },
      vertexShader: SIZE_VERT + /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        varying float vA;
        varying float vRot;
        varying float vDist;
        void main() {
          float life = fract(-uTime * 0.035 * (0.6 + aSeed * 0.8) + aSeed * 13.0);
          vec3 p = position;
          p.y = 1.25 + life * 11.0;
          p.x += sin(uTime * 0.7 + aSeed * 30.0) * 0.6;
          p.z += cos(uTime * 0.5 + aSeed * 20.0) * 0.4;
          vA = smoothstep(0.0, 0.03, life) * smoothstep(1.0, 0.85, life);
          vRot = uTime * (aSeed - 0.5) * 2.4 + aSeed * 6.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vDist = -mv.z;
          gl_PointSize = max(1.0, pointSize(0.16, mv));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        uniform vec3 uDay;
        uniform vec3 uNightC;
        uniform vec3 uPaper;
        uniform vec3 uHazeN;
        uniform vec2 uFogDay;
        uniform vec2 uFogNight;
        varying float vA;
        varying float vRot;
        varying float vDist;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float c = cos(vRot), s = sin(vRot);
          p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
          float a = smoothstep(1.0, 0.8, length(p / vec2(0.48, 0.24))) * vA;
          if (a < 0.02) discard;
          vec3 day = mix(uDay, uPaper, smoothstep(uFogDay.x, uFogDay.y, vDist) * 0.94);
          vec3 night = mix(uNightC, uHazeN, smoothstep(uFogNight.x, uFogNight.y, vDist));
          gl_FragColor = vec4(mix(day, night, uNight), a * 0.9);
        }`,
    });
    add(new Points(g, m), m).renderOrder = 8;
  }

  // ---------------------------------------------------------------- facho de luz e poeira
  const s = o.shaft;
  const shaftMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { ...shared },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uNight;
      uniform float uTime;
      uniform vec3 uSepia;
      varying vec2 vUv;
      void main() {
        float edge = smoothstep(0.0, 0.32, vUv.x) * smoothstep(1.0, 0.68, vUv.x);
        float fall = smoothstep(0.0, 0.35, vUv.y) * mix(0.55, 1.0, vUv.y);
        float streak = 0.75 + 0.25 * sin(vUv.x * 23.0 + uTime * 0.35) * sin(vUv.x * 9.0 - uTime * 0.2);
        float mask = edge * fall * streak;
        float lines = 1.0 - smoothstep(0.15, 0.4, abs(fract(vUv.x * 34.0) - 0.5) * 2.0);
        vec3 col = mix(uSepia, vec3(1.0, 0.86, 0.62), uNight);
        float a = mix(lines * 0.26 * edge * fall, mask * 0.3, uNight);
        gl_FragColor = vec4(col, a);
      }`,
  });
  const shaft = new Mesh(new PlaneGeometry(1, 1), shaftMat);
  shaft.scale.set(s.w, s.h, 1);
  shaft.position.set(s.x, s.y, s.z);
  shaft.rotation.z = s.tilt;
  add(shaft, shaftMat).renderOrder = 9;

  if (o.motion) {
    const g = points(110, (i, pos, seed) => {
      const t = r();
      pos.set([s.x + (r() - 0.5) * s.w * 0.7 - Math.sin(s.tilt) * (t - 0.5) * s.h, s.y + (t - 0.5) * s.h * 0.85, s.z + (r() - 0.5) * 3], i * 3);
      seed[i] = r();
    });
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...shared, uHalfH: halfH },
      vertexShader: SIZE_VERT + /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        varying float vA;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.15 + aSeed * 40.0) * 0.5;
          p.y += sin(uTime * 0.1 + aSeed * 25.0) * 0.8;
          vA = 0.5 + 0.5 * sin(uTime * (0.4 + aSeed) + aSeed * 30.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = max(1.2, pointSize(0.045, mv));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        varying float vA;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA;
          gl_FragColor = vec4(vec3(1.0, 0.9, 0.7) * a * 0.8 * uNight, 1.0);
        }`,
    });
    add(new Points(g, m), m).renderOrder = 10;
  }

  return {
    setViewport(drawingHeight: number) {
      halfH.value = drawingHeight / 2;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
