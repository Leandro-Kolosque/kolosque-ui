"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Um experimento novo = uma linha aqui (o chunk só é baixado na rota dele).
const demos: Record<string, ComponentType> = {
  "scroll-story": dynamic(() => import("./scroll-story/ScrollStory"), { ssr: false }),
  "jelly-spiral": dynamic(() => import("./jelly-spiral/ImageSpiral"), { ssr: false }),
};

export default function DemoLoader({ slug }: { slug: string }) {
  const Demo = demos[slug];
  return Demo ? <Demo /> : null;
}