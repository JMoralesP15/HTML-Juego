# v1.7 — Metaanálisis del prompt de consolidación

Estado: `ACTIVE_CONTRACT` hasta cerrar el PR v1.7.

## Qué podía estar mal en el Prompt B

### 1. “Eliminar deuda” podía convertirse en perseguir un número bonito

Contar archivos, observers o wrappers sirve para detectar acoplamiento, pero reducir el conteo no garantiza una arquitectura mejor. Por eso v1.7 elimina observers de presentación porque causaban problemas reales de lifecycle, pero NO elimina a ciegas wrappers de comportamiento del timer, `commitAnswer`, `setYear` u `openDetail`. Esos requieren migración con paridad funcional.

### 2. Un bus de render también puede ser otro parche

`runtime-contract.js` sigue envolviendo `setView` una vez. La diferencia es que reemplaza múltiples mecanismos implícitos por un único contrato observable. Esto es una mejora transicional, no una arquitectura final. El presupuesto permite 1 override de lifecycle; el objetivo posterior es que el propietario canónico de `setView` emita el evento directamente y el wrapper desaparezca.

### 3. Consolidar CSS podía ser simple bundling cosmético

Juntar archivos sin retirar el cascade anterior no elimina deuda. La ejecución v1.7 cambia `index.html` para cargar una sola capa de experiencia y elimina del branch los cinco CSS v1.3-v1.6 ya incorporados en `experience-v17.css`. La historia sigue disponible en Git, no necesita duplicarse en el árbol actual.

Aun quedan `archive-night-polish.css` y `atlas-v12-compat.css`. Se reconocen explícitamente como deuda de compatibilidad restante; no se ocultan detrás de una cifra global.

### 4. Eliminar fallbacks podía degradar el producto offline

La generación histórica garantizaba presencia visual, pero v1.5-v1.6 ya ocultaban placas genéricas en las pantallas principales. v1.7 preserva el aprendizaje textual offline y Commons como enhancement opcional. El criterio cambia de “tener algo que mostrar” a “mostrar sólo algo cuyo rol sea claro”. Los tests deben verificar fallback textual, no una cuota visual.

### 5. “Calidad editorial” podía sonar como “fact-checking completado”

No se revisaron 300 hitos contra fuentes externas en esta edición. v1.7 elimina un problema estructural anterior: mecanismos que hacían parecer más completo o verificado el banco de lo que realmente estaba. El nuevo reporte separa `verified`, `sourced_needs_review`, `generic_needs_review` y `missing_source`. La revisión factual real sigue siendo trabajo editorial por lotes.

### 6. La clasificación cultural podía contaminar verificación

El score cultural v1.4 continúa porque sirve para priorización y balance, pero su método ahora declara explícitamente que es heurístico. No cambia `editorialVerified`, no decide verdad factual y no debe usarse como probabilidad observada de reconocimiento.

### 7. Contexto canónico podía borrar aprendizaje histórico

La documentación anterior no se eliminó. `CONTEXT_ARCHIVE_INDEX.md` distingue contrato vigente de rationale histórico. Sólo se eliminaron CSS duplicados cuyo contenido ya está consolidado y cuyo historial permanece en Git.

## Ejecución y correcciones realizadas

1. El último test visual obsoleto de v1.6 fue migrado desde `.answer-signature-item` a la lista de aprendizaje v1.6 antes de crear la rama v1.7.
2. Se creó `runtime-contract.js` y las decoraciones v1.3-v1.6 pasaron al lifecycle compartido.
3. Se retiraron los MutationObservers de v1.4-v1.6, el wrapper visual de `setView` v1.3, el wrapper visual de `renderGame` v1.5 y el wrapper de `renderSummary` v1.6.
4. Se consolidaron cinco hojas de estilo de producto en `experience-v17.css`; esas cinco hojas históricas se eliminaron del árbol v1.7.
5. `content-v12.js` dejó de adjuntar automáticamente SVG y `extendedContext` a `QUESTIONS`.
6. `curation-v14.js` dejó de rellenar imágenes/contexto ausente. Mantiene clasificación cultural y conexiones sólo cuando existen anclas explícitas.
7. `audit.mjs` dejó de exigir cuotas sintéticas de cobertura y ahora protege procedencia, fuentes, texto explícito e inexistencia de contenido generado adjunto.
8. Se añadieron `architecture-report.mjs` y `editorial-quality-report.mjs`, ambos integrados en CI.
9. Se sustituyó el README v1.2 obsoleto y se creó contexto canónico/índice histórico.

## Deuda eliminada vs. deuda expuesta

### Eliminada o reducida materialmente

- observers de presentación activos v1.4-v1.6: objetivo 0;
- wrappers visuales encadenados de `setView/renderGame/renderSummary`: reducidos a un contrato central;
- hojas CSS activas: 10 → 6 antes de retirar duplicados, con cinco archivos históricos de producto ya eliminados del árbol;
- cuotas editoriales sintéticas 180/220: retiradas como requisito;
- fallbacks SVG/contexto adjuntados automáticamente: objetivo 0;
- README y narrativa de ramas v1.2: corregidos.

### Expuesta, no falsamente “resuelta”

- número real de hitos con `editorialVerified`;
- fuentes genéricas pendientes de revisión;
- falta de imagen documental en gran parte del banco;
- concentración geográfica;
- wrappers de comportamiento global heredados;
- `archive-night-polish.css` y `atlas-v12-compat.css`;
- package-lock históricamente con metadata de versión atrasada hasta que un lock determinista v1.7 sea confirmado/commiteado;
- falta de evidencia conductual suficiente.

## Condición de cierre

v1.7 sólo puede declararse lista para revisión cuando CI confirme: integridad, arquitectura, procedencia editorial, Axe, regresión y browser QA. Un reporte rojo debe clasificarse antes de corregirse. No se rebaja el gate porque resulte incómodo, ancestral deporte de ingeniería que este proyecto intentará evitar.
