"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import type { BlazeProps } from "@/components/canvasui/Blaze/Blaze";

// Faíscas e fumaça subindo da base do Epílogo (Blaze, do Canvas UI), como se os braseiros estivessem logo
// abaixo do quadro. Só à noite, atrás do texto e na frente do mundo; não envolve conteúdo nenhum, então em
// qualquer navegador ela é só uma camada de luz (a distorção de calor do Blaze, que precisa do Chrome 157+,
// não tem o que distorcer aqui). Carrega quando o capítulo se aproxima; fora da tela o Blaze para de desenhar.
// Com movimento reduzido não aparece: são partículas em movimento constante.
export default function EpilogoBlaze() {
  const box = useRef<HTMLDivElement>(null);
  const [Blaze, setBlaze] = useState<ComponentType<BlazeProps> | null>(null);
  const [night, setNight] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;
    const sync = () => setNight(html.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    const el = box.current;
    const io = el ? new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: "600px 0px" }) : null;
    if (el && io) io.observe(el);
    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near || !night || Blaze) return;
    import("@/components/canvasui/Blaze/Blaze").then((m) => setBlaze(() => m.Blaze));
  }, [near, night, Blaze]);

  return (
    <div ref={box} aria-hidden className="t-blaze">
      {Blaze && night && (
        <Blaze
          style={{ width: "100%", height: "100%" }}
          height={0.8}
          distortion={0}
          speed={0.7}
          sparks={1.2}
          sparkDensity={1.6}
          sparkSize={1.2}
          layers={4}
          smoke={0.5}
          glow={2.2}
          sparkColor={[1, 0.62, 0.22]}
          smokeColor={[0.55, 0.2, 0.1]}
        >
          <div />
        </Blaze>
      )}
    </div>
  );
}
