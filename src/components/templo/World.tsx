import WorldLoader from "./WorldLoader";

// O mundo atrás dos capítulos. O fundo em CSS (céu, lua e névoa) aparece primeiro e fica como reserva
// sem WebGL; quando o santuário em WebGL fica pronto, ele aparece por cima em fade (classe is-live).
export default function World() {
  return (
    <div aria-hidden className="t-world">
      <span className="t-moon" />
      <span className="t-haze" />
      <WorldLoader />
    </div>
  );
}
