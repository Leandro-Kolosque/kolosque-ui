import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Reveals from "@/components/Reveals";
import "lenis/dist/lenis.css";

export const metadata: Metadata = {
  title: "Kolosque UI — um arquivo pessoal de experiências digitais",
  description: "Componentes, animações e experimentos de UI/UX criados durante meu aprendizado em front-end.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body><SmoothScroll /><Reveals /><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
