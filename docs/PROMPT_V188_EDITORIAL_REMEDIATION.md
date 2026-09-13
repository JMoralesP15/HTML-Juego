# Prompt técnico v1.8.8 — Remediación editorial de revisión humana

## Objetivo
Convertir el feedback humano exportado desde la consola editorial en una segunda pasada reproducible y verificable, sin interpretar los estados como simples etiquetas. La revisión humana es la fuente de verdad para decidir qué debe reemplazarse, reescribirse o volver a buscarse visualmente.

## Fuente de verdad y alcance
Usar como entrada el export de revisión `que-ano-editorial-review-2026-09-13.json` ya compilado en `reports/editorial-feedback-v187c.json`. Métricas observadas: 300 registros totales, 198 tocados, 165 completamente triados, 30 `doubtful`, 2 `review_source`, 118 `generic` y 141 visuales rechazadas (`anachronistic`, `irrelevant` o `rights_review`). No inferir que `pending` equivale a rechazo humano.

## Semántica obligatoria del feedback

### 1. `factualStatus = doubtful`
Interpretar como **el evento no satisface el criterio editorial del banco**, aunque el dato factual pueda ser correcto. Proponer como mínimo dos reemplazos. Priorizar cultura general occidental, latinoamericana y chilena, hitos misceláneos y memorables por encima de subhitos técnicos o de nicho.

Reglas:
- conservar el año siempre que sea posible;
- conservar la categoría siempre que exista un reemplazo de calidad comparable;
- si se cambia de categoría, declararlo explícitamente;
- evitar duplicados o eventos ya representados en el banco;
- cada opción debe incluir título, pregunta, dato, región, entidad, fuente inicial, racional editorial y `reviewRequired:true`;
- ninguna opción se publica automáticamente;
- al seleccionar un reemplazo, reiniciar texto y visual para revisar el nuevo evento.

### 2. `factualStatus = review_source`
Interpretar como **evento aprobado, encuadre/título no aprobado**. No sustituir el evento. Proponer título, pregunta y dato reformulados, conservando el hito y aportando una fuente más adecuada cuando corresponda.

### 3. `textStatus = generic`
Reescribir el aprendizaje de manera específica, legible y útil. No limitarse a repetir “X ocurrió en Y”. El texto debe explicar qué cambió, por qué se recuerda o qué consecuencia cultural, social, científica o tecnológica tuvo.

Contrato orientativo:
- `summary`: 35–70 palabras;
- `expanded`: 60–130 palabras;
- `dateNote`: sólo si resuelve una ambigüedad cronológica real;
- no usar lenguaje de ficha técnica, metacomentarios editoriales ni frases vacías del tipo “fue importante porque fue importante”.

Los 17 registros que son simultáneamente `generic` y `doubtful` no requieren reescribir el evento antiguo: el texto debe rehacerse una vez elegido el reemplazo.

### 4. `mediaStatus = anachronistic | irrelevant | rights_review`
Interpretar como **la visual actual no sirve**. Ejecutar una nueva búsqueda de candidatas y mostrar varias alternativas para decisión humana.

Política de búsqueda:
- objetivo: hasta 6–8 alternativas por evento;
- priorizar coincidencia de entidad + evento + año;
- preferir fotografía documental contemporánea;
- para objetos culturales o tecnológicos se admite una fotografía posterior del objeto original si está claramente etiquetada;
- relajar la coincidencia semántica cuando una búsqueda estricta deja al evento sin alternativas, pero conservar trazabilidad;
- separar `publishable` de `review_only`;
- `publishable`: licencia abierta o dominio público claramente identificable;
- `review_only`: útil para decidir contexto visual, pero con derechos no resueltos o evidencia insuficiente. Puede mostrarse en la consola, nunca publicarse automáticamente en el juego;
- no degradar la política legal para conseguir cobertura artificial.

### 5. Reemplazos + visuales
La búsqueda visual debe cubrir no sólo los 141 eventos con visual rechazada, sino también cada alternativa de reemplazo de los 30 eventos `doubtful`. La consola debe usar las candidatas del reemplazo seleccionado, no las del evento original.

## Consola v1.8.8
La siguiente iteración debe:
- mantener un solo store canónico y compatibilidad con import/export actual;
- permitir filtrar `doubtful`, `generic`, `review_source`, visual rechazada y reemplazos;
- mostrar hasta 8 visuales ordenadas por score semántico;
- enseñar `rightsTier`, año de foto, delta temporal, procedencia y warnings;
- bloquear aprobación automática de `review_only`;
- mostrar reemplazos con riesgo de duplicado y cambio de categoría;
- cuando se seleccione un reemplazo, usar inmediatamente su título/pregunta/dato y sus candidatas visuales;
- no sobrescribir decisiones locales más recientes al importar o sembrar datos.

## QA mínimo
Debe verificarse automáticamente que:
- los 30 `doubtful` tienen al menos 2 reemplazos;
- los 2 `review_source` tienen reformulación;
- los 101 `generic` que no son `doubtful` tienen reescritura específica;
- los 17 `generic ∩ doubtful` quedan cubiertos por el flujo de reemplazo, no por texto del evento obsoleto;
- se procesan los 141 IDs con visual rechazada;
- cada candidata tiene procedencia y `rightsTier`;
- ninguna candidata queda autoaprobada;
- hay máximo 8 alternativas por conjunto;
- seleccionar un reemplazo cambia también el conjunto visual mostrado;
- unitarios, accesibilidad y QA visual existente no retroceden.

## Fuera de alcance
No modificar todavía el banco canónico `js/content.js` con decisiones no aprobadas manualmente. Esta versión construye la capa de remediación y la consola para completar la segunda revisión humana.