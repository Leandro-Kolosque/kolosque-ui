import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Categories from "@/components/Categories";
import About from "@/components/About";
import Cta, { Footer } from "@/components/Cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main><Hero /><Featured /><Categories /><About /><Cta /></main>
      <Footer />
    </>
  );
}
