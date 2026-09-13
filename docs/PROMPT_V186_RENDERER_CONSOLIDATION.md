# QUÉ AÑO — Prompt técnico v1.8.6

## Objetivo
Consolidar el contrato `RENDER_GAME` alrededor de `js/atlas-v12.js` como único writer canónico de la experiencia de juego y resumen, retirando de la ruta canónica definiciones shadowed sin eliminar todavía las capas que contienen helpers aún utilizados.

## Base y rama
- Base: `v185-scoring-timer` en el head `0428adf2193e96ac90b4272cc9a73fa4967e5941`, con QA v1.8.5 verde.
- Rama: `v186-renderer-consolidation`.
- PR apilado hacia `v185-scoring-timer`.
- No modificar `main` ni hacer merge automático.

## Evidencia y ajuste respecto del roadmap
La auditoría proyectaba un renderer canónico. La evidencia actual confirma esa dirección, pero `archive-night.js` aún provee helpers consumidos por Atlas, entre ellos `archiveNumber`, `archiveProgress` y `archiveRhythmLabel`. Por tanto, v1.8.6 NO debe borrar `archive-night.js`: debe retirar únicamente sus writers shadowed de renderer y conservar helpers requeridos.

## Alcance
1. Proteger con tests de paridad los estados: daily/practice/review; question/feedback/summary; desktop y mobile.
2. Mantener `atlas-v12.js` como implementación canónica de `renderGame`, `renderSummary`, `summarySignature` y `temporalScale`.
3. Retirar como writers canónicos las definiciones homónimas de capas anteriores. La estrategia preferida es renombrarlas de forma explícita como implementaciones legacy/transicionales, sin alias que vuelvan a escribir el símbolo global.
4. Conservar `archive-night.js` para helpers aún consumidos y no retirar archivos completos en esta versión.
5. Mantener `runtime-contract.js` como contrato de notificación post-render y no introducir MutationObservers ni wrappers adicionales del renderer.
6. Regenerar auditoría, actualizar `CONTRACT_REGISTRY` y endurecer el architecture budget sólo según métricas observadas después de la migración.

## Fuera de alcance
- `renderCover`, `refreshHeader` y `answerDeltaCopy` permanecen como deuda separada.
- No cambiar SCORING_TIMER, audio, contenido, media, scheduler, calendar, storage schema, Repaso, Sets, Learning Gain ni CSS.
- No eliminar `game.js`, `archive-night.js` ni `atlas-v12.js`.
- No regenerar snapshots automáticamente.

## Criterios de aceptación
- QA completa verde.
- `renderGame`, `renderSummary`, `summarySignature` y `temporalScale` tienen un único writer canónico cargado: Atlas.
- `RENDER_GAME` pasa de `CONFLICT` a `UNIQUE` si la evidencia estática y browser lo confirma.
- Ownership contractual esperado: 8/18 = 44,4%.
- Colisiones estáticas deben disminuir respecto de 27; el nuevo límite se fija al valor realmente observado, no al estimado.
- Behavior patches no aumentan sobre 13; MutationObservers permanecen en 0; render subscriptions no superan 7.
