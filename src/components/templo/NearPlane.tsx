"use client";
import { useEffect, useRef, useState } from "react";

// Primeiro plano: recortes de gravura presos à base da tela, NA FRENTE do texto e da navbar (sem receber cliques).
// Cada capítulo tem o seu palco. Quando o capítulo assume a tela, as peças sobem da borda em que estão ancoradas,
// uma a cada 90 ms; o palco anterior desce, desfoca e some. A ideia (palco fixo por capítulo, entrada escalonada e
// saída com desfoque) foi estudada no Kage; o código e as imagens são nossos.
// A Hero não tem palco: o capim dela está dentro da cena 3D. As imagens só carregam quando o capítulo
// delas é o atual ou o próximo. Com movimento reduzido, as peças só aparecem e somem (regra global de transição).

type From = "left" | "right" | "up";
type Piece = { src: string; w: number; h: number; from: From; cls: string; sway?: boolean; mobile?: boolean };

const P = (src: string, w: number, h: number, from: From, cls: string, opts: Partial<Piece> = {}): Piece => ({ src: `/templo/${src}.webp`, w, h, from, cls, ...opts });

// Ordem = ordem de entrada. cls posiciona a peça a partir da base do palco (templo.css › .t-p-*).
const STAGES: { id: string; pieces: Piece[] }[] = [
  { id: "pinacoteca", pieces: [
    P("estilobato", 1000, 648, "left", "t-p-estilobato", { mobile: true }),
    P("oliveira-arvore", 950, 655, "right", "t-p-oliveira", { sway: true }),
    P("acantos", 1600, 545, "up", "t-p-acantos-a", { mobile: true }),
  ] },
  { id: "biblioteca", pieces: [
    P("blocos", 1100, 538, "left", "t-p-blocos", { mobile: true }),
    P("pergaminho", 800, 409, "right", "t-p-pergaminho"),
    P("acantos", 1600, 545, "up", "t-p-acantos-b"),
  ] },
  { id: "ordens", pieces: [
    P("capitel", 880, 490, "left", "t-p-capitel", { mobile: true }),
    P("tambor", 440, 550, "right", "t-p-tambor"),
    P("acantos", 1600, 545, "up", "t-p-acantos-c", { mobile: true }),
  ] },
  { id: "contato", pieces: [
    P("tripode", 374, 900, "left", "t-p-tripode", { mobile: true }),
    P("lira", 440, 673, "right", "t-p-lira"),
    P("acantos", 1600, 545, "up", "t-p-acantos-d", { mobile: true, sway: true }),
  ] },
  { id: "colofao", pieces: [
    P("acantos", 1600, 545, "up", "t-p-acantos-e", { mobile: true }),
    P("fragmentos", 900, 275, "right", "t-p-fragmentos"),
  ] },
];

const RETIRE_MS = 820;

export default function NearPlane() {
  const [active, setActive] = useState<string | null>(null);
  const [retiring, setRetiring] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  // no celular só as peças marcadas como mobile entram (as outras nem são baixadas)
  const [narrow, setNarrow] = useState(false);
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const mq = matchMedia("(max-width: 820px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // O capítulo dono do primeiro plano é o que ocupa mais tela (fora uma margem de 12% em cima e embaixo).
  useEffect(() => {
    const els = STAGES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best: string | null = null, max = 0;
      ratios.forEach((r, id) => { if (r > max) { max = r; best = id; } });
      setActive(best);
    }, { rootMargin: "-12% 0px -12% 0px", threshold: [0, 0.12, 0.32, 0.55] });
    els.forEach((el) => io.observe(el));
    // o primeiro palco já carrega depois da página, para a primeira entrada não esperar a imagem
    const idle = setTimeout(() => setLoaded((s) => new Set(s).add(STAGES[0].id)), 1200);
    return () => {
      io.disconnect();
      clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const before = prev.current;
    prev.current = active;
    if (active) {
      const i = STAGES.findIndex((s) => s.id === active);
      // o palco atual e os vizinhos (o leitor pode voltar ou seguir), para a entrada não esperar a imagem
      setLoaded((s) => {
        const n = new Set(s).add(active);
        if (STAGES[i + 1]) n.add(STAGES[i + 1].id);
        if (STAGES[i - 1]) n.add(STAGES[i - 1].id);
        return n;
      });
    }
    if (!before || before === active) return;
    setRetiring(before);
    const t = setTimeout(() => setRetiring((r) => (r === before ? null : r)), RETIRE_MS);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div aria-hidden className="t-near">
      {STAGES.map(({ id, pieces }) => (
        <div key={id} className={`t-stage ${active === id ? "is-active" : ""} ${retiring === id && active !== id ? "is-retiring" : ""}`}>
          {loaded.has(id) && pieces.filter((p) => !narrow || p.mobile).map((p, i) => (
            <span key={p.cls} data-from={p.from} className={`t-piece ${p.cls}`} style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <img src={p.src} width={p.w} height={p.h} alt="" decoding="async" draggable={false} className={p.sway ? "t-sway" : ""} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
