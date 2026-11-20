// O santuário: escadaria, Propileus, segundo terraço e o templo (o Mouseion), com braseiros, ciprestes,
// oliveiras, lua, estrelas e brasas. Tudo gerado por código. Medidas em metros; a câmera da tomada 00 fica
// ao pé da escada, em z ≈ 24, olhando para o fundo (-z).
//
// Camadas: 0 = arquitetura e vegetação (entram no passe de normais da gravura); 1 = luz e céu
// (lua, halo, chamas, brasas, estrelas, abóbada), que a gravura preserva como cor.
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import * as G from "./geometry";

export type Sanctuary = {
  scene: Scene;
  setNight(night: boolean): void;
  update(dt: number, t: number, motion: boolean): void;
  dispose(): void;
};

const LAYER_LIGHT = 1;

// Textura radial desenhada em canvas (brilho do halo, da chama e das brasas).
function radial(stops: [number, string][], w = 128, h = 128) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  return new CanvasTexture(c);
}

// Chama: gota alongada, quente no pé.
function flameTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 92, 2, 32, 80, 60);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,220,150,.9)");
  g.addColorStop(0.6, "rgba(255,140,40,.35)");
  g.addColorStop(1, "rgba(255,90,20,0)");
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(32, 4);
  x.bezierCurveTo(52, 50, 60, 84, 32, 124);
  x.bezierCurveTo(4, 84, 12, 50, 32, 4);
  x.fill();
  return new CanvasTexture(c);
}

// Braseiros: [x, y do chão, z]. Os quatro primeiros acendem luzes de verdade; os outros só brilham.
const BRAZIERS: [number, number, number][] = [
  [-5.7, 0, 1.4], [5.7, 0, 1.4],
  [-6.6, 6, -12.8], [6.6, 6, -12.8],
  [-11, 6, -14.6], [11, 6, -14.6],
  [-8.8, 14, -43.4], [8.8, 14, -43.4],
];
const TRIPOD_H = 1.7;

// Lua: na tomada 00 aparece no alto à direita, atrás do canto do frontão do templo.
const MOON = { pos: new Vector3(48.8, 80.8, -187.3), r: 22 };

type Theme = {
  hemi: [number, number, number];
  key: [number, number];
  keyPos: Vector3;
  fill: number;
  torch: number;
  door: number;
  fog: [number, number];
  sky: [number, number];
  moon: [number, number];
  halo: number;
  flame: number;
  stars: boolean;
};

const NIGHT: Theme = {
  hemi: [0x3a3a52, 0x140d0c, 0.55],
  key: [0x9aa0c4, 0.5],
  keyPos: MOON.pos.clone().normalize().multiplyScalar(120).add(new Vector3(0, 0, -30)),
  fill: 0.12,
  torch: 22,
  door: 45,
  fog: [0x1b1312, 0.011],
  sky: [0x0d0808, 0x2b1b19],
  moon: [0x9b2234, 2.2],
  halo: 0.55,
  flame: 1,
  stars: true,
};

const DAY: Theme = {
  hemi: [0xfff6e6, 0xbda98b, 1.25],
  key: [0xfff0d6, 3.1],
  keyPos: new Vector3(-70, 95, 70),
  fill: 0.35,
  torch: 0,
  door: 8,
  fog: [0xf1e6d4, 0.008],
  sky: [0xe6d7bf, 0xf8efe3],
  moon: [0x6e1423, 1],
  halo: 0,
  flame: 0.45,
  stars: false,
};

export function buildSanctuary(): Sanctuary {
  const scene = new Scene();
  const rand = G.rng(7);
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  const mat = {
    marble: keep(new MeshStandardMaterial({ color: 0xd9cfbe, roughness: 0.82 })),
    stone: keep(new MeshStandardMaterial({ color: 0x8e8275, roughness: 0.95 })),
    ground: keep(new MeshStandardMaterial({ color: 0x4d433a, roughness: 1 })),
    cypress: keep(new MeshStandardMaterial({ color: 0x27302a, roughness: 1, flatShading: true })),
    olive: keep(new MeshStandardMaterial({ color: 0x59634f, roughness: 1, flatShading: true })),
    bark: keep(new MeshStandardMaterial({ color: 0x3d3129, roughness: 1 })),
    bronze: keep(new MeshStandardMaterial({ color: 0x7a5530, metalness: 0.7, roughness: 0.45 })),
    hills: keep(new MeshStandardMaterial({ color: 0x3a312c, roughness: 1 })),
    door: keep(new MeshBasicMaterial({ color: new Color(2.6, 1.55, 0.6) })),
  };

  const add = (geo: BufferGeometry, m: MeshStandardMaterial | MeshBasicMaterial, shadow = true) => {
    keep(geo);
    const mesh = new Mesh(geo, m);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };

  // ---------------------------------------------------------------- chão, terraços e escadas
  const ground = new PlaneGeometry(900, 900);
  ground.rotateX(-Math.PI / 2);
  add(ground, mat.ground, false);

  add(G.box(130, 6, 24, 0, 3, -24), mat.stone);                 // terraço 1: de z -12 a -36, topo em y 6
  add(G.ashlar(-65, 65, 0, 6, -12, rand), mat.stone);           // muro de arrimo do terraço 1
  add(G.flight(30, 0.2, 0.4, 9, 0, 0, 1), mat.marble);          // escada de baixo: z 0 → -12, y 0 → 6
  add(G.box(130, 14, 70, 0, 7, -77), mat.stone);                // terraço 2: de z -42 a -112, topo em y 14
  add(G.ashlar(-65, 65, 6, 14, -42, rand), mat.stone);
  add(G.flight(40, 0.2, 0.4, 14, 6, -26, 0.9), mat.marble);     // escada de cima: z -26 → -42, y 6 → 14

  // ---------------------------------------------------------------- Propileus (portal de seis colunas)
  {
    const y0 = 6.6, front = -14.8;
    const xs = [-7.6, -4.6, -1.6, 1.6, 4.6, 7.6];
    add(G.crepidoma(19, 10, 6, 0.2, 0.35, -14.1), mat.marble);
    const col = G.doricColumn(4.6, 0.52);
    keep(col.geometry);
    const cols: BufferGeometry[] = [];
    for (const z of [front, front - 7.6]) for (const x of xs) cols.push(col.geometry.clone().translate(x, y0, z));
    add(G.merge(cols), mat.marble);
    for (const s of [-1, 1]) add(G.box(0.6, col.top, 7.2, s * 8.95, y0 + col.top / 2, front - 3.9), mat.marble);
    const ent = G.entablature(18.6, 9, y0 + col.top, xs, 0.62, 0.62, 0.28);
    ent.geometry.translate(0, 0, front + 0.6);
    add(ent.geometry, mat.marble);
    add(G.pediment(19.1, 9.5, ent.top, 1.35).translate(0, 0, front + 0.85), mat.marble);
  }

  // ---------------------------------------------------------------- o templo (octástilo, períptero)
  {
    const y0 = 15.35, front = -49;
    const sp = 3.3;
    const xs = Array.from({ length: 8 }, (_, i) => (i - 3.5) * sp);
    add(G.crepidoma(25.4, 32, 14, 0.45, 0.6, -48), mat.marble);
    const col = G.doricColumn(10, 0.98);
    keep(col.geometry);
    const cols: BufferGeometry[] = [];
    for (const x of xs) cols.push(col.geometry.clone().translate(x, y0, front));
    for (let k = 1; k <= 8; k++) for (const s of [-1, 1]) cols.push(col.geometry.clone().translate(s * xs[7], y0, front - k * sp));
    for (const x of xs.slice(1, 7)) cols.push(col.geometry.clone().translate(x, y0, front - 4.2)); // pronau
    add(G.merge(cols), mat.marble);
    // parede da cela com a porta aberta (a luz de dentro escapa por ela)
    const doorW = 3.4, doorH = 7.4, wallZ = -56.5, wallH = col.top, wallW = 16;
    const wall = [
      G.box((wallW - doorW) / 2, wallH, 0.9, -(wallW + doorW) / 4, y0 + wallH / 2, wallZ),
      G.box((wallW - doorW) / 2, wallH, 0.9, (wallW + doorW) / 4, y0 + wallH / 2, wallZ),
      G.box(doorW, wallH - doorH, 0.9, 0, y0 + doorH + (wallH - doorH) / 2, wallZ),
      G.box(wallW, wallH, 22, 0, y0 + wallH / 2, wallZ - 11.5),
    ];
    add(G.merge(wall), mat.marble);
    const door = new PlaneGeometry(doorW, doorH);
    door.translate(0, y0 + doorH / 2, wallZ - 0.2);
    const doorMesh = add(door, mat.door, false);
    doorMesh.layers.set(LAYER_LIGHT);
    const W = xs[7] * 2 + 2.6;
    const ent = G.entablature(W, 30, y0 + col.top, xs, 1.25, 1.25, 0.5);
    ent.geometry.translate(0, 0, front + 1.1);
    add(ent.geometry, mat.marble);
    add(G.pediment(W + 0.5, 30.5, ent.top, 3.3).translate(0, 0, front + 1.35), mat.marble);
  }

  // ---------------------------------------------------------------- vegetação e pedras
  const cyp: BufferGeometry[] = [];
  const spots: [number, number, number, number][] = [
    [13, 6, -18, 7], [16.6, 6, -22, 9], [20.5, 6, -27, 8], [24, 6, -20, 6.5],
    [17.5, 14, -54, 11], [21.5, 14, -63, 12.5], [25.5, 14, -72, 11], [30, 14, -58, 9],
  ];
  for (const [x, y, z, h] of spots) for (const s of [-1, 1]) cyp.push(G.cypress(h, 0.9 + rand() * 0.4, rand).translate(s * x + (rand() - 0.5), y, z + (rand() - 0.5) * 2));
  add(G.merge(cyp), mat.cypress);

  const trunks: BufferGeometry[] = [], crowns: BufferGeometry[] = [];
  for (const [x, z, s] of [[-8.6, 7, 1], [9.2, 6, 1.1], [-15, -3, 0.9], [16, -5, 1]] as const) {
    const o = G.olive(rand);
    o.trunk.scale(s, s, s).translate(x, 0, z);
    o.crown.scale(s, s, s).translate(x, 0, z);
    trunks.push(o.trunk);
    crowns.push(o.crown);
  }
  add(G.merge(trunks), mat.bark);
  add(G.merge(crowns), mat.olive);

  const rocks: BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const s = rand() < 0.5 ? -1 : 1;
    rocks.push(G.rock(0.4 + rand() * 0.9, rand).translate(s * (7 + rand() * 9), 0.2, -9 + rand() * 16));
  }
  add(G.merge(rocks), mat.stone);

  // montanhas ao longe: só silhuetas na névoa
  const hills: BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const g = new SphereGeometry(1, 20, 10);
    g.scale(60 + rand() * 50, 26 + rand() * 30, 40);
    g.translate(-220 + i * 55 + (rand() - 0.5) * 30, -6, -250 - rand() * 60);
    hills.push(g);
  }
  add(G.merge(hills), mat.hills, false);

  // ---------------------------------------------------------------- braseiros: trípode, chama, luz e brasas
  const tripodGeo = keep(G.tripod(TRIPOD_H));
  const tripods: BufferGeometry[] = [];
  const flameTex = keep(flameTexture());
  const glowTex = keep(radial([[0, "rgba(255,200,120,.9)"], [0.35, "rgba(255,140,50,.35)"], [1, "rgba(255,120,40,0)"]]));
  const flames: { core: Sprite; glow: Sprite; seed: number; base: Vector3 }[] = [];
  const torches: PointLight[] = [];
  for (const [i, [x, y, z]] of BRAZIERS.entries()) {
    tripods.push(tripodGeo.clone().translate(x, y, z));
    const base = new Vector3(x, y + TRIPOD_H + 0.22, z);
    const core = new Sprite(keep(new SpriteMaterial({ map: flameTex, color: new Color(2.6, 1.4, 0.5), blending: AdditiveBlending, depthWrite: false, transparent: true })));
    core.center.set(0.5, 0.05);
    core.position.copy(base);
    const glow = new Sprite(keep(new SpriteMaterial({ map: glowTex, color: new Color(1.0, 0.5, 0.18), blending: AdditiveBlending, depthWrite: false, transparent: true })));
    glow.position.copy(base).add(new Vector3(0, 0.35, 0));
    glow.scale.setScalar(1.7);
    core.layers.set(LAYER_LIGHT);
    glow.layers.set(LAYER_LIGHT);
    scene.add(core, glow);
    flames.push({ core, glow, seed: i * 1.7, base });
    if (i < 4) {
      const l = new PointLight(0xffa04a, 0, 16, 2);
      l.position.copy(base).add(new Vector3(0, 0.4, 0.3));
      scene.add(l);
      torches.push(l);
    }
  }
  add(G.merge(tripods), mat.bronze);

  // luz quente de dentro da cela, que contorna as colunas do pronau
  const doorLight = new PointLight(0xffb060, 0, 26, 2);
  doorLight.position.set(0, 19, -54);
  scene.add(doorLight);

  // brasas que sobem dos braseiros (só à noite)
  const EMBERS = 240;
  const ePos = new Float32Array(EMBERS * 3);
  const eData = Array.from({ length: EMBERS }, () => ({ b: Math.floor(rand() * BRAZIERS.length), life: rand() * 3, speed: 0.6 + rand() * 0.9, phase: rand() * 6.28, max: 2 + rand() * 2.5 }));
  const emberGeo = keep(new BufferGeometry());
  emberGeo.setAttribute("position", new BufferAttribute(ePos, 3));
  const embers = new Points(emberGeo, keep(new PointsMaterial({
    size: 0.09, map: glowTex, color: new Color(3, 1.5, 0.45), blending: AdditiveBlending, depthWrite: false, transparent: true,
  })));
  embers.layers.set(LAYER_LIGHT);
  embers.frustumCulled = false;
  scene.add(embers);

  // ---------------------------------------------------------------- céu, lua e estrelas
  const skyUniforms = { uTop: { value: new Color() }, uHorizon: { value: new Color() } };
  const sky = new Mesh(keep(new SphereGeometry(460, 32, 16)), keep(new ShaderMaterial({
    uniforms: skyUniforms,
    side: BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 uTop; uniform vec3 uHorizon; varying vec3 vP; void main(){ float h = smoothstep(-0.05, 0.55, vP.y); gl_FragColor = vec4(mix(uHorizon, uTop, h), 1.0); }",
  })));
  sky.layers.set(LAYER_LIGHT);
  sky.renderOrder = -1;
  scene.add(sky);

  const moonUniforms = { uColor: { value: new Color() }, uGain: { value: 1 } };
  const moon = new Mesh(keep(new PlaneGeometry(MOON.r * 2, MOON.r * 2)), keep(new ShaderMaterial({
    uniforms: moonUniforms,
    transparent: true,
    // escreve profundidade para a gravura saber que ali é a lua (e não céu) e preservar a cor dela
    depthWrite: true,
    fog: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    // Disco com manchas suaves (ruído) e uma borda levemente escurecida, como a mancha de aquarela das gravuras.
    fragmentShader: `
      uniform vec3 uColor; uniform float uGain; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p);
        if (r > 1.0) discard;
        float m = n(p * 3.0) * 0.6 + n(p * 7.0) * 0.4;
        vec3 c = uColor * (0.78 + 0.34 * m) * (1.0 - 0.28 * pow(r, 4.0));
        gl_FragColor = vec4(c * uGain, smoothstep(1.0, 0.975, r));
      }`,
  })));
  moon.position.copy(MOON.pos);
  moon.lookAt(0, 4, 24);
  moon.layers.set(LAYER_LIGHT);
  scene.add(moon);

  const haloMat = keep(new SpriteMaterial({ map: keep(radial([[0, "rgba(255,255,255,.55)"], [0.3, "rgba(255,255,255,.18)"], [1, "rgba(255,255,255,0)"]])), blending: AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const halo = new Sprite(haloMat);
  halo.position.copy(MOON.pos).add(new Vector3(0, 0, 2));
  halo.scale.setScalar(MOON.r * 5.5);
  halo.layers.set(LAYER_LIGHT);
  scene.add(halo);

  const STARS = 1100;
  const sPos = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    const a = rand() * Math.PI * 2, y = 0.08 + rand() * 0.92, r = Math.sqrt(1 - y * y);
    sPos.set([Math.cos(a) * r * 420, y * 420, Math.sin(a) * r * 420 - 60], i * 3);
  }
  const starGeo = keep(new BufferGeometry());
  starGeo.setAttribute("position", new BufferAttribute(sPos, 3));
  const stars = new Points(starGeo, keep(new PointsMaterial({ size: 1.6, sizeAttenuation: false, color: new Color(1.4, 1.3, 1.2), fog: false, transparent: true, depthWrite: false })));
  stars.layers.set(LAYER_LIGHT);
  scene.add(stars);

  // ---------------------------------------------------------------- luzes
  const hemi = new HemisphereLight();
  scene.add(hemi);
  const key = new DirectionalLight();
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -45, right: 45, top: 55, bottom: -55, near: 1, far: 320 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  const keyTarget = new Object3D();
  keyTarget.position.set(0, 6, -30);
  key.target = keyTarget;
  scene.add(key, keyTarget);
  const fill = new DirectionalLight(0xc8c0d8, 0.2);
  fill.position.set(-40, 20, 60);
  scene.add(fill);

  scene.fog = new FogExp2(0x000000, 0.006);
  let theme = NIGHT;

  function setNight(night: boolean) {
    theme = night ? NIGHT : DAY;
    hemi.color.setHex(theme.hemi[0]);
    hemi.groundColor.setHex(theme.hemi[1]);
    hemi.intensity = theme.hemi[2];
    key.color.setHex(theme.key[0]);
    key.intensity = theme.key[1];
    key.position.copy(keyTarget.position).add(theme.keyPos);
    key.shadow.needsUpdate = true;
    fill.intensity = theme.fill;
    (scene.fog as FogExp2).color.setHex(theme.fog[0]);
    (scene.fog as FogExp2).density = theme.fog[1];
    skyUniforms.uTop.value.setHex(theme.sky[0]);
    skyUniforms.uHorizon.value.setHex(theme.sky[1]);
    moonUniforms.uColor.value.setHex(theme.moon[0]);
    moonUniforms.uGain.value = theme.moon[1];
    haloMat.color.setHex(theme.moon[0]).multiplyScalar(theme.halo * 3);
    halo.visible = theme.halo > 0;
    stars.visible = embers.visible = theme.stars;
    mat.door.color.setRGB(2.6, 1.55, 0.6).multiplyScalar(theme === NIGHT ? 1 : 0.35);
    doorLight.intensity = theme.door;
  }

  function update(dt: number, t: number, motion: boolean) {
    // chamas: o tamanho e o brilho tremem sem ritmo regular (duas senoides que não se encaixam)
    for (const f of flames) {
      const k = motion ? 0.82 + 0.12 * Math.sin(t * 7.3 + f.seed) + 0.08 * Math.sin(t * 12.9 + f.seed * 2.1) : 0.9;
      f.core.scale.set(0.55 * theme.flame * (0.9 + 0.1 * k), 1.05 * theme.flame * k, 1);
      f.glow.material.opacity = theme.flame * (0.7 + 0.3 * k);
    }
    torches.forEach((l, i) => {
      l.intensity = theme.torch * (motion ? 0.85 + 0.1 * Math.sin(t * 6.1 + i * 2.3) + 0.06 * Math.sin(t * 13.7 + i) : 0.9);
    });
    if (!embers.visible || !motion) return;
    for (let i = 0; i < EMBERS; i++) {
      const e = eData[i];
      e.life += dt;
      if (e.life > e.max) {
        e.life = 0;
        e.b = Math.floor(Math.random() * BRAZIERS.length);
      }
      const [x, y, z] = BRAZIERS[e.b];
      const h = e.life * e.speed;
      ePos[i * 3] = x + Math.sin(e.phase + e.life * 1.8) * 0.25 * (1 + h * 0.3);
      ePos[i * 3 + 1] = y + TRIPOD_H + 0.3 + h;
      ePos[i * 3 + 2] = z + Math.cos(e.phase + e.life * 1.3) * 0.2;
    }
    emberGeo.attributes.position.needsUpdate = true;
  }

  setNight(true);
  return {
    scene,
    setNight,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
