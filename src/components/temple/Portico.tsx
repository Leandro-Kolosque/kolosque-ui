import Column from "./Column";

// Pórtico da Hero (os Propileus): duas colunas jônicas sob uma arquitrave.
// A arquitrave fica logo abaixo da navbar e as bases pousam na faixa de stack, que faz o papel de estilobato (o piso do templo).
// Só a partir de 1024px; abaixo disso a Hero fica livre.
export default function Portico() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-5 bottom-16 top-16 hidden text-ink/50 lg:block">
      <div className="absolute inset-x-0 top-0 h-[5px] border-y border-current" />
      <Column order="ionic" className="absolute bottom-0 left-0 top-[5px] w-[72px]" />
      <Column order="ionic" className="absolute bottom-0 right-0 top-[5px] w-[72px]" />
    </div>
  );
}
