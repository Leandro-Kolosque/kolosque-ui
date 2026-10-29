import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Cta";
import LibraryExplorer from "@/components/library/LibraryExplorer";

export const metadata: Metadata = {
  title: "Biblioteca — Kolosque UI",
  description: "Todos os experimentos de UI/UX do Kolosque UI, com busca, filtros e ordenação.",
};

export default function LibraryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-26">
          <div className="wrap">
            <h1 className="h-display text-5xl tracking-[-2px] md:text-6xl">Biblioteca</h1>
            <p className="copy mt-4 text-muted">
              Todos os experimentos, prontos ou não.<br />
              Busque por nome e combine filtros; a URL guarda a sua busca.
            </p>
            <Suspense fallback={<div className="mt-12 min-h-96" />}>
              <LibraryExplorer />
            </Suspense>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}