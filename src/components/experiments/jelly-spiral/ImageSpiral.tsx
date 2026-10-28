"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

// Imagens em public/spiral/ (3:4, 900x1200, WebP). Pode ter mais ou menos de 9:
// a espiral usa o dobro de cartas (cada imagem aparece duas vezes).
const IMAGE_URLS = [
  "/spiral/spiral-1.jpg",
  "/spiral/spiral-2.jpg",
  "/spiral/spiral-3.jpg",
  "/spiral/spiral-4.jpg",
  "/spiral/spiral-5.jpg",
  "/spiral/spiral-6.jpg",
  "/spiral/spiral-7.jpg",
  "/spiral/spiral-8.jpg",
  "/spiral/spiral-9.jpg",
];

const SETTINGS = {
  radius: 1.8,
  verticalGap: 0.9,
  angleGap: 0.85,
  cardWidth: 1.35,
  cardHeight: 1.8,
  idleSpin: 0.005,
  scrollSensitivity: 0.004,
  smoothing: 0.1,
  wobbleStrength: 0.3,
};

const vertexShader = `
  uniform float uWobble;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    viewPosition.x += sin(uv.y * 3.14159) * uWobble;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    if (!gl_FrontFacing) {
      color.rgb = mix(color.rgb, vec3(1.0), 0.75);
    }

    gl_FragColor = color;
    #include <colorspace_fragment>
  }
`;

export default function ImageSpiral() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    gsap.registerPlugin(Observer);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 8;

    const cardCount = IMAGE_URLS.length * 2;
    const geometry = new THREE.PlaneGeometry(SETTINGS.cardWidth, SETTINGS.cardHeight, 1, 16);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const wobble = { value: 0 };
    const textures: THREE.Texture[] = [];
    const materials: THREE.ShaderMaterial[] = [];
    const cards: THREE.Mesh[] = [];

    // Cada imagem é carregada uma vez e a textura é reaproveitada.
    const loadedTextures = IMAGE_URLS.map((url) => {
      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      return texture;
    });

    IMAGE_URLS.concat(IMAGE_URLS).forEach((_, index) => {
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: loadedTextures[index % IMAGE_URLS.length] },
          uWobble: wobble,
        },
      });

      const card = new THREE.Mesh(geometry, material);
      materials.push(material);
      cards.push(card);
      scene.add(card);
    });

    const state = { rotation: 0, rotationTarget: 0 };

    const observer = Observer.create({
      target: window,
      type: "wheel,touch",
      preventDefault: true,
      onChange: (self) => {
        state.rotationTarget += self.deltaY * SETTINGS.scrollSensitivity;
      },
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idleSpin = reduceMotion ? 0 : SETTINGS.idleSpin;
    const wobbleStrength = reduceMotion ? 0 : SETTINGS.wobbleStrength;

    const tick = (_time: number, deltaTime: number) => {
      const frames = Math.min(deltaTime / 16.667, 3); // 1 = um frame a 60 fps
      const ease = 1 - Math.pow(1 - SETTINGS.smoothing, frames); // suavização igual em qualquer monitor

      state.rotationTarget += idleSpin * frames;
      state.rotation += (state.rotationTarget - state.rotation) * ease;

      const lag = THREE.MathUtils.clamp(state.rotationTarget - state.rotation, -1, 1);
      wobble.value += (lag * wobbleStrength - wobble.value) * ease;

      cards.forEach((card, index) => {
        const slot = THREE.MathUtils.euclideanModulo(index - state.rotation, cardCount) - cardCount / 2;
        const angle = slot * SETTINGS.angleGap + Math.PI / 2;

        card.position.set(
          Math.cos(angle) * SETTINGS.radius,
          slot * SETTINGS.verticalGap,
          Math.sin(angle) * SETTINGS.radius
        );
        card.rotation.y = Math.PI / 2 - angle;
      });

      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    gsap.ticker.add(tick);

    return () => {
      observer.kill();
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
      scene.clear();
      materials.forEach((material) => material.dispose());
      geometry.dispose();
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 h-dvh w-full overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Galeria de imagens em espiral 3D"
      />
    </div>
  );
}