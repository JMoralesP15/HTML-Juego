# PROMPT B — QUÉ AÑO v1.7: Consolidación arquitectónica y calidad editorial

Estado: `ACTIVE_CONTRACT` mientras el PR v1.7 permanezca abierto.

## Rol

Actúa como principal engineer y consultor senior de producto. Trabaja sobre `feature/architecture-editorial-consolidation-v1.7`, derivada de una v1.6 cuyo último fallo conocido era un test de presentación obsoleto ya migrado. No añadas mecánicas nuevas. El valor de esta edición se mide por reducción de acoplamiento, mejor procedencia editorial y menor ambigüedad de contexto.

## Objetivos

1. Crear una fuente canónica de contexto vigente y clasificar documentación histórica sin perder trazabilidad.
2. Sustituir observers/wrappers de presentación encadenados por un contrato de render único y explícito.
3. Reducir el número de capas CSS activas sin alterar la apariencia deliberadamente.
4. Detener la generación automática de imágenes y contexto destinada sólo a alcanzar cuotas de cobertura.
5. Hacer visible la deuda editorial real mediante reportes de procedencia y prioridades, sin autoverificar contenido.
6. Incorporar presupuestos de deuda en CI para impedir regresión.
7. Mantener íntegros gameplay, datos, persistencia, accesibilidad, offline, Repaso, Sets y Learning Gain.

## Invariantes

No modificar IDs, años, categorías, scheduler, calendario, scoring, duración de timer, almacenamiento, migraciones legacy ni semántica de respuestas. No publicar ni fusionar a `main` o `infra/pages-setup` durante esta edición sin aprobación humana posterior.

## Arquitectura

Introduce `js/runtime-contract.js` como único punto activo que notifica que `setView` terminó. Las capas de presentación v1.3-v1.6 deben suscribirse a `__QYA_RUNTIME__.onRender` en vez de crear MutationObservers o envolver `setView`, `renderGame` o `renderSummary` sólo para decorar DOM.

No elimines todavía wrappers de comportamiento como timer, `commitAnswer` o `setYear` sólo para mejorar una métrica. Son deuda transicional, pero su migración exige tests de paridad. El presupuesto inmediato es: 0 MutationObservers activos de producto y como máximo 1 override de ciclo de render, el propio contrato.

Consolida CSS activo de producto v1.3-v1.6 en `experience-v17.css`, conservando orden de cascade. Los archivos históricos pueden permanecer en el repositorio pero no deben cargarse. Presupuesto: <=6 hojas CSS activas en v1.7. Identifica `compat`, `fix` y `polish` restantes como siguiente deuda, no finjas que desaparecieron.

## Editorial

`content-v12.js` y `curation-v14.js` dejan de mutar `QUESTIONS` para completar cuotas. No adjuntar láminas SVG generadas, `extendedContext` generado ni frases sintéticas de memoria. Se pueden conservar helpers históricos bajo demanda para reproducibilidad, siempre marcando su procedencia derivada.

La ausencia de imagen es válida. Commons sigue siendo progressive enhancement y sólo debe aceptar licencias abiertas con atribución. Si falla la red, el aprendizaje textual existente debe seguir funcionando.

`editorialVerified` es el único estado que cuenta como verificación. Clasifica el resto en `sourced_needs_review`, `generic_needs_review` o `missing_source`. No cambies a verified por tener URL, score cultural o porque el texto parece correcto.

## Reportes y CI

Añade `report:architecture` y `report:editorial` y ejecútalos en CI. Arquitectura debe fallar si vuelven MutationObservers de producto, si las hojas activas superan el presupuesto o si reaparecen múltiples overrides de lifecycle. Editorial debe fallar por fuente ausente, generación sintética automática o pérdida de cobertura textual explícita, pero NO debe fallar simplemente porque existe backlog de revisión.

El reporte editorial debe incluir: verificados, fuentes específicas pendientes, fuentes genéricas pendientes, faltantes, imágenes documentales, imágenes generadas, campos explícitos, concentración top4/HHI y lista priorizada. HHI es descriptivo.

## Tests

Migra tests obsoletos cuando protejan selectores reemplazados deliberadamente. No debilites timer, scoring, teclado, No lo sé, responsive, accesibilidad, Commons, offline, calendario, scheduler, persistencia, Sets o Learning Gain. Añade una aserción explícita de que el runtime no genera fallbacks editoriales y que el contexto funciona sin exigir una sección temporal derivada.

## Criterios de aceptación

- `npm test`: 28/28 o superior sin eliminar contratos.
- audit de 300 preguntas, IDs/años/calendario/schedule intactos.
- 0 imágenes generadas adjuntas al banco en runtime v1.7.
- 300/300 preguntas con fuente y texto de aprendizaje explícito según el banco actual.
- 0 MutationObservers activos en scripts cargados.
- <=1 override de lifecycle activo.
- <=6 hojas CSS activas.
- Axe sin violaciones serias/críticas en pantallas canónicas.
- regresión visual y browser QA verdes después de regenerar snapshots sólo cuando el cambio visual sea intencional.
- draft PR hacia v1.6, sin merge ni publicación.

## Entrega

Documenta `CONTEXT_CURRENT_TRUTH.md`, `CONTEXT_ARCHIVE_INDEX.md`, reporte de arquitectura, reporte editorial y metaanálisis. En el PR separa claramente deuda eliminada, deuda expuesta pero aún pendiente y deuda deliberadamente pospuesta.
