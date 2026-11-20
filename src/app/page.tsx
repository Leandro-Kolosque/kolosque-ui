import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Pinacoteca from "@/components/Pinacoteca";
import About from "@/components/About";
import Featured from "@/components/Featured";
import Categories from "@/components/Categories";
import Journey from "@/components/Journey";
import Cta, { Footer } from "@/components/Cta";
import ChapterRail from "@/components/temple/ChapterRail";
import Relics from "@/components/temple/Relics";

// Capítulos do Mouseion (ver BRIEF.md):
// 00 Propileus (Hero) · 01 Pinacoteca · 02 Biblioteca (Featured + Categories) · 03 Ordens (About + Journey) · 04 Epílogo (Cta) · Colofão
export default function Home() {
  return (
    <>
      <Navbar />
      <ChapterRail />
      <main>
        <Hero />
        {/* O wrapper cobre a Hero como uma cortina. As relíquias ficam dentro dele com z negativo: acima do fundo, atrás do conteúdo. */}
        <div className="relative z-10 bg-bg">
          <Relics />
          <Pinacoteca />
          <Featured />
          <Categories />
          <About />
          <Journey />
          <Cta />
          <Footer />
        </div>
      </main>
    </>
  );
}
