import Link from "next/link";
import { GITHUB, motto } from "@/data/templo";
import Mark from "./Mark";

const columns = [
  { title: "Capítulos", links: [["Pinacoteca", "#pinacoteca"], ["Biblioteca", "#biblioteca"], ["Ordens", "#ordens"], ["Epílogo", "#contato"]] },
  { title: "Acervo", links: [["Biblioteca completa", "/library"], ["Jelly Spiral", "/experiments/jelly-spiral"], ["Scroll Story", "/experiments/scroll-story"]] },
  // "Versão anterior" só existe enquanto a /templo está em teste, para comparar as duas.
  { title: "Em outro lugar", links: [["GitHub", GITHUB], ["Versão anterior da landing", "/"]] },
];

// Colofão: o manifesto abre, a navegação vira um índice com fios e a base leva o lema em grego.
export default function Colofao() {
  return (
    <footer className="t-foot">
      <div className="t-foot-grid">
        <div className="t-foot-brand">
          <Mark size={52} />
          <p className="max-w-[46ch] font-display text-[clamp(22px,2vw,30px)] leading-[1.3] tracking-[-0.01em] text-muted">
            Um Mouseion pessoal: landing pages na Pinacoteca, experimentos na Biblioteca, tudo escrito em código.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h4 className="t-label mb-4">{c.title}</h4>
            <ul className="flex flex-col gap-2">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  {href.startsWith("http") ? <a href={href}>{label}</a> : <Link href={href}>{label}</Link>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="t-foot-base">
        <span>© 2026 Leandro Kolosque</span>
        <span aria-hidden title={motto.meaning} className="t-greek text-[13px] normal-case tracking-[.24em]">{motto.greek}</span>
        <span>Feito com Next.js, React e Tailwind</span>
      </div>
    </footer>
  );
}
