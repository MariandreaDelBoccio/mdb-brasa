import { Suspense, lazy, useEffect, useState } from "react";
import type {
  CaseId,
  DialId,
  HotspotId,
  StrapId,
} from "./components/WatchScene";
import { useI18n, type Lang } from "./i18n";
import { hasWebGL } from "./webgl";

const WatchScene = lazy(() =>
  import("./components/WatchScene").then((m) => ({ default: m.WatchScene })),
);

const langs: Lang[] = ["es", "en"];

function App() {
  const { t, lang, setLang } = useI18n();
  const [caseId, setCaseId] = useState<CaseId>("gold");
  const [strapId, setStrapId] = useState<StrapId>("cognac");
  const [dialId, setDialId] = useState<DialId>("ice");
  const [hotspot, setHotspot] = useState<HotspotId | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="meridian">
      <header className="meridian-header">
        <a href={import.meta.env.BASE_URL} className="meridian-logo">
          <strong>{t.brand}</strong>
          <span>{t.tagline}</span>
        </a>
        <nav>
          <a href="#configurar">{t.nav.configure}</a>
          <a href="#historia">{t.nav.story}</a>
        </nav>
        <div className="lang-toggle" role="group">
          {langs.map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? "is-active" : undefined}
              onClick={() => setLang(code)}
            >
              {t.lang[code]}
            </button>
          ))}
        </div>
      </header>

      <section className="meridian-atelier" id="configurar">
        <div className="meridian-atelier-preview">
          <div className="meridian-canvas" aria-label={t.hero.drag}>
            {webgl ? (
              <Suspense fallback={<div className="canvas-fallback" />}>
                <WatchScene
                  caseId={caseId}
                  strapId={strapId}
                  dialId={dialId}
                  hotspot={hotspot}
                  onHotspot={setHotspot}
                  lang={lang}
                  reduceMotion={reduceMotion}
                />
              </Suspense>
            ) : (
              <div
                className={`canvas-fallback case-${caseId} strap-${strapId} dial-${dialId}`}
              />
            )}
          </div>
          <p className="drag-hint">{t.hero.drag}</p>
        </div>

        <div className="meridian-atelier-controls">
          <div className="meridian-intro">
            <p className="kicker">{t.hero.kicker}</p>
            <h1>{t.hero.title}</h1>
            <p className="lead">{t.hero.lead}</p>
            {reduceMotion ? <p className="note">{t.reduced}</p> : null}
            {!webgl ? <p className="note">{t.fallback}</p> : null}
          </div>

          <div className="build-block">
            <p className="kicker">{t.build.case.label}</p>
            <div className="finish-grid">
              {t.build.case.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    caseId === item.id ? "finish-card is-active" : "finish-card"
                  }
                  onClick={() => {
                    setCaseId(item.id as CaseId);
                    setHotspot("case");
                  }}
                >
                  <span className={`swatch swatch-case-${item.id}`} aria-hidden />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="build-block">
            <p className="kicker">{t.build.strap.label}</p>
            <div className="finish-grid">
              {t.build.strap.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    strapId === item.id ? "finish-card is-active" : "finish-card"
                  }
                  onClick={() => {
                    setStrapId(item.id as StrapId);
                    setHotspot("strap");
                  }}
                >
                  <span className={`swatch swatch-strap-${item.id}`} aria-hidden />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="build-block">
            <p className="kicker">{t.build.dial.label}</p>
            <div className="finish-grid">
              {t.build.dial.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    dialId === item.id ? "finish-card is-active" : "finish-card"
                  }
                  onClick={() => {
                    setDialId(item.id as DialId);
                    setHotspot("dial");
                  }}
                >
                  <span className={`swatch swatch-dial-${item.id}`} aria-hidden />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="meridian-story" id="historia">
        <p className="kicker">{t.story.kicker}</p>
        <h2>{t.story.title}</h2>
        <p>{t.story.text}</p>
      </section>

      <footer className="meridian-footer">
        <p>{t.brand}</p>
        <p>Demo portfolio — AUREA</p>
      </footer>
    </div>
  );
}

export default App;
