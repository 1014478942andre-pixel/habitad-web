# Design — habitat.

Mundo visual: negro absoluto, calma de lanzamiento de producto, la máscara como objeto. Tipo Apple oscuro (pedido explícito del dueño, 2026-10-21).

## Color (`habitat/styles.css :root`)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#000` | Fondo de toda la página |
| `--tile` / `--tile-2` | `#111113` / `#1c1c1e` | Tarjetas, paneles, chips, botones redondos |
| `--field` | `#0a0a0b` | Campos de formulario |
| `--text` / `--text-2` / `--text-3` | `#f5f5f7` / `#a1a1a6` / `#7c7c82` | Principal, secundario, metadatos |
| `--acc` | `oklch(0.76 0.14 300)` | Morado sutil: enlaces, punto del logo, foco, chips Habitat+ |
| `--red` | `oklch(0.64 0.22 25)` | Solo 023. Dentro de `.z23-reveal`, `--acc` se reasigna a rojo |

Regla: el color nunca es fondo de sección; solo enlaces, estados y 023.

## Tipografía
Geist 300–700 (Google Fonts). Titulares 600, tracking -0.035em, máx. 72px (`.h2`); wordmark 96px máx., -0.04em. Cuerpo 17px / 1.5. Sin mayúsculas sostenidas, sin monoespaciada, sin etiquetas sobre titulares.

## Componentes
- Botón primario: píldora blanca, texto negro, 48px alto. `.btn-red` para 023.
- Enlace: morado con chevron SVG (`.link` + `.chev`).
- Tarjeta: `--tile`, radio 28px, imagen arriba a sangre (`.world`).
- Formulario: panel `--tile`, campos radio 12px, foco con anillo `--acc-soft`, error con borde rojo y mensaje en `.form-error`.
- Íconos: SVG propios de trazo 1.4–2px (candado, chevron, check). Nada de emojis o glifos.

## Movimiento
Un momento por zona: la máscara entra con desenfoque y se aleja al hacer scroll; la frase del manifiesto se enciende palabra a palabra; las tarjetas suben una vez. Todo se desactiva con `prefers-reduced-motion`. El contenido es visible sin JS (`.js` controla los estados iniciales).

## Espaciado
`--space` clamp(112–200px) entre secciones; contenedor 1080px; gutter clamp(20–48px).
