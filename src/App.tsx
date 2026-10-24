import { Suspense, lazy, useEffect, useState } from "react";
import type { FinishId, HandleId, ShapeId } from "./components/CeramicScene";
import { useI18n, type Lang } from "./i18n";
import { hasWebGL } from "./webgl";

const CeramicScene = lazy(() =>
  import("./components/CeramicScene").then((m) => ({ default: m.CeramicScene })),
);

const langs: Lang[] = ["es", "en"];

function App() {
  const { t, lang, setLang } = useI18n();
  const [finish, setFinish] = useState<FinishId>("sand");
  const [shape, setShape] = useState<ShapeId>("mug");
  const [handle, setHandle] = useState<HandleId>("round");
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

  useEffect(() => {
    if (shape === "bowl" && handle !== "none") setHandle("none");
  }, [shape, handle]);

  const handleDisabled = shape === "bowl";

  return (
    <div className="brasa">
      <header className="brasa-header">
        <a href="/" className="brasa-logo">
          <strong>{t.brand}</strong>
          <span>{t.tagline}</span>
        </a>
        <nav>
          <a href="#acabado">{t.nav.finish}</a>
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

      <section className="brasa-intro">
        <p className="kicker">{t.hero.kicker}</p>
        <h1>{t.hero.title}</h1>
        <p className="lead">{t.hero.lead}</p>
        {reduceMotion ? <p className="note">{t.reduced}</p> : null}
        {!webgl ? <p className="note">{t.fallback}</p> : null}
      </section>

      <section className="brasa-atelier" id="acabado">
        <div className="brasa-atelier-preview">
          <div className="brasa-canvas" aria-label={t.hero.drag}>
            {webgl ? (
              <Suspense fallback={<div className="canvas-fallback" />}>
                <CeramicScene
                  finish={finish}
                  shape={shape}
                  handle={handle}
                  reduceMotion={reduceMotion}
                />
              </Suspense>
            ) : (
              <div className={`canvas-fallback finish-${finish}`} />
            )}
          </div>
          <p className="drag-hint">{t.hero.drag}</p>
        </div>

        <div className="brasa-atelier-controls">
          <div className="build-block">
            <p className="kicker">{t.build.shape.label}</p>
            <div className="finish-grid">
              {t.build.shape.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    shape === item.id ? "finish-card is-active" : "finish-card"
                  }
                  onClick={() => setShape(item.id as ShapeId)}
                >
                  <span className={`glyph glyph-${item.id}`} aria-hidden />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`build-block${handleDisabled ? " is-disabled" : ""}`}>
            <p className="kicker">{t.build.handle.label}</p>
            <div className="finish-grid">
              {t.build.handle.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    handle === item.id ? "finish-card is-active" : "finish-card"
                  }
                  disabled={handleDisabled && item.id !== "none"}
                  onClick={() => setHandle(item.id as HandleId)}
                >
                  <span className={`glyph glyph-handle-${item.id}`} aria-hidden />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="build-block">
            <p className="kicker">{t.build.finish.label}</p>
            <div className="finish-grid">
              {t.build.finish.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    finish === item.id ? "finish-card is-active" : "finish-card"
                  }
                  onClick={() => setFinish(item.id as FinishId)}
                >
                  <span className={`swatch swatch-${item.id}`} aria-hidden />
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

      <section className="brasa-story" id="historia">
        <p className="kicker">{t.story.kicker}</p>
        <h2>{t.story.title}</h2>
        <p>{t.story.text}</p>
      </section>

      <footer className="brasa-footer">
        <p>{t.brand}</p>
        <p>Demo portfolio — m.d.b.</p>
      </footer>
    </div>
  );
}

export default App;
