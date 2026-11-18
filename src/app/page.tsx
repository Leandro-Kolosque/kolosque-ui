import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Pinacoteca from "@/components/Pinacoteca";
import About from "@/components/About";
import Featured from "@/components/Featured";
import Categories from "@/components/Categories";
import Journey from "@/components/Journey";
import Cta, { Footer } from "@/components/Cta";

// Capítulos do Mouseion (ver BRIEF.md):
// 00 Propileus (Hero) · 01 Pinacoteca · 02 Biblioteca (Featured + Categories) · 03 Ordens (About + Journey) · 04 Epílogo (Cta) · Colofão
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="relative z-10 bg-bg">
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
