import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-serif-display";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kolosque UI — um arquivo pessoal de experiências digitais",
  description: "Componentes, animações e experimentos de UI/UX criados durante meu aprendizado em front-end.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
