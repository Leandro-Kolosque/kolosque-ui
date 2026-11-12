import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, DM_Mono, DM_Serif_Display, IBM_Plex_Mono, Instrument_Serif, JetBrains_Mono, Playfair_Display } from "next/font/google";
import Specimen from "./Specimen";

// Página provisória para decidir paleta e tipografia. Não entra no menu.
export const metadata: Metadata = { title: "Espécime — Kolosque UI", robots: { index: false } };

const bodoni = Bodoni_Moda({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"] });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"] });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });
const jetMono = JetBrains_Mono({ subsets: ["latin"] });

export default function SpecimenPage() {
  return (
    <Specimen
      displays={[
        { name: "Bodoni Moda", note: "didone, tamanho óptico", className: bodoni.className },
        { name: "Playfair Display", note: "didone de tela, mais robusta", className: playfair.className },
        { name: "Cormorant Garamond", note: "garalde leve, alto contraste", className: cormorant.className },
        { name: "Instrument Serif", note: "condensada, editorial", className: instrument.className },
        { name: "DM Serif Display", note: "atual, para comparar", className: dmSerif.className },
      ]}
      monos={[
        { name: "DM Mono", note: "família do DM Sans", className: dmMono.className },
        { name: "IBM Plex Mono", note: "mais técnica", className: plexMono.className },
        { name: "JetBrains Mono", note: "de editor de código", className: jetMono.className },
      ]}
    />
  );
}
