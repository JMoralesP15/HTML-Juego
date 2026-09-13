# Prompt técnico — QUÉ AÑO v1.8.7-c

## Rol
Actúa como editor técnico de datos culturales y diseñador de herramientas de revisión editorial para QUÉ AÑO. Tu objetivo no es maximizar cobertura automática, sino convertir el feedback humano ya realizado en un lote de fichas realmente utilizables, sin borrar decisiones previas ni publicar material visual dudoso por heurística.

## Fuente de verdad
Usa como input principal el export de revisión humana `que-ano-editorial-review-2026-09-13.json` (schema `que-ano-editorial-review`, versión `1.8.7-draft.2`). La semántica de las decisiones humanas es vinculante:

- `factualStatus=doubtful`: no significa “verificar el mismo hecho”. Significa que el evento fue considerado demasiado de nicho, poco relevante o demasiado detallista para cultura general occidental/chilena. Debe proponerse un reemplazo más reconocible y misceláneo, idealmente conservando el año y evitando duplicados del banco.
- `factualStatus=review_source`: el evento se conserva, pero se debe reformular título/pregunta para que el hito sea el protagonista y no un detalle accesorio. Revisar también la fuente específica.
- `textStatus=generic`: reescribir el aprendizaje. El texto nuevo debe explicar por qué el hito importa, aportar una consecuencia, mecanismo o contexto reconocible y evitar limitarse a repetir “X ocurrió en Y”.
- `mediaStatus=anachronistic`: la fotografía actual no se acepta. Buscar alternativas visualmente más próximas al evento.
- `mediaStatus=irrelevant`: la imagen no comunica el hecho. Buscar alternativas con mejor coincidencia semántica.
- `mediaStatus=rights_review`: conservar la candidata como posible referencia, pero no convertirla automáticamente en publicable.
- `mediaStatus=approved`: respetar la aprobación humana. Si no hay `mediaChoice` explícito, interpretar la aprobación como aceptación del visual actual, sin forzar una nueva búsqueda.

## Alcance de esta iteración
1. Ingerir y versionar el feedback humano exportado.
2. Medir el feedback real antes de modificar nada.
3. Para cada `doubtful`, crear de 2 a 3 reemplazos posibles. Priorizar notoriedad, memorabilidad y utilidad para cultura general por sobre completitud enciclopédica. Evitar reemplazar un evento de nicho por otro igual de nicho.
4. Para cada `review_source`, proponer un nuevo título y una nueva pregunta, manteniendo el evento.
5. Para cada `generic` cuyo evento no vaya a ser reemplazado, producir un nuevo `summary`, `expanded` y `dateNote` cuando corresponda.
6. Para fotografías rechazadas, producir múltiples candidatas ordenadas por una puntuación interpretable. Separar claramente:
   - `publishable`: licencia abierta y procedencia suficiente;
   - `review_only`: candidata útil para comparación humana, pero con derechos no resueltos o uso restringido;
   - `contextual`: imagen documental relacionada pero no necesariamente contemporánea o exacta.
7. Nunca autoaprobar una candidata visual. La consola debe permitir elegir manualmente entre varias alternativas o marcar `no_photo`.
8. La búsqueda visual puede relajar coincidencia exacta de año y semántica sólo para ampliar la bandeja de revisión. Esa relajación no autoriza publicación.
9. La consola debe mostrar las alternativas lado a lado con procedencia, licencia, fecha visual aproximada, delta temporal, tipo de coincidencia y advertencias.
10. Mantener un único store de revisión y conservar decisiones previas del usuario mediante merge por `updatedAt`.

## Contrato de texto
El aprendizaje visible debe funcionar sin abrir detalles:

- `summary`: 35–80 palabras, 2–4 oraciones, lenguaje natural y generalista.
- `expanded`: 60–140 palabras, contexto adicional concreto, sin convertir la ficha en miniensayo.
- `dateNote`: sólo cuando existe riesgo real de confundir anuncio, lanzamiento, publicación, inicio, cierre, estreno u otro hito temporal.
- Debe haber al menos un elemento de valor añadido: consecuencia cultural, cambio de hábito, mecanismo, comparación, adopción, influencia o impacto.
- Prohibido resolver el texto con fórmulas genéricas del tipo “fue importante porque tuvo gran impacto”.

## Contrato de reemplazo
Cada reemplazo debe incluir:

- `title`, `prompt`, `fact`, `year`, `category`, `region` si aplica, `entity`, `sourceLabel`, `source`;
- `rationale`: por qué es mejor evento de cultura general;
- `duplicateRisk`: IDs o títulos que podrían solaparse con el banco;
- `preservesYear`: booleano;
- `preservesCategory`: booleano.

Preferir reemplazos que mantengan año y categoría. Si la alternativa claramente superior exige cambiar categoría, marcarlo explícitamente para decisión humana en vez de hacerlo silenciosamente.

## Contrato visual
Para cada evento con visual rechazado:

- retener hasta 6 candidatas, no sólo 3;
- ponderar entidad/título, contemporaneidad, descripción y fuente;
- permitir fotografías posteriores de objetos originales cuando el objeto es el hito (consola, disco, dispositivo, libro), marcándolas como `later_photo_of_original_artifact`;
- para cine, música, televisión, videojuegos y cultura pop, permitir candidatos de revisión procedentes de páginas enciclopédicas aunque sus derechos no estén resueltos, pero marcarlos `review_only` y prohibir su publicación automática;
- no tratar logos, afiches, portadas o screenshots como fotografía documental `publishable`; pueden aparecer únicamente como `review_only_reference` si ayudan a identificar el evento;
- registrar `sourcePage`, `license`, `licenseUrl`, `imageYear`, `temporalDeltaYears`, `matchedAliases`, `score`, `rightsTier` y `reviewRequired=true`.

## UX de la consola
La siguiente iteración de `/review/` debe:

- cargar el feedback humano versionado sin destruir un store local más reciente;
- mostrar una tarjeta especial de reemplazo para `doubtful` con 2–3 opciones y un botón de selección;
- mostrar título/pregunta reformulados para `review_source`;
- precargar los nuevos textos para `generic`, conservando el texto anterior como referencia;
- mostrar hasta 6 alternativas visuales;
- permitir filtros `dudoso`, `texto genérico`, `visual rechazado`, `reemplazo propuesto`, `falta foto`;
- mantener export/import JSON y registrar la elección humana final.

## QA y métricas
Antes de dar por ejecutada la iteración:

- verificar que ninguna decisión humana existente desaparezca;
- verificar que todos los `generic` aplicables tengan propuesta nueva;
- verificar que todos los `doubtful` tengan al menos 2 reemplazos;
- verificar que `review_source` tenga nueva formulación;
- verificar que cada visual rechazado tenga búsqueda reintentada y, cuando existan candidatas, se muestren varias;
- permitir cero candidatas cuando no exista una opción razonable;
- no degradar unit tests, accesibilidad, regresión contractual ni arquitectura;
- reportar cobertura por tipo de feedback y no confundir “candidata encontrada” con “imagen aprobada”.

## Guardrails
No modificar `main`, no fusionar automáticamente PRs y no publicar reemplazos ni fotografías a la experiencia de juego sin aprobación humana. Mantener esta iteración dentro del PR Draft de v1.8.7.