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
    const period = hold + fade;
    const life = hold + 2 * fade; // tempo total de cada cena na tela (entra, fica, sai)
    const lead = drift * (fade / life); // zoom já acumulado quando a cena começa a entrar
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(layers, { autoAlpha: 0 }).set(layers[0], { autoAlpha: 1 });
    layers.forEach((el, i) => {
      const next = layers[(i + 1) % layers.length];
      const at = i * period;
      if (drift) {
        // zoom lento e contínuo durante toda a permanência da cena, inclusive nos fades
        if (i === 0) tl.fromTo(el, { scale: 1 + lead }, { scale: 1 + drift, duration: period, ease: "none" }, 0);
        else tl.fromTo(el, { scale: 1 }, { scale: 1 + drift, duration: life, ease: "none" }, at - fade);
      }
      tl.to(next, { autoAlpha: 1, duration: fade, ease: "power1.inOut" }, at + hold)
        .to(el, { autoAlpha: 0, duration: fade, ease: "power1.inOut" }, at + hold);
    });

    // a primeira cena volta a entrar no fim do ciclo, já com o zoom em andamento
    if (drift) tl.fromTo(layers[0], { scale: 1 }, { scale: 1 + lead, duration: fade, ease: "none", immediateRender: false }, layers.length * period - fade);

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
            <Image src={s.src} alt="" fill unoptimized priority={i < 2} className="scene-img object-cover"
              style={{ "--pos": s.position, "--pos-m": s.mobilePosition ?? s.position } as React.CSSProperties} />
          ) : (
            <div className="size-full" style={{ background: s.fallback }} />
          )}
        </div>
      ))}
    </div>
  );
}
