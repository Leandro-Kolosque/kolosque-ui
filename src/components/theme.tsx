"use client";
import { ThemeProvider as Provider, useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE = "theme";

// Na navegação pelo cliente o provider não remonta (remontar redesenharia o <script> dele, e o React reclama),
// então o padrão da rota nova é aplicado aqui: só se o visitante nunca escolheu um tema, e sem salvar nada.
function RouteDefault({ fallback }: { fallback: string }) {
  const { setTheme } = useTheme();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false; // na primeira carga o script do next-themes já aplicou o padrão certo
      return;
    }
    try {
      if (localStorage.getItem(STORAGE)) return;
      setTheme(fallback);
      localStorage.removeItem(STORAGE); // setTheme salva; o padrão de rota não é uma escolha do visitante
    } catch {
      // sem localStorage, fica o tema atual
    }
  }, [fallback, setTheme]);
  return null;
}

// A /templo (versão cinematográfica, em teste) abre à noite; o resto do site segue o sistema.
// O padrão só vale enquanto o visitante não escolhe um tema: a escolha fica salva e é respeitada em todas as rotas.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const fallback = usePathname()?.startsWith("/templo") ? "dark" : "system";
  return (
    <Provider attribute="class" storageKey={STORAGE} defaultTheme={fallback} enableSystem disableTransitionOnChange>
      <RouteDefault fallback={fallback} />
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
