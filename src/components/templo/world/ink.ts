// Passe final em tela cheia. Converte a cena renderizada (HDR, linear) em imagem:
//   - "pura" (a escolhida, padrão): tone mapping ACES e sRGB, como uma cena 3D comum;
//   - "gravura" (de reserva, para um novo teste com ?mundo=gravura): o tom de cada ponto vira hachura de nanquim. Três famílias de linhas engrossam e se cruzam
//     conforme o tom; superfícies horizontais recebem linhas horizontais e as verticais, linhas inclinadas
//     (lidas do passe de normais); contornos saem das quinas de profundidade e normal; o céu ganha as linhas
//     horizontais finas das gravuras antigas.
//     De dia, a tinta escura marca as sombras sobre o marfim. À noite vira gravura em negativo (scratchboard):
//     o traço claro marca a luz sobre o fundo escuro, e as linhas perto das tochas puxam para o dourado.
//     Pontos muito saturados (lua, chamas, a porta acesa) passam com a cor original.
// uSplit separa as duas na tela: à esquerda de uSplit, gravura; à direita, pura.
import { ShaderMaterial, Vector2, Vector3, type Texture } from "three";

export const srgb = (hex: number) => new Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

export function inkMaterial() {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tColor: { value: null as Texture | null },
      tDepth: { value: null as Texture | null },
      tNormal: { value: null as Texture | null },
      uRes: { value: new Vector2(1, 1) },
      uDpr: { value: 1 },
      uNear: { value: 0.5 },
      uFar: { value: 600 },
      uSplit: { value: 0 }, // 0 = tudo puro (padrão); 1 = tudo gravura
      uNight: { value: 1 },
      uExposure: { value: 1 },
      uFade: { value: 0 },
      uPaper: { value: srgb(0x17100f) },
      uInk: { value: srgb(0xede4d3) },
      uGold: { value: srgb(0xc9a55c) },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform sampler2D tNormal;
      uniform vec2 uRes;
      uniform float uDpr;
      uniform float uNear;
      uniform float uFar;
      uniform float uSplit;
      uniform float uNight;
      uniform float uExposure;
      uniform float uFade;
      uniform vec3 uPaper;
      uniform vec3 uInk;
      uniform vec3 uGold;
      varying vec2 vUv;

      vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      vec3 toSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      float linDepth(float d) { float z = d * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); }

      // Linhas paralelas na direção ang, espaçadas de sp px, cobrindo a fração w do espaço entre elas.
      float hatch(vec2 px, float ang, float sp, float w) {
        if (w <= 0.001) return 0.0;
        float v = dot(px, vec2(-sin(ang), cos(ang))) / sp;
        float f = fract(v);
        float d = min(f, 1.0 - f) * 2.0;
        float aa = fwidth(v) * 1.5;
        return 1.0 - smoothstep(w - aa, w + aa, d);
      }

      void main() {
        vec3 hdr = texture2D(tColor, vUv).rgb;
        vec3 pure = toSrgb(aces(hdr * uExposure));
        vec3 outc;

        if (vUv.x > uSplit) {
          outc = pure;
        } else {
          float raw = texture2D(tDepth, vUv).r;
          float ld = linDepth(raw);
          bool sky = ld > 420.0;
          vec4 nTex = texture2D(tNormal, vUv);
          vec3 nrm = nTex.xyz * 2.0 - 1.0;
          float isLight = (1.0 - nTex.a) * (sky ? 0.0 : 1.0); // fora do passe de normais: lua, chamas, porta

          float L = dot(pure, vec3(0.299, 0.587, 0.114));
          float mx = max(pure.r, max(pure.g, pure.b));
          float sat = (mx - min(pure.r, min(pure.g, pure.b))) / (mx + 1e-4);

          // Tom: de dia, quanto mais escuro mais tinta; à noite, quanto mais luz mais traço claro.
          float tone = mix(1.0 - L, clamp(L * 1.7, 0.0, 1.0), uNight);
          tone = smoothstep(0.06, 0.96, tone);

          vec2 px = gl_FragCoord.xy / uDpr;
          vec2 wob = vec2(vnoise(px * 0.045), vnoise(px * 0.045 + 17.0)) - 0.5;
          px += wob * 2.4;
          px.y += ld * 0.75; // cada plano de profundidade desloca as linhas: formas vizinhas não emendam a mesma trama

          float ink;
          if (sky) {
            // de dia, poucas linhas e só mais para o alto, para o texto da Hero não brigar com o céu
            float st = mix(smoothstep(0.55, 1.0, vUv.y) * 0.22, (1.0 - vUv.y) * 0.16, uNight);
            ink = hatch(px, 0.0, 5.0, st);
            ink = max(ink, smoothstep(0.35, 0.8, L) * uNight); // estrelas
          } else {
            float flatness = smoothstep(0.55, 0.85, nrm.y);
            float a1 = mix(1.18 + nrm.x * 0.55, 0.0, flatness);
            float sp = 4.2;
            float c1 = hatch(px, a1, sp, smoothstep(0.03, 0.85, tone) * 0.92);
            float c2 = hatch(px, a1 + 1.1, sp * 1.12, smoothstep(0.42, 1.0, tone) * 0.78);
            float c3 = hatch(px, a1 - 0.78, sp * 0.92, smoothstep(0.74, 1.0, tone) * 0.62);
            // Nos tons claros, a linha se quebra em traços, como o buril que levanta da chapa.
            float dash = smoothstep(0.3, 0.62, vnoise(px * 0.11) + tone * 0.7);
            ink = max(c1 * dash, max(c2, c3));

            // Contornos: salto de profundidade ou de normal entre vizinhos.
            vec2 o = vec2(uDpr) / uRes;
            float dl = linDepth(texture2D(tDepth, vUv - vec2(o.x, 0.0)).r);
            float dr = linDepth(texture2D(tDepth, vUv + vec2(o.x, 0.0)).r);
            float du = linDepth(texture2D(tDepth, vUv + vec2(0.0, o.y)).r);
            float dd = linDepth(texture2D(tDepth, vUv - vec2(0.0, o.y)).r);
            float dEdge = abs(dl + dr + du + dd - 4.0 * ld) / ld;
            vec3 nl = texture2D(tNormal, vUv - vec2(o.x, 0.0)).xyz * 2.0 - 1.0;
            vec3 nu = texture2D(tNormal, vUv + vec2(0.0, o.y)).xyz * 2.0 - 1.0;
            float nEdge = 1.0 - min(dot(nrm, nl), dot(nrm, nu));
            float edge = max(smoothstep(0.035, 0.11, dEdge), smoothstep(0.18, 0.45, nEdge));
            // a névoa apaga os contornos ao longe, como a perspectiva aérea das gravuras
            edge *= mix(1.0, 0.4, uNight) * (1.0 - smoothstep(60.0, 220.0, ld));
            ink = max(ink, edge);
          }

          vec3 paper = uPaper * (1.0 - (vnoise(gl_FragCoord.xy * 0.6) - 0.5) * 0.06);
          float warm = smoothstep(0.22, 0.6, sat) * step(pure.b, pure.r);
          vec3 inkCol = mix(uInk, uGold, warm * 0.8 * uNight);
          outc = mix(paper, inkCol, ink);
          // Lua, chamas e a porta acesa ficam com a cor: pela máscara do passe de normais ou, para chamas na frente
          // da arquitetura, por serem muito saturadas e claras. A pedra iluminada pela tocha continua gravada.
          float accent = max(isLight, smoothstep(0.8, 0.95, sat) * smoothstep(0.55, 0.8, mx));
          outc = mix(outc, pure, accent);
        }

        // Entrada: o mundo aparece a partir da cor do fundo.
        gl_FragColor = vec4(mix(uPaper, outc, uFade), 1.0);
      }`,
  });
}
