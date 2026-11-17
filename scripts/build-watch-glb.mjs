/**
 * Builds the MERIDIAN wristwatch (face toward +Z, 12 o'clock toward +Y)
 * and exports public/models/meridian-watch.glb with named nodes/materials.
 * Textures (dial, leather grain) are generated at runtime in the browser.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer()).then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      });
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/models");
const outFile = path.join(outDir, "meridian-watch.glb");

const M = {
  case: new T.MeshStandardMaterial({
    name: "CaseMetal",
    color: "#c4a574",
    metalness: 1,
    roughness: 0.22,
  }),
  polished: new T.MeshStandardMaterial({
    name: "BezelMetal",
    color: "#c4a574",
    metalness: 1,
    roughness: 0.1,
  }),
  dial: new T.MeshStandardMaterial({
    name: "DialFace",
    color: "#ffffff",
    metalness: 0.2,
    roughness: 0.4,
  }),
  hands: new T.MeshStandardMaterial({
    name: "HandsMetal",
    color: "#c4a574",
    metalness: 1,
    roughness: 0.15,
  }),
  index: new T.MeshStandardMaterial({
    name: "IndexMetal",
    color: "#c4a574",
    metalness: 1,
    roughness: 0.12,
  }),
  strap: new T.MeshStandardMaterial({
    name: "StrapLeather",
    color: "#5c4030",
    metalness: 0,
    roughness: 0.62,
  }),
  stitch: new T.MeshStandardMaterial({
    name: "StrapStitch",
    color: "#d8c9a8",
    metalness: 0,
    roughness: 0.8,
  }),
  crystal: new T.MeshPhysicalMaterial({
    name: "CrystalGlass",
    color: "#ffffff",
    metalness: 0,
    roughness: 0,
    transparent: true,
    opacity: 0.14,
    clearcoat: 1,
  }),
};

function mesh(name, geo, mat, pos) {
  const m = new T.Mesh(geo, mat);
  m.name = name;
  if (pos) m.position.set(...pos);
  return m;
}

/** Lathe around local Z (profile = [radius, z]). */
function latheZ(points, seg = 128) {
  const g = new T.LatheGeometry(points.map(([r, z]) => new T.Vector2(r, z)), seg);
  g.rotateX(Math.PI / 2);
  return g;
}

function buildCase() {
  const profile = [
    [0, -0.05],
    [0.1, -0.05],
    [0.16, -0.048],
    [0.185, -0.04],
    [0.197, -0.025],
    [0.2, -0.01],
    [0.2, 0.03],
    [0.198, 0.04],
    [0.19, 0.047],
    [0.178, 0.0505],
    [0.168, 0.05],
    [0.162, 0.044],
    [0.16, 0.02],
    [0, 0.02],
  ];
  return mesh("Case", latheZ(profile), M.case);
}

function lugGeometry(sign) {
  const s = new T.Shape();
  s.moveTo(0.14, 0.034);
  s.bezierCurveTo(0.24, 0.036, 0.3, 0.02, 0.322, -0.018);
  s.lineTo(0.31, -0.034);
  s.bezierCurveTo(0.28, -0.012, 0.22, -0.036, 0.14, -0.04);
  s.closePath();
  const d = 0.024;
  const g = new T.ExtrudeGeometry(s, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 3,
    curveSegments: 32,
  });
  g.translate(0, 0, -d / 2);
  // (a,b,c) -> (X=c, Y=a, Z=b)
  g.applyMatrix4(new T.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  if (sign < 0) g.rotateZ(Math.PI);
  return g;
}

function buildLugs() {
  const group = new T.Group();
  group.name = "Lugs";
  const up = lugGeometry(1);
  const down = lugGeometry(-1);
  for (const x of [-0.104, 0.104]) {
    group.add(mesh(`LugUp${x > 0 ? "R" : "L"}`, up.clone().translate(x, 0, 0), M.case));
    group.add(mesh(`LugDown${x > 0 ? "R" : "L"}`, down.clone().translate(x, 0, 0), M.case));
  }
  return group;
}

function buildCrown() {
  const group = new T.Group();
  group.name = "CrownGroup";
  const teeth = 28;
  const shape = new T.Shape();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.03 : 0.0255;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const d = 0.034;
  const g = new T.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  g.translate(0, 0, -d / 2);
  g.rotateY(Math.PI / 2);
  group.add(mesh("Crown", g.translate(0.225, 0, 0.002), M.case));
  const stem = new T.CylinderGeometry(0.014, 0.014, 0.03, 20);
  stem.rotateZ(Math.PI / 2);
  group.add(mesh("CrownStem", stem.translate(0.205, 0, 0.002), M.case));
  return group;
}

function buildBezel() {
  const g = new T.TorusGeometry(0.173, 0.0055, 16, 128);
  return mesh("Bezel", g, M.polished, [0, 0, 0.0485]);
}

function buildDial() {
  const group = new T.Group();
  group.name = "DialGroup";
  const face = new T.CircleGeometry(0.162, 128);
  group.add(mesh("Dial", face, M.dial, [0, 0, 0.0245]));

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    const len = big ? 0.034 : 0.026;
    const wid = big ? 0.011 : 0.0075;
    const geo = new T.BoxGeometry(wid, len, 0.006);
    const bar = mesh(`Index${i}`, geo, M.index);
    const rad = 0.128;
    bar.position.set(Math.sin(a) * rad, Math.cos(a) * rad, 0.028);
    bar.rotation.z = -a;
    // skip 6 o'clock (sub-dial lives there)
    if (i === 6) continue;
    group.add(bar);
  }
  return group;
}

function handShape(len, tail, wBase, wMid) {
  const s = new T.Shape();
  s.moveTo(0, -tail);
  s.lineTo(-wBase, 0);
  s.lineTo(-wMid, len * 0.55);
  s.lineTo(0, len);
  s.lineTo(wMid, len * 0.55);
  s.lineTo(wBase, 0);
  s.closePath();
  return s;
}

function handMesh(name, shape, z, depth = 0.004) {
  const g = new T.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.0012,
    bevelSize: 0.0012,
    bevelSegments: 1,
  });
  const holder = new T.Group();
  holder.name = name;
  holder.position.z = z;
  holder.add(mesh(`${name}Mesh`, g, M.hands));
  return holder;
}

function buildHands() {
  const group = new T.Group();
  group.name = "Hands";

  const hour = handMesh("HandHour", handShape(0.092, 0.02, 0.011, 0.0075), 0.034);
  hour.rotation.z = -((10 + 10 / 60) / 12) * Math.PI * 2;
  const minute = handMesh("HandMinute", handShape(0.142, 0.024, 0.0075, 0.0055), 0.041);
  minute.rotation.z = -(10 / 60) * Math.PI * 2;

  const sec = new T.Group();
  sec.name = "HandSecond";
  sec.position.z = 0.0485;
  const stem = new T.BoxGeometry(0.0022, 0.16, 0.0018);
  stem.translate(0, 0.045, 0);
  sec.add(mesh("HandSecondStem", stem, M.hands));
  const counter = new T.BoxGeometry(0.006, 0.04, 0.0018);
  counter.translate(0, -0.03, 0);
  sec.add(mesh("HandSecondTail", counter, M.hands));
  const lume = new T.CircleGeometry(0.007, 24);
  sec.add(mesh("HandSecondDot", lume, M.hands, [0, 0.1, 0.001]));
  sec.rotation.z = -(32 / 60) * Math.PI * 2;

  const cap = new T.CylinderGeometry(0.0115, 0.0115, 0.016, 28);
  cap.rotateX(Math.PI / 2);
  const capMesh = mesh("HandPivot", cap, M.polished, [0, 0, 0.049]);

  group.add(hour, minute, sec, capMesh);
  return group;
}

function buildCrystal() {
  const pts = [];
  const edge = 0.163;
  for (let i = 0; i <= 12; i++) {
    const r = edge * (1 - i / 12);
    const z = 0.068 - 0.022 * Math.pow(r / edge, 2);
    pts.push([r, z]);
  }
  return mesh("Crystal", latheZ(pts, 96), M.crystal);
}

function buildStrap() {
  const group = new T.Group();
  group.name = "StrapGroup";
  const pts2 = [
    [0, -0.07],
    [0.18, -0.065],
    [0.31, -0.052],
    [0.4, -0.09],
    [0.455, -0.2],
    [0.46, -0.35],
    [0.385, -0.5],
    [0.2, -0.6],
    [0, -0.63],
    [-0.2, -0.6],
    [-0.385, -0.5],
    [-0.46, -0.35],
    [-0.455, -0.2],
    [-0.4, -0.09],
    [-0.31, -0.052],
    [-0.18, -0.065],
  ];
  const curve = new T.CatmullRomCurve3(
    pts2.map(([y, z]) => new T.Vector3(0, y, z)),
    true,
    "centripetal",
  );

  const N = 420;
  const w = 0.18;
  const th = 0.028;
  const e = 0.009;
  const section = [
    [-w / 2 + e, th / 2],
    [w / 2 - e, th / 2],
    [w / 2, th / 2 - e],
    [w / 2, -th / 2 + e],
    [w / 2 - e, -th / 2],
    [-w / 2 + e, -th / 2],
    [-w / 2, -th / 2 + e],
    [-w / 2, th / 2 - e],
  ];
  const K = section.length;
  const positions = [];
  const uvs = [];
  const indices = [];
  const outer = [];

  for (let i = 0; i < N; i++) {
    const t = i / N;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const n = new T.Vector3(0, -tan.z, tan.y).normalize();
    outer.push({ p: p.clone(), n: n.clone() });
    for (let j = 0; j < K; j++) {
      const [sx, off] = section[j];
      positions.push(sx, p.y + n.y * off, p.z + n.z * off);
      uvs.push((sx + w / 2) / w, t * 14);
    }
  }

  const addQuads = (flip) => {
    indices.length = 0;
    for (let i = 0; i < N; i++) {
      const i2 = (i + 1) % N;
      for (let j = 0; j < K; j++) {
        const j2 = (j + 1) % K;
        const a = i * K + j;
        const b = i2 * K + j;
        const c = i2 * K + j2;
        const d = i * K + j2;
        if (flip) indices.push(a, c, b, a, d, c);
        else indices.push(a, b, c, a, c, d);
      }
    }
  };

  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
  addQuads(false);
  g.setIndex(indices);
  g.computeVertexNormals();
  // verify top-face normal at ring 0 points outward (+Z at top of loop)
  const nz = g.attributes.normal.getZ(1);
  if (nz < 0) {
    addQuads(true);
    g.setIndex(indices);
    g.computeVertexNormals();
  }
  group.add(mesh("Strap", g, M.strap));

  // stitching along both edges (outer face)
  for (const sx of [-0.072, 0.072]) {
    const pts = outer.map(({ p, n }) => new T.Vector3(sx, p.y + n.y * (th / 2 + 0.0012), p.z + n.z * (th / 2 + 0.0012)));
    const c = new T.CatmullRomCurve3(pts, true);
    const tube = new T.TubeGeometry(c, 520, 0.0024, 6, true);
    group.add(mesh(`Stitch${sx > 0 ? "R" : "L"}`, tube, M.stitch));
  }

  // buckle frame at the bottom of the loop (outer side, normal -Z)
  const outerS = new T.Shape();
  outerS.moveTo(-0.11, -0.045);
  outerS.lineTo(0.11, -0.045);
  outerS.lineTo(0.11, 0.045);
  outerS.lineTo(-0.11, 0.045);
  outerS.closePath();
  const hole = new T.Path();
  hole.moveTo(-0.088, -0.028);
  hole.lineTo(0.088, -0.028);
  hole.lineTo(0.088, 0.028);
  hole.lineTo(-0.088, 0.028);
  hole.closePath();
  outerS.holes.push(hole);
  const bg = new T.ExtrudeGeometry(outerS, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  });
  group.add(mesh("Buckle", bg.translate(0, 0, -0.63 - th / 2 - 0.016), M.case));
  const pin = new T.CylinderGeometry(0.0035, 0.0035, 0.2, 12);
  pin.rotateZ(Math.PI / 2);
  group.add(mesh("BucklePin", pin, M.case, [0, 0.0, -0.63 - th / 2 - 0.012]));

  return group;
}

function buildWatch() {
  const root = new T.Group();
  root.name = "MeridianWatch";
  root.add(buildCase(), buildBezel(), buildLugs(), buildCrown(), buildDial(), buildHands(), buildCrystal(), buildStrap());

  for (const [name, pos] of [
    ["HotspotCase", [0.2, 0.09, 0.04]],
    ["HotspotDial", [0, 0.0, 0.07]],
    ["HotspotStrap", [0.06, -0.34, -0.12]],
    ["HotspotCrown", [0.26, 0, 0.01]],
  ]) {
    const a = new T.Object3D();
    a.name = name;
    a.position.set(...pos);
    root.add(a);
  }
  return root;
}

fs.mkdirSync(outDir, { recursive: true });
const scene = buildWatch();

new GLTFExporter().parse(
  scene,
  (result) => {
    const buffer = Buffer.from(result);
    fs.writeFileSync(outFile, buffer);
    console.log(`Wrote ${outFile} (${(buffer.length / 1024).toFixed(1)} KB)`);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
  { binary: true },
);
