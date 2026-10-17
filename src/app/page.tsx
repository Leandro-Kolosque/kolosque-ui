import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Featured from "@/components/Featured";
import Categories from "@/components/Categories";
import Journey from "@/components/Journey";
import Cta, { Footer } from "@/components/Cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="relative z-10 bg-bg">
          <About />
          <Featured />
          <Categories />
          <Journey />
          <Cta />
          <Footer />
        </div>
      </main>
    </>
  );
}
