# Tech Debt Map v1.8.2

- Render: Atlas v1.2 es propietario efectivo, pero `game.js`, `archive-night.js`, v1.5 y v1.6 intervienen. Riesgo P1.
- Aprendizaje: v1.6 sigue mostrando un contrato visual ya superado. Riesgo P0 de producto.
- Timer/scoring: Atlas + v1.5 + storage/game. Riesgo P1 por patches conductuales.
- Audio: game + v1.4 + reubicación v1.5. Riesgo P2.
- Media: v1.8 convive con búsqueda Commons v1.4. Riesgo P1 editorial.
- CSS: cinco hojas y varias generaciones en cascada. Riesgo P1.
- QA visual: CI actualiza snapshots antes de comparar. Riesgo P1.
- Revisor: consola general y asistida usan decisiones separadas. Riesgo P1.

`OBSOLETE_CANDIDATE` identifica símbolos/reglas shadowed o sin responsabilidad vigente demostrable. No autoriza borrado. La retirada futura requiere pruebas de paridad.

KPI: `ownership_ratio = componentes con propietario único / componentes auditados`. No se usa cantidad de archivos eliminados.
