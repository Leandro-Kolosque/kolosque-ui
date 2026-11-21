import type { Metadata } from "next";
import "@fontsource/gfs-didot";
import "./templo.css";
import World from "@/components/templo/World";
import TemploNav from "@/components/templo/TemploNav";
import Propileus from "@/components/templo/Propileus";
import PinacotecaMosaic from "@/components/templo/PinacotecaMosaic";
import Atlas from "@/components/templo/Atlas";
import Ordens from "@/components/templo/Ordens";
import Epilogo from "@/components/templo/Epilogo";
import Colofao from "@/components/templo/Colofao";

// Versão cinematográfica da landing, em teste até ser aprovada e substituir a /. Fora dos buscadores até lá.
export const metadata: Metadata = {
  title: "Kolosque UI — Mouseion",
  description: "Portfólio de design e front-end de Leandro Kolosque: landing pages na Pinacoteca e experimentos de UI na Biblioteca.",
  robots: { index: false },
};

// Capítulos (ver BRIEF.md): 00 Propileus · 01 Pinacoteca · 02 Biblioteca · 03 Ordens · 04 Epílogo · Colofão.
// data-motion="cinema" ajusta os tempos das revelações (Reveals.tsx) ao ritmo desta página.
export default function Templo() {
  return (
    <div className="templo" data-motion="cinema">
      <World />
      <TemploNav />
      <div className="t-page">
        <main>
          <Propileus />
          <PinacotecaMosaic />
          <Atlas />
          <Ordens />
          <Epilogo />
        </main>
        <Colofao />
      </div>
      <div aria-hidden className="t-vignette" />
      <div aria-hidden className="t-grain" />
    </div>
  );
}
