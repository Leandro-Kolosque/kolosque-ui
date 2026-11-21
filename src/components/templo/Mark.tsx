// Marca do Mouseion: frontão e quatro colunas, com uma lua crescente fina em dourado nascendo atrás do telhado
// (o frontão, preenchido com a cor do fundo, cobre a parte de baixo dela).
export default function Mark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} fill="none" aria-hidden className={className}>
      <path d="M34 3A7 7 0 0 0 34 17A9 9 0 0 1 34 3Z" fill="var(--gold)" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
        <path d="M7 16 22 8l15 8H7Z" fill="var(--bg)" />
        <path d="M8 19h28M12 22v12M19 22v12M25 22v12M32 22v12M7 37h30" />
      </g>
    </svg>
  );
}
