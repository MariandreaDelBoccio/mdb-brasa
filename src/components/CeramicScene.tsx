import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, PresentationControls } from "@react-three/drei";
import { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";

export type FinishId = "sand" | "char" | "ember";
export type ShapeId = "mug" | "tumbler" | "bowl";
export type HandleId = "round" | "square" | "none";

const FINISH: Record<
  FinishId,
  { color: string; roughness: number; metalness: number; clearcoat: number }
> = {
  sand: {
    color: "#efe2cf",
    roughness: 0.55,
    metalness: 0.02,
    clearcoat: 0.15,
  },
  char: {
    color: "#2c2622",
    roughness: 0.4,
    metalness: 0.08,
    clearcoat: 0.35,
  },
  ember: {
    color: "#c45c3a",
    roughness: 0.32,
    metalness: 0.06,
    clearcoat: 0.55,
  },
};

function profileFor(shape: ShapeId): THREE.Vector2[] {
  if (shape === "tumbler") {
    return [
      new THREE.Vector2(0.28, 0),
      new THREE.Vector2(0.34, 0.04),
      new THREE.Vector2(0.38, 0.2),
      new THREE.Vector2(0.42, 0.7),
      new THREE.Vector2(0.44, 1.15),
      new THREE.Vector2(0.43, 1.32),
    ];
  }
  if (shape === "bowl") {
    return [
      new THREE.Vector2(0.12, 0),
      new THREE.Vector2(0.32, 0.04),
      new THREE.Vector2(0.55, 0.22),
      new THREE.Vector2(0.68, 0.48),
      new THREE.Vector2(0.7, 0.62),
      new THREE.Vector2(0.66, 0.72),
    ];
  }
  // mug
  return [
    new THREE.Vector2(0.22, 0),
    new THREE.Vector2(0.36, 0.04),
    new THREE.Vector2(0.42, 0.18),
    new THREE.Vector2(0.48, 0.55),
    new THREE.Vector2(0.5, 0.95),
    new THREE.Vector2(0.48, 1.18),
    new THREE.Vector2(0.46, 1.28),
  ];
}

function handleCurveFor(shape: ShapeId, handle: HandleId): THREE.CatmullRomCurve3 | null {
  if (handle === "none" || shape === "bowl") return null;

  const rimY = shape === "tumbler" ? 1.05 : 0.95;
  const midY = shape === "tumbler" ? 0.75 : 0.7;
  const lowY = shape === "tumbler" ? 0.42 : 0.32;
  const attach = shape === "tumbler" ? 0.42 : 0.48;

  if (handle === "square") {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(attach, rimY, 0),
      new THREE.Vector3(0.78, rimY, 0),
      new THREE.Vector3(0.8, midY, 0),
      new THREE.Vector3(0.78, lowY, 0),
      new THREE.Vector3(attach + 0.04, lowY, 0),
    ]);
  }

  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(attach, rimY, 0),
    new THREE.Vector3(0.72, rimY + 0.03, 0),
    new THREE.Vector3(0.82, midY, 0),
    new THREE.Vector3(0.78, lowY + 0.06, 0),
    new THREE.Vector3(attach + 0.04, lowY, 0),
  ]);
}

function CeramicPiece({
  finish,
  shape,
  handle,
}: {
  finish: FinishId;
  shape: ShapeId;
  handle: HandleId;
}) {
  const mat = useMemo(() => FINISH[finish], [finish]);
  const points = useMemo(() => profileFor(shape), [shape]);
  const geo = useMemo(() => new THREE.LatheGeometry(points, 64), [points]);
  const mesh = useRef<THREE.Mesh>(null);

  const curve = useMemo(
    () => handleCurveFor(shape, handle),
    [shape, handle],
  );
  const handleGeo = useMemo(
    () => (curve ? new THREE.TubeGeometry(curve, 48, handle === "square" ? 0.048 : 0.055, 16, false) : null),
    [curve, handle],
  );

  const rimY = points[points.length - 1].y;
  const rimR = points[points.length - 1].x;
  const footR = Math.max(0.22, points[1]?.x ?? 0.3);
  const yOffset = shape === "bowl" ? -0.28 : -0.55;
  const cavityH = shape === "bowl" ? 0.48 : shape === "tumbler" ? 1.05 : 1.05;
  const cavityY = shape === "bowl" ? 0.38 : 0.68;
  const cavityR = rimR * (shape === "bowl" ? 0.88 : 0.86);

  useLayoutEffect(() => {
    geo.computeVertexNormals();
    handleGeo?.computeVertexNormals();
  }, [geo, handleGeo]);

  return (
    <group position={[0, yOffset, 0]}>
      <mesh ref={mesh} geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={mat.color}
          roughness={mat.roughness}
          metalness={mat.metalness}
          clearcoat={mat.clearcoat}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <mesh position={[0, cavityY, 0]}>
        <cylinderGeometry
          args={[cavityR * 0.95, cavityR * 0.88, cavityH, 48, 1, true]}
        />
        <meshStandardMaterial
          color={mat.color}
          roughness={Math.min(1, mat.roughness + 0.2)}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh position={[0, rimY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rimR, shape === "bowl" ? 0.022 : 0.028, 12, 48]} />
        <meshPhysicalMaterial
          color={mat.color}
          roughness={mat.roughness}
          metalness={mat.metalness}
          clearcoat={mat.clearcoat}
        />
      </mesh>

      {handleGeo ? (
        <mesh geometry={handleGeo} castShadow>
          <meshPhysicalMaterial
            color={mat.color}
            roughness={mat.roughness}
            metalness={mat.metalness}
            clearcoat={mat.clearcoat}
            clearcoatRoughness={0.4}
          />
        </mesh>
      ) : null}

      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[footR * 0.85, footR * 0.9, 0.05, 48]} />
        <meshStandardMaterial
          color={mat.color}
          roughness={mat.roughness + 0.1}
          metalness={mat.metalness}
        />
      </mesh>
    </group>
  );
}

type Props = {
  finish: FinishId;
  shape: ShapeId;
  handle: HandleId;
  reduceMotion: boolean;
};

export function CeramicScene({ finish, shape, handle, reduceMotion }: Props) {
  const yShadow = shape === "bowl" ? -0.28 : -0.55;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [2.2, 1.2, 2.9], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#1a1612"]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.2}
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[-2.5, 3.5, 2]} intensity={0.55} color="#ffd0b0" />

      {reduceMotion ? (
        <CeramicPiece finish={finish} shape={shape} handle={handle} />
      ) : (
        <PresentationControls
          global
          cursor
          speed={1.35}
          zoom={0.9}
          polar={[-0.25, 0.5]}
          azimuth={[-Math.PI, Math.PI]}
        >
          <CeramicPiece finish={finish} shape={shape} handle={handle} />
        </PresentationControls>
      )}

      <ContactShadows position={[0, yShadow, 0]} opacity={0.48} scale={8} blur={2.5} />
      <Environment preset="warehouse" />
    </Canvas>
  );
}
