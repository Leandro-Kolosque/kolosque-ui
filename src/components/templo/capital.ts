// Capitel jônico gerado por código e exportado como GLB num endereço local (blob:), para o Ink Object
// imprimir em traços de nanquim. Nada é baixado: o modelo nasce aqui, com as peças do capitel clássico:
// o topo do fuste canelado, o astrágalo, o equino com óvulos, as duas volutas ligadas pelo canal e o ábaco.
import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  LatheGeometry,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { box, merge, shaft } from "./world/geometry";

const TAU = Math.PI * 2;

// Faixa em espiral (a voluta vista de frente): entre a espiral externa e a interna, 2,6 voltas para dentro.
function voluteShape(R: number, turns = 2.6, band = 0.36) {
  const outer: Vector2[] = [], inner: Vector2[] = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * TAU;
    const r = R * (1 - 0.86 * t);
    const w = r * band;
    outer.push(new Vector2(Math.cos(a) * r, Math.sin(a) * r));
    inner.push(new Vector2(Math.cos(a) * (r - w), Math.sin(a) * (r - w)));
  }
  const s = new Shape(outer);
  inner.reverse().forEach((p) => s.lineTo(p.x, p.y));
  s.closePath();
  return s;
}

function capitalGeometry() {
  const parts: BufferGeometry[] = [];
  // topo do fuste: 24 caneluras, como nas colunas jônicas
  parts.push(shaft(0.7, 0.5, 0.5, 24, 144).translate(0, -0.7, 0));
  // astrágalo: o anel logo abaixo do capitel
  parts.push(new TorusGeometry(0.52, 0.04, 12, 64).rotateX(Math.PI / 2).translate(0, 0.02, 0));
  // equino: a almofada com óvulos em volta
  const ech = new LatheGeometry([new Vector2(0.001, 0), new Vector2(0.52, 0.02), new Vector2(0.62, 0.1), new Vector2(0.6, 0.2), new Vector2(0.001, 0.2)], 64);
  parts.push(ech.translate(0, 0.05, 0));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const egg = new SphereGeometry(0.075, 12, 10).scale(1, 1.25, 0.6);
    egg.rotateY(-a).translate(Math.sin(a) * 0.62, 0.15, Math.cos(a) * 0.62);
    parts.push(egg);
  }
  // pulvino: o rolo horizontal que liga as duas volutas por trás da frente
  parts.push(new CylinderGeometry(0.3, 0.3, 1.5, 48).rotateZ(Math.PI / 2).translate(0, 0.32, -0.02));
  // volutas: espirais em relevo nas duas pontas, na frente e atrás
  const vol = new ExtrudeGeometry(voluteShape(0.34), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 2, curveSegments: 4 });
  for (const sx of [-1, 1]) {
    for (const sz of [1, -1]) {
      const g = vol.clone();
      if (sx < 0) g.scale(-1, 1, 1); // espelha para enrolar para dentro dos dois lados
      if (sz < 0) g.rotateY(Math.PI);
      parts.push(g.translate(sx * 0.62, 0.3, sz * 0.32));
    }
    // disco das pontas do rolo
    parts.push(new CylinderGeometry(0.33, 0.33, 0.06, 48).rotateZ(Math.PI / 2).translate(sx * 0.76, 0.32, -0.02));
  }
  // canal: a faixa que corre entre as volutas, na frente e atrás
  for (const sz of [1, -1]) parts.push(box(0.9, 0.09, 0.1, 0, 0.6, sz * 0.32));
  // ábaco: a laje fina do topo
  parts.push(box(1.62, 0.1, 1.05, 0, 0.71, 0));
  return merge(parts);
}

let cached: Promise<string> | null = null;

// Endereço blob: do GLB, gerado uma vez por visita.
export function capitalUrl(): Promise<string> {
  if (cached) return cached;
  cached = new Promise((resolve, reject) => {
    const scene = new Scene();
    // dupla face: a voluta da esquerda é a da direita espelhada, e o espelho inverte o lado das faces
    scene.add(new Mesh(capitalGeometry(), new MeshStandardMaterial({ color: 0xe8dfcf, roughness: 0.7, side: DoubleSide })));
    new GLTFExporter().parse(
      scene,
      (glb) => resolve(URL.createObjectURL(new Blob([glb as ArrayBuffer], { type: "model/gltf-binary" }))),
      reject,
      { binary: true },
    );
  });
  return cached;
}
