# BRASA

Marca ficticia de cerámica. Pieza 06: 3D ligero.

## Promesa

Barro, fuego y un esmalte que se elige. Objetos quietos para mesas lentas.

## Flujo

`Home (taza 3D arrastrable) → elegir esmalte → CTA`

## Qué demuestra

Taza procedural en Three.js / react-three-fiber (`LatheGeometry` + asa), rotación con ratón/touch, cambio de esmalte, fallback sin WebGL.

## Paleta

| Nombre | Hex | Uso |
| --- | --- | --- |
| Char | `#1a1612` | Fondo |
| Ember | `#c45c3a` | Acento / esmalte |
| Wax | `#f2e6d4` | Superficies claras |
| Smoke | `#8a8074` | Texto secundario |

## Tipografía

- Display: Fraunces
- Sans: DM Sans

## Caso de estudio

### Problema
Las fichas de producto de objetos en plantilla son fotos estáticas. No transmiten material ni peso.

### Decisión de diseño
Una sola taza en escena. El usuario la gira; el esmalte cambia el material en vivo.

### Decisión técnica
react-three-fiber + `LatheGeometry` (sin GLB pesado); detector WebGL con fallback; `prefers-reduced-motion` desactiva el drag.

### Por qué una plantilla no puede
Shopify y temas no entregan un producto 3D con rotación al arrastrar y materiales interactivos a medida.

### Métricas objetivo
Primer paint usable < 2.5 s en móvil mid-range; fallback inmediato si no hay WebGL.
