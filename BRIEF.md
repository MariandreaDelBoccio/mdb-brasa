# MERIDIAN

Marca ficticia de relojería. Pieza 06: product visualization 3D.

> Carpeta / repo histórico: `06-brasa` / `mdb-brasa` (base path de Pages).

## Promesa

Tiempo compuesto. Un reloj que se orbita, se inspecciona y se configura.

## Flujo

`Home (reloj GLTF) → hotspot → configurar caja / correa / esfera`

## Qué demuestra

Modelo **glTF** (`useGLTF`), hotspots HTML anclados a nodos, configurador de materiales en vivo, órbita con PresentationControls, fallback sin WebGL, `prefers-reduced-motion`.

## Paleta

| Nombre | Hex | Uso |
| --- | --- | --- |
| Ink | `#0c0b0a` | Fondo |
| Ivory | `#f3efe6` | Texto |
| Gold | `#c4a574` | Acento / metal |
| Mute | `#8a8178` | Secundario |

## Tipografía

- Display: Cormorant Garamond
- Sans: Outfit

## Caso de estudio

### Problema
Las fichas de reloj en plantilla son fotos estáticas. No dejan inspeccionar ni configurar.

### Decisión de diseño
Un reloj en pedestal de joyería. Hotspots cuentan el detalle; el configurador cambia metal, correa y esfera.

### Decisión técnica
Asset GLB con mallas nombradas; `useGLTF` + override de materiales; Html hotspots de drei; detector WebGL.

### Por qué una plantilla no puede
Shopify y temas no entregan GLTF con hotspots y materiales reconfigurables a medida.

### Métricas objetivo
GLB < 250 KB; primer paint usable < 2.5 s en móvil mid-range; fallback inmediato sin WebGL.
