// Constelação de Lyra: a lira das Musas no céu sobre o templo (aparece à noite, no Epílogo).
// Posições projetadas a partir das coordenadas reais (J2000) das seis estrelas principais,
// com o leste à esquerda, como se vê no céu. O raio segue o brilho: Vega é a mais forte.
const STARS = {
  vega: { x: 198.8, y: 55.4, r: 3.2, t: 3.1 },
  epsilon: { x: 138.7, y: 20, r: 1.4, t: 4.3 },
  zeta: { x: 135.2, y: 102.6, r: 1.4, t: 3.7 },
  delta: { x: 56.2, y: 130.8, r: 1.4, t: 5.2 },
  gamma: { x: 20, y: 299.2, r: 1.9, t: 4.6 },
  beta: { x: 92, y: 272.3, r: 1.9, t: 3.9 },
};
type Star = keyof typeof STARS;
const LINES: [Star, Star][] = [
  ["vega", "epsilon"], ["vega", "zeta"], ["epsilon", "zeta"],
  ["zeta", "delta"], ["delta", "gamma"], ["gamma", "beta"], ["beta", "zeta"],
];

export default function Lyra({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 320" aria-hidden className={`overflow-visible ${className}`}>
      <g stroke="var(--gold)" strokeOpacity=".45" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {LINES.map(([a, b]) => (
          <line key={a + b} x1={STARS[a].x} y1={STARS[a].y} x2={STARS[b].x} y2={STARS[b].y} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g fill="var(--gold)" style={{ filter: "drop-shadow(0 0 3px var(--gold))" }}>
        {Object.entries(STARS).map(([id, s], i) => (
          <circle key={id} cx={s.x} cy={s.y} r={s.r} style={{ animation: `twinkle ${s.t}s ease-in-out ${i * 0.7}s infinite` }} />
        ))}
      </g>
      <text x="212" y="316" textAnchor="end" className="font-mono" fontSize="14" letterSpacing="2" fill="var(--gold)" fillOpacity=".7">ΛΥΡΑ</text>
    </svg>
  );
}
