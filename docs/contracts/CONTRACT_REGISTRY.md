# QUÉ AÑO — Contract Registry v1.8.6

El registro describe el runtime observado, no la arquitectura deseada. `UNIQUE` significa un propietario efectivo sin otro writer canónico cargado conocido; `SHARED` describe responsabilidad repartida de forma explícita; `CONFLICT` indica múltiples capas capaces de alterar el mismo comportamiento. Código renombrado como legacy sigue siendo transicional y no se considera autorización de borrado.

| # | Contrato | Owner observado | Competidores / dependencias | Ownership | Protección de test | Evidencia principal | Próximo paso seguro |
|---:|---|---|---|---|---|---|---|
| 1 | GAME_ENGINE | `game.js` + `storage.js` | Atlas implementa respuesta temporal; v1.5 conserva wrapper de telemetría | SHARED/CONFLICT | DIRECT | `archive-night.spec`, `atlas-v12.spec`, unitarios | separar estado puro de presentación antes de retirar wrappers |
| 2 | RENDER_GAME | `atlas-v12.js` | Archive Night conserva helpers y las implementaciones previas quedan renombradas como legacy sin reescribir símbolos canónicos | UNIQUE | DIRECT | `regression.spec`, `visual.spec`, `renderer-v186.spec`, `renderer-ownership-v186` | mantener Atlas como único writer; retirar código legacy sólo con evidencia de uso cero y paridad |
| 3 | LEARNING_FEEDBACK | `learning-v16.js` | Atlas y v1.5 producen estructura previa | CONFLICT | DIRECT | `v16-learning-ux.spec` | reducir ownership sólo con paridad de la salida narrativa vigente |
| 4 | CONTENT_BANK | `content.js` | enriquecimientos posteriores no cambian ID/año | UNIQUE | DIRECT | `audit.mjs`, `test.mjs` | mantener como fuente canónica de 300 IDs/años |
| 5 | EDITORIAL_CONTENT | `editorial.js` + manifests v1.8 | propuestas/revisión separadas | SHARED | INDIRECT | factual reports + review QA | consolidar modelo de procedencia sin promover propuestas no aprobadas |
| 6 | MEDIA | `experience-v18.js` + fallback `experience-v14.js` | precedencia `v1.8 curada > Commons > sin imagen` probada en browser | SHARED | DIRECT | `curation-v14.spec` | mantener precedencia determinística; no volver a permitir overwrite asíncrono |
| 7 | SCHEDULER | `scheduler.js` | calendario/estado como entradas | UNIQUE | DIRECT | unitarios/audit | conservar invariantes |
| 8 | CALENDAR | `calendar.js` | scheduler consume el calendario | UNIQUE | DIRECT | unitarios/audit | conservar invariantes |
| 9 | STORAGE | `storage.js` | engine/product leen y escriben vía API | UNIQUE | DIRECT | unitarios y regresión | mantener compatibilidad de schema antes de cualquier migración |
| 10 | REVIEW_MASTERY | `storage.js` + `product-v13.js` | paneles/repaso consumen métricas | SHARED | DIRECT | `product-v13.spec` | extraer cálculo a módulo puro si se reduce runtime |
| 11 | SCORING_TIMER | `atlas-v12.js` | storage normaliza campos temporales; v1.5 sólo consume snapshot para telemetría | UNIQUE | DIRECT | `atlas-v12.spec`, `v15-simplification.spec` | mantener fórmula `timer-v1`; cualquier cambio exige nueva versión contractual |
| 12 | NAVIGATION | `app.js` | paneles y capas decoran vistas | UNIQUE | INDIRECT | visual/accessibility | añadir test contractual de rutas/vistas antes de simplificar |
| 13 | AUDIO | `game.js` + `experience-v14.js` | v1.5 reubica control de ambiente | CONFLICT | DIRECT | `curation-v14.spec` | unificar preferencia funcional y ambiente opcional sin autoplay |
| 14 | ANALYTICS | `analytics-v17.js` | eventos emitidos desde varias capas | UNIQUE | NONE | configuración + instrumentación observada | añadir test de no-bloqueo y contrato de eventos antes de cambios |
| 15 | ACCESSIBILITY | DOM + `interaction-v17.css` + tests | responsabilidad transversal | SHARED | DIRECT | `accessibility.spec` | mantener como gate transversal |
| 16 | VISUAL_SYSTEM | 5 CSS activos | cascade entre generaciones | CONFLICT | DIRECT | `regression.spec`, `visual.spec` | reducir cascade sólo con capturas/baselines congeladas |
| 17 | QA_RELEASE | workflow + suites | reports y Playwright | SHARED | INDIRECT | `.github/workflows/qa.yml` | mantener captura determinista y artifacts; no regenerar baselines automáticamente |
| 18 | EDITORIAL_REVIEW_TOOL | `review.js` + `editorial-assist-v181.js` | decisiones/almacenamiento separados | CONFLICT | DIRECT | `review-console.spec`, `editorial-assist-v181.spec` | converger stores/decisiones antes de ampliar lotes |

## Métricas contractuales

- Contratos auditados: 18/18.
- Propietario único sin competidor canónico cargado conocido: 8/18 (`RENDER_GAME`, `CONTENT_BANK`, `SCHEDULER`, `CALENDAR`, `STORAGE`, `SCORING_TIMER`, `NAVIGATION`, `ANALYTICS`).
- `ownership_ratio = 8 / 18 = 0.4444`.
- Protección DIRECT observable: 14/18.
- `test_protection_ratio = 14 / 18 = 0.7778`.
- Ratchet estructural objetivo v1.8.6: colisiones estáticas <= 23, behavior patches <= 13, MutationObservers = 0, render subscriptions <= 7. CI debe validar estos límites contra el scanner regenerado.

## Invariantes

300 IDs y años; calendario y scheduler; fórmula de timer/scoring `timer-v1`; persistencia; Repaso, Sets y Learning Gain; accesibilidad y offline. Analítica y media remota nunca deben bloquear el juego.

## Regla de retirada

Una implementación legacy renombrada es sólo `OBSOLETE_CANDIDATE`. La retirada física exige: evidencia de uso cero, owner sustituto explícito, test de paridad, QA visual determinista y verificación de persistencia cuando corresponda.
