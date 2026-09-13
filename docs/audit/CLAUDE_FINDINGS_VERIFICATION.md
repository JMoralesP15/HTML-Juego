# Verificación de hallazgos externos

| Hallazgo | Estado | Evidencia / matiz |
|---|---|---|
| Capas `game-v11/archive-night/atlas-v12/v1.3–v1.8` superpuestas | CONFIRMADO | El orden real de `index.html` carga varias generaciones activas. |
| `racha` vs `ritmo` | CONFIRMADO | `game.js` y `archive-night.js` declaran `refreshHeader()` con copy distinto; gana la definición posterior. |
| Sonido + Ambiente simultáneos | PARCIAL | v1.4 instala `ambientToggle`, v1.5 lo reubica a Ajustes. La duplicidad lógica existe aunque la UI final no muestre siempre dos botones. |
| CSS acumulado | CONFIRMADO | 5 hojas activas; `experience-v17.css` contiene secciones v1.3–v1.6. |
| Unicode en navegación | CONFIRMADO | `index.html` usa ◉ ↺ ↔ ▦ ▥. Es deuda de identidad, no bug funcional. |
| Feedback con propiedad múltiple | CONFIRMADO | Atlas crea feedback; v1.5 simplifica; v1.6 vuelve a estructurar aprendizaje; v1.8 instala media. |
| Snapshots se regeneran en cada CI | CONFIRMADO | `qa.yml` ejecuta `qa:regression -- --update-snapshots`. |

No se corrige ninguno de estos puntos en esta iteración salvo que impida auditar o revisar contenido.
