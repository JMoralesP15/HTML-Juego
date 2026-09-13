# Verificación de hallazgos externos — v1.8.3

| Hallazgo | Estado | Evidencia / matiz |
|---|---|---|
| Capas `game/archive-night/atlas/v1.3–v1.8` superpuestas | CONFIRMADO | `index.html` carga 24 JS; existen colisiones y patches observables. |
| `racha` vs `ritmo` | CONFIRMADO | `game.js` y `archive-night.js` declaran `refreshHeader()` con copy distinto; gana la definición posterior. |
| Sonido + Ambiente simultáneos | PARCIAL | v1.4 instala ambiente y v1.5 lo reubica a Ajustes; duplicidad lógica, no siempre dos controles visibles. |
| CSS acumulado | CONFIRMADO | cinco hojas activas de generaciones distintas participan en la cascade. |
| Unicode en navegación | CONFIRMADO | `index.html` usa ◉ ↺ ↔ ▦ ▥; deuda de identidad, no bug funcional. |
| Feedback con propiedad múltiple | CONFIRMADO | Atlas construye; v1.5 simplifica; v1.6 reestructura aprendizaje; v1.8 instala media. |
| Contrato narrativo vigente vs labels `Qué fue / Por qué importa / Dato para recordar` | CONFIRMADO / P0 | `learning-v16.js` sigue generando esas etiquetas visibles; contradice el contrato editorial vigente. |
| Snapshots se regeneran en cada CI | CONFIRMADO | workflow base ejecuta `qa:regression -- --update-snapshots`. v1.8.3 no debe regenerarlos. |
| Estado de PR representa historia real | REFUTADO | v1.1 está cerrado sin merge aunque es ancestro; PR #4–#9 siguen abiertos pese a estar superados; v1.2.1/v1.8.1/v1.8.2 no tienen PR propio. |
| Media v1.8 siempre prevalece sobre Commons v1.4 | REQUIRES_BROWSER | el orden síncrono favorece v1.8, pero Commons resuelve asíncronamente y puede terminar después. |

## Regla de esta iteración

Los hallazgos se verifican y priorizan. No se corrigen mediante refactor runtime, borrado o fusión de capas en v1.8.3. Donde la estática no basta se conserva `REQUIRES_BROWSER`.
