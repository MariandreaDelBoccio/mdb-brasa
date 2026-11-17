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
  brand: "MERIDIAN",
  tagline: "Time, composed",
  nav: { configure: "Configure", story: "Story" },
  lang: { en: "EN", es: "ES" },
  hero: {
    kicker: "Product visualization",
    title: "Turn the watch.",
    lead: "A GLTF model with hotspots and a live configurator — case, strap, dial. The kind of product page a theme cannot fake.",
    drag: "Drag to orbit · tap a hotspot · configure beside",
  },
  build: {
    case: {
      label: "Case",
      items: [
        { id: "gold", name: "Gold", note: "Warm brushed metal." },
        { id: "steel", name: "Steel", note: "Cool polished alloy." },
        { id: "noir", name: "Noir", note: "Dark DLC finish." },
      ],
    },
    strap: {
      label: "Strap",
      items: [
        { id: "cognac", name: "Cognac", note: "Classic leather." },
        { id: "black", name: "Black", note: "Quiet evening." },
        { id: "navy", name: "Navy", note: "Deep indigo hide." },
      ],
    },
    dial: {
      label: "Dial",
      items: [
        { id: "ice", name: "Ice", note: "Pale blue-silver." },
        { id: "champagne", name: "Champagne", note: "Soft warm face." },
        { id: "noir", name: "Noir", note: "Night dial." },
      ],
    },
  },
  story: {
    kicker: "Why this demo",
    title: "GLTF. Hotspots. Configurator.",
    text: "A real glTF asset, named meshes, clickable hotspots, and materials that reconfigure without a page reload. Product visualization with weight — not a flat hero still.",
  },
  fallback: "3D preview unavailable — showing a still. Try another browser for WebGL.",
  reduced: "Motion reduced — drag and idle spin are off; hotspots and options still work.",
};

const es: typeof en = {
  brand: "MERIDIAN",
  tagline: "El tiempo, compuesto",
  nav: { configure: "Configurar", story: "Historia" },
  lang: { en: "EN", es: "ES" },
  hero: {
    kicker: "Visualización de producto",
    title: "Gira el reloj.",
    lead: "Un modelo GLTF con hotspots y configurador en vivo — caja, correa, esfera. La ficha de producto que un tema no puede fingir.",
    drag: "Arrastra para orbitar · toca un hotspot · configura al lado",
  },
  build: {
    case: {
      label: "Caja",
      items: [
        { id: "gold", name: "Oro", note: "Metal cepillado cálido." },
        { id: "steel", name: "Acero", note: "Aleación pulida fría." },
        { id: "noir", name: "Noir", note: "Acabado DLC oscuro." },
      ],
    },
    strap: {
      label: "Correa",
      items: [
        { id: "cognac", name: "Cognac", note: "Piel clásica." },
        { id: "black", name: "Negra", note: "Noche quieta." },
        { id: "navy", name: "Navy", note: "Índigo profundo." },
      ],
    },
    dial: {
      label: "Esfera",
      items: [
        { id: "ice", name: "Hielo", note: "Azul-plata pálido." },
        { id: "champagne", name: "Champagne", note: "Cara cálida suave." },
        { id: "noir", name: "Noir", note: "Esfera de noche." },
      ],
    },
  },
  story: {
    kicker: "Por qué esta demo",
    title: "GLTF. Hotspots. Configurador.",
    text: "Un asset glTF real, mallas con nombre, hotspots clicables y materiales que se reconfiguran sin recargar. Visualización de producto con peso — no un still plano de hero.",
  },
  fallback: "Vista 3D no disponible — imagen fija. Prueba otro navegador con WebGL.",
  reduced: "Movimiento reducido — sin arrastre ni giro idle; hotspots y opciones siguen activos.",
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
    const saved = localStorage.getItem("meridian-lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem("meridian-lang", next);
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
