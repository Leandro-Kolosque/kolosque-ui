"use client";
import { useEffect, useRef, useState } from "react";

export type Chapter = { id: string; n: string; title: string; pos: number };

const NAV = 64;

// Acompanha os capítulos da página (seções com data-chapter e data-title) durante o scroll.
// - chapters: os capítulos em ordem, com `pos` (0 a 1) = onde cada um começa no trecho entre o primeiro capítulo e o fim da página.
// - active: id do capítulo em que o leitor está (o último cujo topo já passou de 35% da tela). Vazio na Hero.
// - visible: true depois que a Hero começa a ser coberta.
// - onProgress: progresso de 0 a 1 do primeiro capítulo ao fim da página, chamado a cada scroll (para escrever direto no DOM).
export function useChapterScroll(onProgress?: (p: number) => void) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);
  const progress = useRef(onProgress);
  progress.current = onProgress;

  useEffect(() => {
    let tops: number[] = [];
    let ids: string[] = [];
    let start = 0;
    let span = 1;

    const update = () => {
      progress.current?.(Math.min(1, Math.max(0, (scrollY - start) / span)));
      setVisible(scrollY > start - innerHeight * 0.25);
      let cur = "";
      tops.forEach((t, i) => { if (scrollY + innerHeight * 0.35 >= t) cur = ids[i]; });
      setActive(cur);
    };

    const measure = () => {
      const secs = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
      if (!secs.length) return;
      tops = secs.map((s) => s.getBoundingClientRect().top + scrollY - NAV);
      ids = secs.map((s) => s.id);
      start = tops[0];
      span = Math.max(1, document.documentElement.scrollHeight - innerHeight - start);
      setChapters(secs.map((s, i) => ({
        id: s.id,
        n: s.dataset.chapter ?? "",
        title: s.dataset.title ?? "",
        pos: Math.min(1, Math.max(0, (tops[i] - start) / span)),
      })));
      update();
    };

    measure();
    // A altura da página muda quando imagens e fontes carregam.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("scroll", update);
    };
  }, []);

  return { chapters, active, visible };
}
