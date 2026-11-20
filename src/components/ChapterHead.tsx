// Abertura de capítulo: número e nome em mono, linha dourada que se desenha ao entrar e o nome grego (decorativo).
export default function ChapterHead({ n, title, greek, className = "" }: { n: string; title: string; greek: string; className?: string }) {
  return (
    <div data-reveal="fade" className={`flex items-center gap-4 font-mono text-[11px] uppercase tracking-[1.5px] md:text-xs ${className}`}>
      <span className="shrink-0"><b className="font-medium text-accent">{n}</b> — {title}</span>
      <span aria-hidden data-reveal="draw" className="h-px flex-1 bg-gold/60 dark:bg-gold" />
      <span aria-hidden className="shrink-0 text-muted">{greek}</span>
    </div>
  );
}
