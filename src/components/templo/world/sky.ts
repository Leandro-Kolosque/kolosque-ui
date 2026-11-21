// Céu e lua. O céu é um quadro em tela cheia atrás de tudo, desenhado pela direção de cada pixel:
//   noite → degradê da névoa iluminada (horizonte) ao quase-preto (zênite), com estrelas que piscam devagar;
//   dia   → o marfim do papel, com as linhas horizontais finas dos céus de gravura só na parte de cima.
// A lua é uma crescente pálida (nada de disco vermelho): um plano que acompanha a câmera, então fica parada no
// céu como se estivesse infinitamente longe. À noite ganha um halo; de dia vira só um traço de sépia.
import { Mesh, Matrix4, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import type { Shared } from "./layers";

export function buildSky(shared: Shared) {
  const mat = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      ...shared,
      uInvProj: { value: new Matrix4() },
      uCamWorld: { value: new Matrix4() },
      uDpr: { value: 1 },
    },
    vertexShader: "varying vec2 vNdc; void main(){ vNdc = position.xy; gl_Position = vec4(position.xy, 1.0, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform mat4 uInvProj;
      uniform mat4 uCamWorld;
      uniform float uNight;
      uniform float uTime;
      uniform float uDpr;
      uniform vec3 uPaper;
      uniform vec3 uPaperLow;
      uniform vec3 uSepia;
      uniform vec3 uHazeN;
      uniform vec3 uZenithN;
      varying vec2 vNdc;

      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

      void main() {
        vec4 v = uInvProj * vec4(vNdc, 1.0, 1.0);
        vec3 dir = normalize((uCamWorld * vec4(v.xyz / v.w, 0.0)).xyz);
        float h = dir.y;

        vec3 night = mix(uHazeN, uZenithN, smoothstep(-0.02, 0.55, h));
        // estrelas: uma em cada célula de ~1 grau tem chance de existir
        vec2 g = vec2(atan(dir.x, -dir.z), asin(clamp(h, -1.0, 1.0))) * 57.2958;
        vec2 cell = floor(g), f = fract(g) - 0.5;
        float r = hash(cell);
        if (r > 0.982) {
          vec2 off = vec2(hash(cell + 1.7), hash(cell + 3.1)) - 0.5;
          float size = mix(0.035, 0.11, hash(cell + 5.3));
          float tw = 0.65 + 0.35 * sin(uTime * (0.6 + 1.8 * hash(cell + 9.1)) + r * 40.0);
          night += vec3(0.93, 0.88, 0.8) * smoothstep(size, 0.0, length(f - off * 0.6)) * tw * smoothstep(0.03, 0.3, h);
        }

        vec3 day = mix(uPaperLow, uPaper, smoothstep(-0.02, 0.4, h));
        float y = gl_FragCoord.y / uDpr;
        float line = 1.0 - smoothstep(0.0, 0.9, abs(fract(y / 5.0) - 0.5) * 5.0);
        day = mix(day, uSepia, line * 0.09 * smoothstep(0.12, 0.6, h));

        gl_FragColor = vec4(mix(day, night, uNight), 1.0);
      }`,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  quad.renderOrder = -10;

  // ---------------------------------------------------------------- lua
  const moonMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { ...shared },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uNight;
      uniform vec3 uSepia;
      varying vec2 vUv;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float R = 0.3;
        float aa = 0.012;
        float disc = smoothstep(R + aa, R - aa, length(p));
        // o disco de sombra desliza para cima e para a direita: a luz vem de baixo à esquerda
        float shade = smoothstep(R * 0.94 + aa, R * 0.94 - aa, length(p - vec2(0.13, 0.09)));
        float cres = disc * (1.0 - shade);
        float mott = 0.9 + 0.1 * hash(floor(vUv * 90.0));
        vec3 moon = vec3(0.93, 0.89, 0.81) * mott;
        float halo = exp(-max(length(p) - R, 0.0) * 7.0) * 0.22 * (1.0 - disc * 0.6);
        vec3 nightCol = moon * cres + vec3(0.85, 0.8, 0.72) * halo;
        float nightA = clamp(cres + halo, 0.0, 1.0);
        // de dia: a crescente gravada em sépia, contorno e linhas horizontais finas por dentro
        vec2 off = p - vec2(0.13, 0.09);
        float rim = max(smoothstep(R - 0.03, R - 0.006, length(p)), 1.0 - smoothstep(R * 0.94, R * 0.94 + 0.03, length(off)));
        float lines = 1.0 - smoothstep(0.2, 0.45, abs(fract(vUv.y * 46.0) - 0.5) * 2.0);
        float dayA = cres * clamp(rim * 0.7 + lines * 0.3, 0.0, 1.0);
        vec3 col = mix(uSepia, nightCol / max(nightA, 1e-3), uNight);
        gl_FragColor = vec4(col, mix(dayA, nightA, uNight));
      }`,
  });
  const moon = new Mesh(new PlaneGeometry(1, 1), moonMat);
  moon.renderOrder = -9;
  moon.frustumCulled = false;
  // direção da lua vista da tomada 00: no alto, à direita do portal, longe do título
  const dirWide = new Vector3(0.3, 0.36, -1).normalize();
  const dir = new Vector3();

  function update(cam: PerspectiveCamera, tall: number, dpr: number) {
    mat.uniforms.uInvProj.value.copy(cam.projectionMatrixInverse);
    mat.uniforms.uCamWorld.value.copy(cam.matrixWorld);
    mat.uniforms.uDpr.value = dpr;
    // no quadro alto do celular, a lua chega mais perto do centro para não sair da tela
    dir.set(dirWide.x * (1 - tall * 0.62), dirWide.y * (1 + tall * 0.35), dirWide.z).normalize();
    moon.position.copy(cam.position).addScaledVector(dir, 400);
    moon.lookAt(cam.position);
    moon.scale.setScalar(64);
  }

  return {
    quad,
    moon,
    update,
    dispose() {
      quad.geometry.dispose();
      mat.dispose();
      moon.geometry.dispose();
      moonMat.dispose();
    },
  };
}
