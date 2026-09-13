# QUÉ AÑO — Contract Registry v1.8.2

Este registro define responsabilidades estables. En esta iteración se identifican conflictos y deuda, sin retirar código productivo.

| Contrato | Owner lógico | Estado |
|---|---|---|
| GAME_ENGINE | `game.js` + `storage.js` | transicional |
| RENDER_GAME | `atlas-v12.js` | transicional |
| LEARNING_FEEDBACK | `learning-v16.js` | transicional |
| CONTENT_BANK | `content.js` | estable |
| EDITORIAL_CONTENT | `editorial.js` + manifests v1.8 | transicional |
| MEDIA | `experience-v18.js` | transicional |
| SCHEDULER | `scheduler.js` | estable |
| CALENDAR | `calendar.js` | estable |
| STORAGE | `storage.js` | estable |
| REVIEW_MASTERY | `storage.js` + `product-v13.js` | transicional |
| SCORING_TIMER | `atlas-v12.js` + `simplification-v15.js` | transicional |
| NAVIGATION | `app.js` | estable |
| AUDIO | `game.js` + `experience-v14.js` | transicional |
| ANALYTICS | `analytics-v17.js` | estable |
| ACCESSIBILITY | DOM + `interaction-v17.css` + tests | transversal |
| VISUAL_SYSTEM | CSS activos de `index.html` | transicional |
| QA_RELEASE | workflow + tests | transicional |
| EDITORIAL_REVIEW_TOOL | `/review/` | transicional |

## Invariantes
300 IDs y años; calendario y scheduler; timer y scoring; persistencia; Repaso, Sets y Learning Gain; accesibilidad y offline. Analítica y media remota nunca bloquean el juego.

## LEARNING_FEEDBACK
Resultado inmediato, luego un relato breve natural. `Profundizar` existe sólo si agrega información. Fuente y media son respaldo opcional. `Qué fue`, `Por qué importa` y `Dato para recordar` son categorías internas, no etiquetas visibles. Evidencia estructurada no se convierte automáticamente en explicación pedagógica.

## EDITORIAL_CONTENT y MEDIA
El modelo separa `summary`, `expanded`, `dateNote`, fuente, confianza y revisión humana. Tener URL o corroboración estructurada no equivale a verificación manual. `mediaRecommendation: none` es válido. Relevancia, procedencia y derechos son requisitos independientes.

## EDITORIAL_REVIEW_TOOL
Factualidad, narrativa e imagen se deciden por separado. Aprobar con edición sólo afecta narrativa. Ediciones humanas tienen prioridad. Ninguna propuesta entra al juego sin aprobación explícita.

## Propiedad y obsolescencia
Si dos archivos controlan el mismo comportamiento se registra conflicto. Código cargado y código necesario no son sinónimos. Una marca `OBSOLETE_CANDIDATE` identifica deuda, no autoriza eliminación. Retirar requiere tests de paridad en una iteración posterior.
