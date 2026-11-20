"use client";
import { ThemeProvider as Provider, useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// A /templo (versão cinematográfica, em teste) abre à noite; o resto do site segue o sistema.
// O padrão só vale enquanto o visitante não escolhe um tema: a escolha fica salva e é respeitada em todas as rotas.
// A `key` remonta o provider ao entrar ou sair da /templo, para ele reler o padrão certo na navegação pelo cliente.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const templo = usePathname()?.startsWith("/templo") ?? false;
  return (
    <Provider key={templo ? "templo" : "site"} attribute="class" defaultTheme={templo ? "dark" : "system"} enableSystem disableTransitionOnChange>
      {children}
    </Provider>
  );
}

const modes = [["light", Sun, "Tema claro"], ["dark", Moon, "Tema escuro"], ["system", Monitor, "Tema do sistema"]] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div role="group" aria-label="Tema" className="flex rounded-full border border-line bg-surface p-1">
      {modes.map(([key, Icon, label]) => {
        const on = ready && theme === key;
        return (
          <button key={key} onClick={() => setTheme(key)} aria-label={label} aria-pressed={on}
            className={`grid size-8 place-items-center rounded-full transition ${on ? "bg-primary text-primary-fg" : "text-muted hover:text-ink"}`}>
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
