import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

const en = {
  brand: "BRASA",
  tagline: "Clay for slow tables",
  nav: { finish: "Build", story: "Story", bag: "Bag" },
  lang: { en: "EN", es: "ES" },
  hero: {
    kicker: "Ceramic atelier",
    title: "Turn the cup.",
    lead: "Drag to spin. Pick a form, a handle, a glaze. A product page a theme cannot fake.",
    cta: "Build yours",
    drag: "Drag to rotate · options stay beside",
  },
  build: {
    shape: {
      label: "Form",
      items: [
        { id: "mug", name: "Mug", note: "Classic belly, morning ritual." },
        { id: "tumbler", name: "Tumbler", note: "Tall, straight, no fuss." },
        { id: "bowl", name: "Bowl", note: "Wide open, handleless." },
      ],
    },
    handle: {
      label: "Handle",
      items: [
        { id: "round", name: "Round", note: "Soft curve, easy grip." },
        { id: "square", name: "Square", note: "Architectural edge." },
        { id: "none", name: "None", note: "Clean silhouette." },
      ],
    },
    finish: {
      label: "Glaze",
      items: [
        { id: "sand", name: "Sand matte", note: "Warm clay, soft skin." },
        { id: "char", name: "Char glaze", note: "Deep smoke, quiet shine." },
        { id: "ember", name: "Ember glaze", note: "Terracotta with clear coat." },
      ],
    },
  },
  story: {
    kicker: "Material",
    title: "Clay, fire, glaze.",
    text: "A procedural piece — light enough for a phone, tactile enough to feel thrown. Change the form. Change the handle. Change the glaze.",
  },
  fallback: "3D preview unavailable — showing a still. Try another browser for WebGL.",
  reduced: "Motion reduced — drag is off; options still change the clay.",
};

const es: typeof en = {
  brand: "BRASA",
  tagline: "Barro para mesas lentas",
  nav: { finish: "Crear", story: "Historia", bag: "Bolsa" },
  lang: { en: "EN", es: "ES" },
  hero: {
    kicker: "Atelier de cerámica",
    title: "Gira la taza.",
    lead: "Arrastra para girar. Elige forma, asa y esmalte. Una ficha que un tema no puede fingir.",
    cta: "Crear la tuya",
    drag: "Arrastra para girar · las opciones van al lado",
  },
  build: {
    shape: {
      label: "Forma",
      items: [
        { id: "mug", name: "Taza", note: "Panza clásica, ritual de mañana." },
        { id: "tumbler", name: "Vaso", note: "Alto, recto, sin adorno." },
        { id: "bowl", name: "Bol", note: "Abierto, sin asa." },
      ],
    },
    handle: {
      label: "Asa",
      items: [
        { id: "round", name: "Redonda", note: "Curva suave, agarre fácil." },
        { id: "square", name: "Cuadrada", note: "Arista arquitectónica." },
        { id: "none", name: "Sin asa", note: "Silueta limpia." },
      ],
    },
    finish: {
      label: "Esmalte",
      items: [
        { id: "sand", name: "Arena mate", note: "Barro cálido, piel suave." },
        { id: "char", name: "Esmalte carbón", note: "Humo profundo, brillo quieto." },
        { id: "ember", name: "Esmalte brasa", note: "Terracota con barniz." },
      ],
    },
  },
  story: {
    kicker: "Material",
    title: "Barro, fuego, esmalte.",
    text: "Una pieza procedural — ligera para el móvil, táctil como si estuviera torneada. Cambia la forma. Cambia el asa. Cambia el esmalte.",
  },
  fallback: "Vista 3D no disponible — imagen fija. Prueba otro navegador con WebGL.",
  reduced: "Movimiento reducido — sin arrastre; las opciones siguen cambiando el barro.",
};

const dicts = { en, es };

type I18nValue = {
  lang: Lang;
  t: typeof en;
  setLang: (lang: Lang) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("brasa-lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem("brasa-lang", next);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, t: dicts[lang], setLang }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
