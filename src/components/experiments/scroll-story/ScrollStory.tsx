"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ScrollRevealPanels from "./ScrollRevealPanels";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollStory() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".footer-text", {
      opacity: 0,
      y: 40,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".footer", start: "top 50%", end: "top 10%", scrub: true },
    });
  }, { scope: root });

  return (
    <div ref={root} className="bg-black">
      <section className="flex h-screen flex-col items-center justify-center bg-linear-to-b from-black via-black to-zinc-900 px-6 text-center">
        <h2 className="text-5xl font-bold tracking-tight text-white md:text-8xl">BEYOND THE FOG</h2>
        <p className="mt-6 max-w-xl text-lg text-zinc-600">Every scroll reveals a new horizon.</p>
      </section>
      <ScrollRevealPanels />
      <div className="footer flex h-screen flex-col items-center justify-center bg-linear-to-t from-black via-black to-zinc-900 px-6 text-center">
        <section className="footer-text flex h-fit flex-col items-center justify-center">
          <h2 className="text-5xl font-bold text-white md:text-7xl">Thanks for Exploring</h2>
          <p className="mt-6 text-xl text-zinc-400 md:text-2xl">Animation powered by GSAP ScrollTrigger</p>
        </section>
      </div>
    </div>
  );
}