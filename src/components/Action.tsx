"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/?.:-";
const STEP = 55; // ms entre um sorteio de letras e o próximo: rápido o bastante para ler como movimento, sem piscar

// Embaralha o rótulo e o acerta da esquerda para a direita, como um letreiro que se ajusta.
// A fonte é mono, então a largura não muda durante o efeito. Com movimento reduzido, não faz nada.
function useScramble(text: string) {
  const [shown, setShown] = useState(text);
  const raf = useRef(0);

  const run = useCallback(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const dur = 360 + text.length * 22;
    let step = -1;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const s = Math.floor((now - t0) / STEP);
      if (s !== step || p === 1) {
        step = s;
        const fixed = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          out += i < fixed || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setShown(out);
      }
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return [shown, run] as const;
}

type Props = {
  children: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  /** Link para fora do site: abre em nova aba e troca a seta por uma diagonal. */
  external?: boolean;
  icon?: LucideIcon;
  className?: string;
};

// Botão e link de ação do site: círculo com ícone e rótulo em mono (estilos .act em globals.css).
// O rótulo real fica para leitores de tela; o que embaralha é só visual.
export default function Action({ children, href, onClick, variant = "ghost", size = "md", external, icon, className = "" }: Props) {
  const [shown, run] = useScramble(children);
  const label = useRef<HTMLSpanElement>(null);

  // Embaralha uma vez quando entra na tela, depois que a revelação do bloco começou.
  useEffect(() => {
    const el = label.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = window.setTimeout(run, 350);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [run]);

  const Icon = icon ?? (external ? ArrowUpRight : ArrowRight);
  const cls = `act ${variant === "primary" ? "act-primary" : ""} ${size === "sm" ? "act-sm" : ""} ${className}`;
  const body = (
    <>
      <span className="act-dot">
        <Icon size={size === "sm" ? 16 : 18} strokeWidth={1.5} aria-hidden />
      </span>
      <span ref={label}>
        <span className="sr-only">{children}</span>
        <span aria-hidden>{shown}</span>
      </span>
    </>
  );
  const events = { onPointerEnter: run, onFocus: run };

  if (!href) return <button type="button" onClick={onClick} className={cls} {...events}>{body}</button>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...events}>{body}</a>;
  if (href.startsWith("/")) return <Link href={href} onClick={onClick} className={cls} {...events}>{body}</Link>;
  return <a href={href} onClick={onClick} className={cls} {...events}>{body}</a>;
}
