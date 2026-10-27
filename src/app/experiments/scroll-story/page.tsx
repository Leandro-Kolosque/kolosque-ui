import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScrollStory from "@/components/experiments/scroll-story/ScrollStory";

export const metadata = { title: "Scroll Story — Kolosque UI" };

export default function Page() {
  return (
    <>
      <Link href="/#biblioteca" className="fixed left-6 top-6 z-50 inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 text-[13px] font-medium uppercase tracking-[1px] text-white backdrop-blur transition hover:bg-white/10">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <ScrollStory />
    </>
  );
}