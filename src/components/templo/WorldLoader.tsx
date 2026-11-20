"use client";
import dynamic from "next/dynamic";

// WebGL só no cliente: o three e o santuário entram num pedaço separado, carregado depois do HTML.
const WorldCanvas = dynamic(() => import("./WorldCanvas"), { ssr: false });

export default function WorldLoader() {
  return <WorldCanvas />;
}
