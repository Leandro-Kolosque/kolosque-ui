import type { CSSProperties, ReactNode } from "react";

// Coluna grega em SVG, desenhada como gravura (traço fino, preenchimento cor de papel).
// Capitel e base têm proporção fixa; o fuste estica para qualquer altura.
// Medidas em unidades de 120 (largura do capitel). O fuste ocupa 100 na base e afina para 88 no topo (êntase simplificada).
// Os traços usam non-scaling-stroke: ficam com 1px em qualquer tamanho.

type Order = "ionic" | "doric";

const stroke = { stroke: "currentColor", vectorEffect: "non-scaling-stroke" as const, fill: "var(--col-fill)" };
const line = { stroke: "currentColor", vectorEffect: "non-scaling-stroke" as const, fill: "none" };

// Voluta jônica: espiral de Arquimedes do raio externo até o olho.
function volute(cx: number, cy: number, dir: 1 | -1) {
  const turns = 2.25, r0 = 12, r1 = 2, steps = 96;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = -Math.PI / 2 + dir * t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  return d;
}
const VOLUTE_L = volute(14, 20, -1);
const VOLUTE_R = volute(106, 20, 1);

// Caneluras vistas de frente num cilindro: mais juntas perto das bordas.
const FLUTES = Array.from({ length: 9 }, (_, k) => {
  const c = Math.cos((Math.PI * (k + 1)) / 10);
  return { top: 50 - 44 * c, bottom: 50 - 50 * c };
});

function IonicCapital() {
  return (
    <svg viewBox="0 0 120 38" className="block w-full overflow-visible" aria-hidden>
      <g fill="var(--col-fill)" stroke="none">
        <rect x="2" y="0" width="116" height="4" />
        <rect x="14" y="4" width="92" height="30" />
        <circle cx="14" cy="20" r="12" />
        <circle cx="106" cy="20" r="12" />
      </g>
      <rect x="2" y="0" width="116" height="4" {...stroke} />
      <path d="M14 8H106" {...line} />
      <path d="M20.5 30.2Q60 36 99.5 30.2" {...line} />
      <path d={VOLUTE_L} {...line} />
      <path d={VOLUTE_R} {...line} />
      <circle cx="14" cy="20" r="1.6" {...line} />
      <circle cx="106" cy="20" r="1.6" {...line} />
      <rect x="16" y="34" width="88" height="4" {...stroke} />
    </svg>
  );
}

function DoricCapital() {
  return (
    <svg viewBox="0 0 120 26" className="block w-full overflow-visible" aria-hidden>
      <rect x="16" y="20" width="88" height="6" fill="var(--col-fill)" stroke="none" />
      <rect x="4" y="0" width="112" height="7" {...stroke} />
      <path d="M10 7Q12 18 16 20H104Q108 18 110 7Z" {...stroke} />
      <path d="M16 20V26M104 20V26M16 22.5H104M16 25H104" {...line} />
    </svg>
  );
}

// Base ática: toro, escócia, toro e plinto. A dórica não tem base, como na Grécia.
function AtticBase() {
  return (
    <svg viewBox="0 0 120 24" className="block w-full overflow-visible" aria-hidden>
      <rect x="8" y="0" width="104" height="6" rx="3" {...stroke} />
      <path d="M11 6C14 8.5 14 10.5 9 12H111C106 10.5 106 8.5 109 6Z" {...stroke} />
      <rect x="5" y="12" width="110" height="6" rx="3" {...stroke} />
      <rect x="2" y="18" width="116" height="6" {...stroke} />
    </svg>
  );
}

function Shaft({ gold = false }: { gold?: boolean }) {
  return (
    <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
      {gold ? (
        <polygon points="6,0 94,0 100,1000 0,1000" fill="var(--gold)" fillOpacity=".12" stroke="none" />
      ) : (
        <polygon points="6,0 94,0 100,1000 0,1000" {...stroke} />
      )}
      {FLUTES.map((f, i) => (
        <line key={i} x1={f.top} y1="0" x2={f.bottom} y2="1000" vectorEffect="non-scaling-stroke"
          stroke={gold ? "var(--gold)" : "currentColor"} strokeOpacity={gold ? 1 : 0.5} strokeWidth={gold ? 1.5 : 1} />
      ))}
    </svg>
  );
}

type Props = {
  order?: Order;
  className?: string;
  // Dourado progressivo nas caneluras, de cima para baixo, controlado pela variável CSS --p (0 a 1) de um ancestral.
  gild?: boolean;
  fill?: string;
  children?: ReactNode; // elementos posicionados sobre o fuste (ex.: marcadores de capítulo)
};

export default function Column({ order = "ionic", className = "", gild = false, fill = "var(--bg)", children }: Props) {
  return (
    <div className={`flex flex-col items-center ${className}`} style={{ "--col-fill": fill } as CSSProperties}>
      {order === "ionic" ? <IonicCapital /> : <DoricCapital />}
      <div className="relative w-[83.333%] flex-1">
        <Shaft />
        {gild && (
          // O recorte só corta embaixo (o progresso); as margens negativas deixam o brilho noturno (.col-gild) vazar pelas laterais.
          <div className="absolute inset-0" style={{ clipPath: "inset(-12px -12px calc((1 - var(--p, 0)) * 100%) -12px)" }}>
            <div className="col-gild absolute inset-0">
              <Shaft gold />
            </div>
          </div>
        )}
        {children}
      </div>
      {order === "ionic" && <AtticBase />}
    </div>
  );
}
