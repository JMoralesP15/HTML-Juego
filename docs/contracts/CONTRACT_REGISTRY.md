# QUÉ AÑO — Contract Registry v1.8.3

El registro describe el runtime observado, no la arquitectura deseada. `UNIQUE` significa un propietario efectivo sin otro escritor cargado conocido; `SHARED` describe responsabilidad repartida de forma explícita; `CONFLICT` indica múltiples capas capaces de alterar el mismo comportamiento. `REQUIRES_BROWSER` exige evidencia dinámica antes de cerrar precedencia.

| # | Contrato | Owner observado | Competidores / dependencias | Ownership | Protección de test | Evidencia principal | Próximo paso seguro |
|---:|---|---|---|---|---|---|---|
| 1 | GAME_ENGINE | `game.js` + `storage.js` | Atlas y v1.5 parchean respuesta/timer | SHARED/CONFLICT | DIRECT | `archive-night.spec`, `atlas-v12.spec`, unitarios | separar estado puro de presentación antes de retirar wrappers |
| 2 | RENDER_GAME | `atlas-v12.js` | `game.js`, `archive-night.js`, decoradores v1.3–v1.8 | CONFLICT | DIRECT | `regression.spec`, `visual.spec`, Atlas | crear renderer canónico con tests de paridad antes de retirar símbolos shadowed |
| 3 | LEARNING_FEEDBACK | `learning-v16.js` | Atlas y v1.5 producen estructura previa | CONFLICT | DIRECT | `v16-learning-ux.spec` | alinear el renderer con el contrato narrativo vigente, sin taxonomía visible |
| 4 | CONTENT_BANK | `content.js` | enriquecimientos posteriores no cambian ID/año | UNIQUE | DIRECT | `audit.mjs`, `test.mjs` | mantener como fuente canónica de 300 IDs/años |
| 5 | EDITORIAL_CONTENT | `editorial.js` + manifests v1.8 | propuestas/revisión separadas | SHARED | INDIRECT | factual reports + review QA | consolidar modelo de procedencia sin promover propuestas no aprobadas |
| 6 | MEDIA | `experience-v18.js` | `experience-v14.js` hace Commons asíncrono | CONFLICT / REQUIRES_BROWSER | DIRECT | `curation-v14.spec`, media v1.8 | probar carrera asíncrona y fijar una política de precedencia explícita |
| 7 | SCHEDULER | `scheduler.js` | calendario/estado como entradas | UNIQUE | DIRECT | unitarios/audit | conservar invariantes |
| 8 | CALENDAR | `calendar.js` | scheduler consume el calendario | UNIQUE | DIRECT | unitarios/audit | conservar invariantes |
| 9 | STORAGE | `storage.js` | engine/product leen y escriben vía API | UNIQUE | DIRECT | unitarios y regresión | mantener compatibilidad de schema antes de cualquier migración |
| 10 | REVIEW_MASTERY | `storage.js` + `product-v13.js` | paneles/repaso consumen métricas | SHARED | DIRECT | `product-v13.spec` | extraer cálculo a módulo puro si se reduce runtime |
| 11 | SCORING_TIMER | `atlas-v12.js` + `simplification-v15.js` | storage normaliza campos temporales | CONFLICT | DIRECT | `atlas-v12.spec`, `v15-simplification.spec` | elegir un owner y congelar fórmula antes de retirar patches |
| 12 | NAVIGATION | `app.js` | paneles y capas decoran vistas | UNIQUE | INDIRECT | visual/accessibility | añadir test contractual de rutas/vistas antes de simplificar |
| 13 | AUDIO | `game.js` + `experience-v14.js` | v1.5 reubica control de ambiente | CONFLICT | DIRECT | `curation-v14.spec` | unificar preferencia funcional y ambiente opcional sin autoplay |
| 14 | ANALYTICS | `analytics-v17.js` | eventos emitidos desde varias capas | UNIQUE | NONE | configuración + instrumentación observada | añadir test de no-bloqueo y contrato de eventos antes de cambios |
| 15 | ACCESSIBILITY | DOM + `interaction-v17.css` + tests | responsabilidad transversal | SHARED | DIRECT | `accessibility.spec` | mantener como gate transversal |
| 16 | VISUAL_SYSTEM | 5 CSS activos | cascade entre generaciones | CONFLICT | DIRECT | `regression.spec`, `visual.spec` | reducir cascade sólo con capturas/baselines congeladas |
| 17 | QA_RELEASE | workflow + suites | snapshots, reports y Playwright | SHARED | INDIRECT | `.github/workflows/qa.yml` | separar bootstrap de snapshots y comparación; no regenerar en auditoría |
| 18 | EDITORIAL_REVIEW_TOOL | `review.js` + `editorial-assist-v181.js` | decisiones/almacenamiento separados | CONFLICT | DIRECT | `review-console.spec`, `editorial-assist-v181.spec` | converger stores/decisiones antes de ampliar lotes |

## Métricas contractuales

- Contratos auditados: 18/18.
- Propietario único sin competidor cargado conocido: 6/18 (`CONTENT_BANK`, `SCHEDULER`, `CALENDAR`, `STORAGE`, `NAVIGATION`, `ANALYTICS`).
- `ownership_ratio = 6 / 18 = 0.3333`.
- Protección DIRECT observable: 14/18.
- `test_protection_ratio = 14 / 18 = 0.7778`.
- Los estados `INDIRECT` y `NONE` no se cuentan como protección directa; así se evita inflar la cifra porque exista un test visual en algún rincón del repositorio.

## Invariantes de esta auditoría

300 IDs y años; calendario y scheduler; timer y scoring; persistencia; Repaso, Sets y Learning Gain; accesibilidad y offline. Analítica y media remota nunca deben bloquear el juego.

## Regla de retirada

`OBSOLETE_CANDIDATE` no significa eliminable. La retirada exige: owner sustituto explícito, test de paridad del comportamiento, QA visual sin actualización de baseline y verificación de persistencia cuando corresponda.
