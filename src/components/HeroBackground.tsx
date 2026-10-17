"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { scenes, timing } from "@/data/hero";

gsap.registerPlugin(useGSAP);

export default function HeroBackground() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const layers = gsap.utils.toArray<HTMLElement>(".scene", root.current);
    if (layers.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { hold, fade, drift } = timing;
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(layers, { autoAlpha: 0 }).set(layers[0], { autoAlpha: 1 });
    layers.forEach((el, i) => {
      const next = layers[(i + 1) % layers.length];
      const at = i * (hold + fade);
      if (drift) tl.fromTo(el, { scale: 1 }, { scale: 1 + drift, duration: hold + fade, ease: "none" }, at);
      tl.to(next, { autoAlpha: 1, duration: fade, ease: "power1.inOut" }, at + hold)
        .to(el, { autoAlpha: 0, duration: fade, ease: "power1.inOut" }, at + hold);
    });
    // Pausa quando a próxima seção cobre a Hero (sem usar scroll para avançar as cenas).
    const sync = () => tl.paused(scrollY > innerHeight * 1.05);
    addEventListener("scroll", sync, { passive: true });
    return () => removeEventListener("scroll", sync);
  }, { scope: root });

  return (
    <div ref={root} aria-hidden className="absolute inset-0 bg-[#0B0D17]">
      {scenes.map((s, i) => (
        <div key={i} className="scene absolute inset-0" style={{ opacity: i ? 0 : 1 }}>
          {s.src ? (
            <Image src={s.src} alt="" fill priority={i < 2} sizes="100vw" className="scene-img object-cover"
              style={{ "--pos": s.position, "--pos-m": s.mobilePosition ?? s.position } as React.CSSProperties} />
          ) : (
            <div className="size-full" style={{ background: s.fallback }} />
          )}
        </div>
      ))}
    </div>
  );
}
