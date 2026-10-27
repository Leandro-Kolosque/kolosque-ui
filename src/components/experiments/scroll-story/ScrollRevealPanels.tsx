"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assets } from "./assets";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollRevealPanels() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".main", containerRef.current);

    sections.forEach((section) => {
      const mount = section.querySelector(".mount");
      const text = section.querySelector(".scrolling-text");
      const img = section.querySelector(".mount-img");

      gsap.to(mount, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "power2.inOut",
        scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true },
      });

      gsap.fromTo(text, { yPercent: 150, opacity: 0 }, {
        yPercent: -100,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.fromTo(img, { yPercent: -10 }, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-black">
      {assets.map((item, index) => {
        const isEven = index % 2 === 0;
        return (
          <div
            key={item.text}
            className={`main relative flex h-[80vh] flex-col items-center justify-center gap-8 border-b border-zinc-800 px-6 last:border-0 md:justify-between md:px-16 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
          >
            <div className={`pointer-events-none z-20 flex w-full justify-center md:w-1/3 ${isEven ? "md:justify-start" : "md:justify-end"}`}>
              <div className="overflow-hidden">
                <h1 className="scrolling-text whitespace-nowrap text-4xl font-bold uppercase tracking-tighter text-white md:text-6xl">
                  {item.text}
                </h1>
              </div>
            </div>

            <div className={`z-10 flex w-full flex-1 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
              <div className="relative h-[40vh] w-full overflow-hidden rounded-xl shadow-2xl md:h-[44vh] md:w-[90%]">
                <div
                  className="mount relative size-full"
                  style={{
                    clipPath: isEven
                      ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
                      : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
                  }}
                >
                  <img className="mount-img absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover" src={item.image} alt="" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}