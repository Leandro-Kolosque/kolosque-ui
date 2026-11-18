"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

// O desconto da navbar (64px) vem do `scroll-padding-top` do CSS, que o Lenis já respeita nas âncoras.
// Somar um `offset` aqui desconta duas vezes.
const options = { autoRaf: false, lerp: 0.1, anchors: true, stopInertiaOnNavigate: true };

export default function SmoothScroll() {
  const ref = useRef<LenisRef>(null);

  // O GSAP comanda o loop do Lenis e o ScrollTrigger acompanha cada frame de scroll.
  useEffect(() => {
    const tick = (time: number) => ref.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, []);
  useLenis(() => ScrollTrigger.update());

  return <ReactLenis root ref={ref} options={options} />;
}