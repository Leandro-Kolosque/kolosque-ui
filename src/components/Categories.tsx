import { categories } from "@/data/categories";

export default function Categories() {
  return (
    <section id="categorias" className="border-y border-line py-26">
      <div className="wrap">
        <h2 className="h-display text-4xl tracking-[-2px] md:text-5xl">Categorias</h2>
        <p className="copy mt-4 text-muted">
          A coleção cresce por áreas, não em uma lista única.<br />
          Novas categorias entram direto no arquivo de dados.
        </p>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map(({ id, name, blurb, icon: Icon }) => (
            <li key={id} className="group">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-fg">
                <Icon size={24} />
              </span>
              <h3 className="mt-4 font-medium">{name}</h3>
              <p className="mt-2 text-base leading-6 text-muted">{blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
