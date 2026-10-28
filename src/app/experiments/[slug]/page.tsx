import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { experiments } from "@/data/components";
import DemoLoader from "@/components/experiments/DemoLoader";

type Props = { params: Promise<{ slug: string }> };

const demos = experiments.filter((e) => e.href === `/experiments/${e.id}`);

export const dynamicParams = false;

export function generateStaticParams() {
  return demos.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const name = demos.find((e) => e.id === slug)?.name;
  return { title: name ? `${name} — Kolosque UI` : "Experimento — Kolosque UI" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const demo = demos.find((e) => e.id === slug);
  if (!demo) notFound();
  const back =
    demo.demoTheme === "light"
      ? "border-black/15 bg-white/70 text-black hover:bg-white"
      : "border-white/20 bg-black/40 text-white hover:bg-white/10";

  return (
    <>
      <Link href="/#biblioteca" className={`fixed left-6 top-6 z-50 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium uppercase tracking-[1px] backdrop-blur transition ${back}`}>
        <ArrowLeft size={16} /> Voltar
      </Link>
      <DemoLoader slug={slug} />
    </>
  );
}