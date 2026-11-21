"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import type { InkObjectProps } from "@/components/canvasui/InkObject/InkObject";

// Capitel jônico impresso em nanquim (Ink Object, do Canvas UI) no capítulo Ordens: "a ordem como sistema"
// vira um objeto que gira devagar e pode ser arrastado (só com mouse; no toque ele só gira, para não prender o scroll).
// O componente e o modelo só carregam quando o capítulo se aproxima da tela; fora dela o Ink Object para de desenhar.
// A cor do traço acompanha o tema: claro sobre o escuro à noite, tinta sobre o marfim de dia.
export default function OrdensInk() {
  const box = useRef<HTMLDivElement>(null);
  const [Ink, setInk] = useState<ComponentType<InkObjectProps> | null>(null);
  const [src, setSrc] = useState("");
  const [night, setNight] = useState(true);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setNight(html.classList.contains("dark"));
    sync();
    setFine(matchMedia("(hover: hover) and (pointer: fine)").matches);
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    const el = box.current;
    if (!el) return () => mo.disconnect();
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const [mod, cap] = await Promise.all([import("@/components/canvasui/InkObject/InkObject"), import("./capital")]);
      const url = await cap.capitalUrl();
      setInk(() => mod.InkObject);
      setSrc(url);
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={box} className="t-ink-box">
      {Ink && src && (
        <Ink
          className="t-ink-canvas"
          src={src}
          inkColor={night ? "#ede4d3" : "#1e1412"}
          background=""
          highlight="#c9a55c"
          lineSpacing={4.5}
          strokeWeight={0.85}
          angle={32}
          dashLength={10}
          variation={0.8}
          bleed={0.18}
          grain={0.28}
          wobble={0.2}
          relief={0.6}
          contrast={2.4}
          threshold={0.24}
          scale={2.5}
          yOffset={-0.35}
          fov={40}
          cameraDistance={5.2}
          autoRotate
          autoRotateSpeed={0.7}
          orbit={fine}
          zoom={false}
          floatIntensity={0.15}
          rotationIntensity={0}
        />
      )}
    </div>
  );
}
