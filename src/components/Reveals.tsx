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
// Na /templo (data-motion="cinema"), os tempos seguem o ritmo medido no Kage e as peças marcadas com
// data-exit="início duração [shift] [blur]" deixam a Hero uma a uma nos primeiros 58% de tela de scroll.
// Peças dentro de [data-reveal-now] entram ao carregar, em sequência, em vez de esperar o scroll.

// Tempos padrão e os da /templo (palavras um pouco mais rápidas e mais espaçadas; apoio subindo um pouco mais).
const TEMPOS = {
  default: { words: { duration: 1.1, stagger: 0.06 }, up: { y: 24, duration: 0.9, stagger: 0.08, ease: "power3.out" } },
  cinema: { words: { duration: 0.82, stagger: 0.072 }, up: { y: 26, duration: 1.05, stagger: 0.085, ease: "expo.out" } },
};

function setup() {
  const t = document.querySelector('[data-motion="cinema"]') ? TEMPOS.cinema : TEMPOS.default;

  // Títulos: a divisão em linhas depende da fonte. Não esperamos ela carregar: o SplitText refaz
  // a divisão sozinho quando a fonte chega (autoSplit) e retoma a animação do ponto em que estava.
  gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((el) => {
    SplitText.create(el, {
      type: "words,lines",
      mask: "lines",
      aria: "auto",
      autoSplit: true,
      onSplit(self) {
        // Folga para descendentes (g, p, y) que a máscara cortaria com line-height 1. Na Playfair o "p" desce
        // uns 0,22em abaixo da linha: com 0,14em a ponta dele era cortada (visível no "papel" do Epílogo da /templo).
        gsap.set(self.masks, { paddingBottom: "0.22em", marginBottom: "-0.22em" });
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.words, {
          yPercent: 115,
          duration: t.words.duration,
          ease: "expo.out",
          stagger: t.words.stagger,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });

  gsap.set('[data-reveal="up"]', { autoAlpha: 0, y: t.up.y });
  gsap.set('[data-reveal="fade"]', { autoAlpha: 0 });
  // Dentro de [data-reveal-now] (a Hero da /templo) tudo entra ao carregar, em sequência, sem esperar o scroll:
  // o índice de capítulos fica rente à base da tela, abaixo do ponto em que o scroll revelaria.
  const all = gsap.utils.toArray<HTMLElement>('[data-reveal="up"], [data-reveal="fade"]');
  const now = all.filter((el) => el.closest("[data-reveal-now]"));
  if (now.length) {
    gsap.to(now, { autoAlpha: 1, y: 0, duration: t.up.duration, ease: t.up.ease, stagger: 0.095, delay: 0.34, clearProps: "transform" });
  }
  ScrollTrigger.batch(all.filter((el) => !now.includes(el)), {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: t.up.duration, ease: t.up.ease, stagger: t.up.stagger, overwrite: true, clearProps: "transform" }),
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

  // Saída da Hero na /templo: cada peça tem a sua janela dentro do trecho (0 a 1) e some com o scroll, sem atraso.
  // Fica no wrapper das peças, nunca no mesmo elemento da revelação, para as duas animações não disputarem a opacidade.
  const exits = gsap.utils.toArray<HTMLElement>("[data-exit]");
  if (exits.length) {
    const tl = gsap.timeline({
      defaults: { ease: "sine.inOut" },
      scrollTrigger: { start: 0, end: () => innerHeight * 0.58, scrub: true, invalidateOnRefresh: true },
    });
    exits.forEach((el) => {
      const [at, span, ...flags] = (el.dataset.exit ?? "").trim().split(/\s+/);
      const to: gsap.TweenVars = { autoAlpha: 0, duration: parseFloat(span) || 0.3 };
      const from: gsap.TweenVars = { autoAlpha: 1 };
      if (flags.includes("shift")) {
        from.y = 0;
        to.y = 15;
      }
      if (flags.includes("blur")) {
        from.filter = "blur(0px)";
        to.filter = "blur(10px)";
      }
      tl.fromTo(el, from, to, parseFloat(at) || 0);
    });
    tl.set({}, {}, 1);
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
