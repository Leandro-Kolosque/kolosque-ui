import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageSpiral from "@/components/experiments/jelly-spiral/ImageSpiral";

export const metadata = { title: "Jelly Spiral — Kolosque UI" };

export default function Page() {
  return (
    <>
      <Link href="/#biblioteca" className="fixed left-6 top-6 z-50 inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-white/70 px-4 text-[13px] font-medium uppercase tracking-[1px] text-black backdrop-blur transition hover:bg-white">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <ImageSpiral />
    </>
  );
}