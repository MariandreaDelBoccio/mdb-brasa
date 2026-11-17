import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

export type CaseId = "gold" | "steel" | "noir";
export type StrapId = "cognac" | "black" | "navy";
export type DialId = "ice" | "champagne" | "noir";
export type HotspotId = "case" | "dial" | "strap" | "crown";

const MODEL = `${import.meta.env.BASE_URL}models/meridian-watch.glb?v=2`.replace(
  /([^:]\/)\/+/g,
  "$1",
);

const CASE: Record<CaseId, { color: string; rough: number; hands: string }> = {
  gold: { color: "#d4af6a", rough: 0.2, hands: "#d4af6a" },
  steel: { color: "#cfd4dc", rough: 0.14, hands: "#cfd4dc" },
  noir: { color: "#3a3a3d", rough: 0.24, hands: "#cfc8b8" },
};

const STRAP: Record<StrapId, string> = {
  cognac: "#6b4630",
  black: "#1c1816",
  navy: "#1f2d44",
};

const DIAL: Record<
  DialId,
  { base: string; edge: string; ink: string; ray: string }
> = {
  ice: { base: "#d7e2ec", edge: "#9fb2c4", ink: "#1a1f26", ray: "255,255,255" },
  champagne: { base: "#ead9b8", edge: "#b99a68", ink: "#2a2118", ray: "255,248,230" },
  noir: { base: "#16181d", edge: "#07080a", ink: "#d9d2c3", ray: "255,255,255" },
};

const HOTSPOTS: {
  id: HotspotId;
  anchor: string;
  side: "left" | "right";
  title: { en: string; es: string };
  body: { en: string; es: string };
}[] = [
  {
    id: "case",
    anchor: "HotspotCase",
    side: "right",
    title: { en: "Case", es: "Caja" },
    body: {
      en: "38 mm lathe-turned case with polished bezel and sculpted lugs.",
      es: "Caja torneada de 38 mm con bisel pulido y cuernos esculpidos.",
    },
  },
  {
    id: "dial",
    anchor: "HotspotDial",
    side: "right",
    title: { en: "Dial", es: "Esfera" },
    body: {
      en: "Sunburst finish, applied indices and a small-seconds sub-dial.",
      es: "Acabado sunburst, índices aplicados y subesfera de segundos.",
    },
  },
  {
    id: "strap",
    anchor: "HotspotStrap",
    side: "right",
    title: { en: "Strap", es: "Correa" },
    body: {
      en: "Full-grain leather with contrast stitching and a pin buckle.",
      es: "Piel plena flor con costura al tono y hebilla de pin.",
    },
  },
  {
    id: "crown",
    anchor: "HotspotCrown",
    side: "left",
    title: { en: "Crown", es: "Corona" },
    body: {
      en: "Fluted crown — wind it, set it, feel the grip.",
      es: "Corona estriada — dar cuerda, ajustar, sentir el agarre.",
    },
  },
];

type Lang = "en" | "es";

type Props = {
  caseId: CaseId;
  strapId: StrapId;
  dialId: DialId;
  hotspot: HotspotId | null;
  onHotspot: (id: HotspotId | null) => void;
  lang: Lang;
  reduceMotion: boolean;
};

/** Sunburst dial with printed track, brand and small-seconds sub-dial. */
function makeDialTexture(id: DialId) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  const d = DIAL[id];
  const S = 1024;
  const cx = S / 2;

  const base = g.createRadialGradient(cx, cx, 40, cx, cx, cx);
  base.addColorStop(0, d.base);
  base.addColorStop(1, d.edge);
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);

  // sunburst rays
  g.save();
  g.translate(cx, cx);
  for (let i = 0; i < 720; i++) {
    const a = (i / 720) * Math.PI * 2;
    g.strokeStyle = `rgba(${d.ray},${i % 2 ? 0.05 : 0.015})`;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
    g.lineTo(Math.cos(a) * cx, Math.sin(a) * cx);
    g.stroke();
  }
  g.restore();

  const ink = d.ink;

  // minute track
  g.save();
  g.translate(cx, cx);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    g.strokeStyle = ink;
    g.globalAlpha = major ? 0.9 : 0.55;
    g.lineWidth = major ? 3.2 : 1.6;
    const r1 = cx * 0.965;
    const r2 = cx * (major ? 0.915 : 0.935);
    g.beginPath();
    g.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
    g.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2);
    g.stroke();
  }
  g.restore();
  g.globalAlpha = 1;

  // brand
  g.fillStyle = ink;
  g.textAlign = "center";
  g.font = '500 54px "Cormorant Garamond", Georgia, serif';
  (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "14px";
  g.fillText("MERIDIAN", cx + 7, 330);
  g.font = '400 24px "Outfit", system-ui, sans-serif';
  (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "9px";
  g.globalAlpha = 0.75;
  g.fillText("AUTOMATIC", cx + 4, 372);
  g.globalAlpha = 1;

  // small seconds sub-dial at 6
  const sx = cx;
  const sy = 700;
  const sr = 118;
  g.fillStyle = "rgba(0,0,0,0.07)";
  g.beginPath();
  g.arc(sx, sy, sr, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = ink;
  g.globalAlpha = 0.5;
  g.lineWidth = 2;
  g.beginPath();
  g.arc(sx, sy, sr, 0, Math.PI * 2);
  g.stroke();
  for (let r = 22; r < sr; r += 14) {
    g.globalAlpha = 0.14;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(sx, sy, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 0.85;
  g.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = sr - 4;
    const r2 = sr - (major ? 18 : 10);
    g.beginPath();
    g.moveTo(sx + Math.sin(a) * r1, sy - Math.cos(a) * r1);
    g.lineTo(sx + Math.sin(a) * r2, sy - Math.cos(a) * r2);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.font = '400 22px "Outfit", system-ui, sans-serif';
  (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  g.fillText("60", sx, sy - sr + 44);
  g.fillText("30", sx, sy + sr - 30);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Fine leather grain used as bump map. */
function makeGrainTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 90 + Math.random() * 90;
    g.fillStyle = `rgb(${v},${v},${v})`;
    const r = 0.8 + Math.random() * 1.6;
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 18);
  return tex;
}

function WatchModel({
  caseId,
  strapId,
  dialId,
  hotspot,
  onHotspot,
  lang,
  reduceMotion,
  armHotspotClick,
}: Props & { armHotspotClick?: () => void }) {
  const { scene } = useGLTF(MODEL);

  const { clone, offset, bottom } = useMemo(() => {
    const c = scene.clone(true);
    // each clone gets its own materials so config never leaks between mounts
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = (m.material as THREE.Material).clone();
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    return {
      clone: c,
      offset: center.clone().multiplyScalar(-1),
      bottom: box.min.y - 0.002,
    };
  }, [scene]);

  const anchors = useMemo(() => {
    const map: Partial<Record<string, THREE.Object3D>> = {};
    clone.traverse((o) => {
      if (o.name.startsWith("Hotspot")) map[o.name] = o;
    });
    return map;
  }, [clone]);

  const dialTextures = useMemo(
    () => ({
      ice: makeDialTexture("ice"),
      champagne: makeDialTexture("champagne"),
      noir: makeDialTexture("noir"),
    }),
    [],
  );
  const grain = useMemo(() => makeGrainTexture(), []);

  const hands = useMemo(() => {
    const find = (n: string) => clone.getObjectByName(n) ?? null;
    return { h: find("HandHour"), m: find("HandMinute"), s: find("HandSecond") };
  }, [clone]);

  useEffect(() => {
    const cfg = CASE[caseId];
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      switch (mat.name) {
        case "CaseMetal":
        case "IndexMetal":
          mat.color.set(cfg.color);
          mat.roughness = cfg.rough;
          mat.metalness = 1;
          break;
        case "BezelMetal":
          mat.color.set(cfg.color);
          mat.roughness = Math.max(0.06, cfg.rough - 0.1);
          break;
        case "HandsMetal":
          mat.color.set(cfg.hands);
          mat.metalness = 0.8;
          mat.roughness = 0.3;
          mat.emissive.set(cfg.hands);
          mat.emissiveIntensity = dialId === "noir" ? 0.35 : 0.12;
          break;
        case "StrapLeather":
          mat.color.set(STRAP[strapId]);
          mat.bumpMap = grain;
          mat.bumpScale = 0.9;
          break;
        case "DialFace":
          mat.map = dialTextures[dialId];
          mat.color.set("#ffffff");
          break;
        default:
      }
      mat.needsUpdate = true;
    });
  }, [clone, caseId, strapId, dialId, dialTextures, grain]);

  // Hands follow real time (second hand ticks), frozen at 10:10 if reduced motion
  useFrame(() => {
    if (reduceMotion || !hands.h || !hands.m || !hands.s) return;
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const mi = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + mi / 60;
    hands.s.rotation.z = -(s / 60) * Math.PI * 2;
    hands.m.rotation.z = -(mi / 60) * Math.PI * 2;
    hands.h.rotation.z = -(h / 12) * Math.PI * 2;
  });

  return (
    <group position={offset}>
      <primitive object={clone} />

      {/* jewellery plinth under the strap loop (clone-local space) */}
      <group position={[0, bottom, -0.32]}>
        <mesh position={[0, -0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.56, 0.6, 0.06, 96]} />
          <meshStandardMaterial color="#131110" metalness={0.35} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.004, 12, 120]} />
          <meshStandardMaterial color="#c4a574" metalness={1} roughness={0.2} />
        </mesh>
      </group>

      {HOTSPOTS.map((h) => {
        const anchor = anchors[h.anchor];
        if (!anchor) return null;
        const active = hotspot === h.id;
        // Keep dial/case dots near the rim so the card sits clear of the face
        const pos = anchor.position.clone();
        if (h.id === "dial") pos.x += 0.18;
        if (h.id === "case") pos.x += 0.04;
        return (
          <Html
            key={h.id}
            position={pos}
            center
            distanceFactor={1.5}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: "auto" }}
          >
            <button
              type="button"
              className={[
                "hotspot",
                h.side === "left" ? "hotspot-card-left" : "",
                active ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-expanded={active}
              aria-label={h.title[lang]}
              onPointerDown={(e) => {
                e.stopPropagation();
                armHotspotClick?.();
              }}
              onClick={(e) => {
                e.stopPropagation();
                armHotspotClick?.();
                onHotspot(active ? null : h.id);
              }}
            >
              <span className="hotspot-dot" />
              {active ? (
                <span className="hotspot-card">
                  <strong>{h.title[lang]}</strong>
                  <small>{h.body[lang]}</small>
                </span>
              ) : null}
            </button>
          </Html>
        );
      })}
    </group>
  );
}

function AutoFrame({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.9, 0.6, 2.85);
    camera.lookAt(0, -0.04, -0.1);
  }, [camera]);
  return <group ref={ref}>{children}</group>;
}

function SlowSpin({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!enabled || !ref.current) return;
    ref.current.rotation.y += dt * 0.16;
  });
  return <group ref={ref}>{children}</group>;
}

export function WatchScene(props: Props) {
  const { hotspot, onHotspot, reduceMotion } = props;
  const ignoreMissUntil = useRef(0);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0.9, 0.6, 2.85], fov: 27 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => {
        // Html hotspots don't raycast as meshes; skip the miss that follows a UI click
        if (performance.now() < ignoreMissUntil.current) return;
        onHotspot(null);
      }}
    >
      <color attach="background" args={["#0a0908"]} />
      <ambientLight intensity={0.12} />
      <directionalLight
        castShadow
        position={[2.2, 3.6, 2.6]}
        intensity={1.1}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight position={[-2.4, 1.6, 2]} intensity={0.9} color="#ffe9c8" angle={0.5} penumbra={1} />

      <Suspense fallback={null}>
        <AutoFrame>
          {reduceMotion ? (
            <WatchModel
              {...props}
              armHotspotClick={() => {
                ignoreMissUntil.current = performance.now() + 250;
              }}
            />
          ) : (
            <PresentationControls
              global
              cursor
              speed={1.1}
              zoom={0.9}
              polar={[-0.25, 0.4]}
              azimuth={[-Math.PI, Math.PI]}
            >
              <SlowSpin enabled={!hotspot}>
                <WatchModel
                  {...props}
                  armHotspotClick={() => {
                    ignoreMissUntil.current = performance.now() + 250;
                  }}
                />
              </SlowSpin>
            </PresentationControls>
          )}
        </AutoFrame>
      </Suspense>

      <ContactShadows position={[0, -0.41, -0.3]} opacity={0.65} scale={2.4} blur={2.2} far={0.6} color="#000" />

      {/* studio softboxes — gives the metal something real to reflect */}
      <Environment resolution={512} environmentIntensity={1.5}>
        <Lightformer form="rect" intensity={5} position={[0, 4, 3]} rotation-x={-Math.PI / 3} scale={[8, 2.2, 1]} />
        <Lightformer form="rect" intensity={3.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2.4, 1]} />
        <Lightformer form="rect" intensity={3.2} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[6, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[0, 0.5, -5]} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={2.4} position={[0, 1, 5]} scale={3} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
