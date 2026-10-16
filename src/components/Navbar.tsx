import { ThemeToggle } from "./theme";

const links = [["Biblioteca", "#biblioteca"], ["Categorias", "#categorias"], ["Sobre", "#sobre"]];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between">
        <a href="#" className="font-display text-2xl tracking-[-1px]">Kolosque UI</a>
        <nav className="hidden gap-8 text-[15px] text-muted md:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="transition hover:text-ink">{label}</a>)}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
