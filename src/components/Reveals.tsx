"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Revelações por scroll (BRIEF.md › Movimento). Marque elementos com data-reveal:
//   words  título revelado palavra por palavra, saindo de uma máscara por linha
//   up     sobe 24px e aparece; elementos que entram juntos vêm em sequência
//   fade   só aparece
//   draw   linha que se desenha da esquerda para a direita
// O CSS esconde [data-reveal] até aqui, só quando o navegador executa JS (@media (scripting: enabled)).
// Com movimento reduzido nada é animado e tudo já começa visível.
// Só use em conteúdo que não é trocado depois de montado: a varredura acontece uma vez por rota, e o SplitText
// troca os nós de texto dos títulos (se o React tentar atualizar esse texto, ele quebra; no dev isso aparece
// como erro de removeChild ao editar um título com a página aberta, e um reload resolve).
// As animações dependem do requestAnimationFrame: em aba oculta elas esperam a aba voltar a ficar visível.
// Extra: na home, o texto da Hero sobe e some enquanto a Pinacoteca cobre a entrada.
function setup() {
  // Títulos: a divisão em linhas depende da fonte. Não esperamos ela carregar: o SplitText refaz
  // a divisão sozinho quando a fonte chega (autoSplit) e retoma a animação do ponto em que estava.
  gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((el) => {
    SplitText.create(el, {
      type: "words,lines",
      mask: "lines",
      aria: "auto",
      autoSplit: true,
      onSplit(self) {
        // Folga para descendentes (g, p, y) que a máscara cortaria com line-height 1.
        gsap.set(self.masks, { paddingBottom: "0.14em", marginBottom: "-0.14em" });
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.words, {
          yPercent: 115,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });

  gsap.set('[data-reveal="up"]', { autoAlpha: 0, y: 24 });
  gsap.set('[data-reveal="fade"]', { autoAlpha: 0 });
  ScrollTrigger.batch('[data-reveal="up"], [data-reveal="fade"]', {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform" }),
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="draw"]').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 1, scaleX: 0, transformOrigin: "left center" }, {
      scaleX: 1,
      duration: 1.4,
      ease: "expo.inOut",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  // Passagem da Hero: o texto ganha profundidade enquanto a próxima seção sobe por cima.
  const hero = document.querySelector("[data-hero-content]");
  if (hero) {
    gsap.to(hero, {
      y: -96,
      opacity: 0,
      ease: "none",
      scrollTrigger: { start: 0, end: () => innerHeight * 0.8, scrub: true, invalidateOnRefresh: true },
    });
  }

  // O ScrollTrigger só mede tudo no evento load da janela (depois de todas as imagens).
  // Medir agora revela de imediato o que já está na tela, como o texto da Hero.
  ScrollTrigger.refresh();
}

export default function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      try {
        setup();
      } catch {
        // Se algo falhar, nada pode ficar escondido.
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          el.style.visibility = "visible";
          el.style.opacity = "1";
        });
      }
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
