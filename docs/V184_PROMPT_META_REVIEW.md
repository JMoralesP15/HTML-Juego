# Metaanálisis del prompt v1.8.4

## Evaluación ejecutiva

El prompt convierte la auditoría v1.8.3 en una iteración de remediación controlada, no en una reescritura. Su principal fortaleza es separar corrección de producto visible, resolución de precedencia runtime, control cuantitativo de deuda y gobernanza futura.

Puntaje global revisado después de ejecución: **9.5/10**.

| Dimensión | Puntaje | Evaluación |
|---|---:|---|
| Claridad de alcance | 9.6/10 | Define base, rama, cinco workstreams y exclusiones explícitas. |
| Testabilidad | 9.8/10 | Cada cambio tiene criterio observable; la ejecución añadió evidencia browser real. |
| Reversibilidad | 10/10 | Rama separada, Draft PR, `main` intacto y sin merge. |
| Control de riesgo | 9.5/10 | Congela invariantes y posterga renderer/timer, las zonas de mayor impacto. |
| Disciplina arquitectónica | 9.6/10 | Convierte métricas en budgets y evita crecimiento de deuda. |
| Precisión de evidencia | 9.6/10 | Distingue análisis estático, contrato visual, artifacts, CI y browser. |
| Economía del cambio | 9.1/10 | El alcance sigue siendo pequeño frente al tamaño total de la deuda. |
| Riesgo de sobreajuste al baseline | 8.9/10 | Los budgets congelan deuda actual y requieren reducción progresiva posterior. |

## Fortalezas confirmadas durante la ejecución

### 1. Reduce el blast radius

La auditoría identificó ownership único en sólo 6/18 contratos. Intentar consolidar simultáneamente renderer, timer, CSS y media habría multiplicado interacciones difíciles de atribuir. v1.8.4 opera en una superficie deliberadamente menor y deja renderer/timer para iteraciones dedicadas.

### 2. Corrige primero el instrumento de medición

La ejecución confirmó que la baseline pixel-a-pixel histórica de pregunta estaba protegiendo un estado incidental: el diálogo introductorio, no la pregunta canónica. Al cerrar el diálogo, la captura actual mostró correctamente la pregunta, mientras la baseline antigua falló. Esto valida la premisa del prompt: antes de usar QA como árbitro hay que asegurar que mide la superficie correcta.

La conclusión metodológica se refinó: para pregunta, feedback y summary v1.8.4 usa un **contrato visual determinista** de viewport, geometría, overflow y estado semántico, y genera screenshots como artifacts para inspección. Esto evita reemplazar una baseline incorrecta por otra sólo porque CI necesita ponerse verde.

### 3. Convierte un UNKNOWN dinámico en hipótesis falsable

`MEDIA_ASYNC_PRECEDENCE` no se resuelve por intuición sobre el orden de `<script>`. Se añadió una respuesta Commons retrasada y una comprobación browser del DOM final. La suite visual browser pasó con esta prueba incluida, de modo que la precedencia deja de depender de inferencia estática.

### 4. Separa budgets de objetivos

Los límites de 31 colisiones, 17 patches, 811 `!important`, etc. son budgets de no regresión, no metas de arquitectura buena. El nuevo guard pasó usando reportes regenerados con el mismo scanner de la auditoría. Esto evita interpretar el baseline actual como un estándar deseable simplemente porque está cuantificado.

### 5. Protege invariantes de negocio

Los tests y auditorías posteriores a los cambios mantuvieron 300 IDs únicos, años válidos, calendario sin mismatches, scheduler con separación mínima de 52 días y sin repeticiones bajo 30 días. El prompt consiguió aislar el trabajo arquitectónico del rediseño de gameplay.

## Hallazgos del propio proceso de ejecución

### M1. Un test de auditoría puede ser correcto y aun así no ser reutilizable como gate futuro

La primera ejecución de CI falló porque `tests/audit-v183.test.mjs` estaba correctamente diseñado para demostrar que la rama de auditoría v1.8.3 no modificaba runtime. Reutilizar esa misma invariante en v1.8.4 convertía cualquier cambio legítimo de producto en fallo.

La corrección no fue debilitar el test histórico. Se separó `audit:reports:v183`, reutilizable para regenerar métricas, de `test:audit:v183`, que permanece como evidencia congelada de la rama de auditoría. Es una mejora de gobernanza del QA.

### M2. Snapshot antigua no equivale a verdad visual

El primer run v1.8.4 mostró dos diferencias esperadas: desktop esperaba 1440×901 y recibió 1440×900; mobile esperaba 390×845 y recibió 390×844. Más importante que el píxel de altura, la imagen esperada contenía el modal introductorio y la actual mostraba la pregunta real.

La evidencia obligó a corregir el prompt: no actualizar automáticamente esa snapshot ni forzar la UI a reproducir el error histórico. El gate se trasladó a un contrato visual determinista y los screenshots actuales siguen guardándose para revisión humana.

### M3. Las suites deben seguir ejecutándose después de un fallo visual conocido

En el primer flujo, una regresión pixel-a-pixel detenía la suite visual y ocultaba evidencia sobre Learning Feedback y la carrera asíncrona de media. Se cambió CI para ejecutar `Visual browser QA` aunque falle una comprobación previa no cancelada. En el run posterior, la suite visual completa pasó, confirmando los cambios funcionales incluso mientras la baseline obsoleta seguía roja.

## Riesgos residuales

### R1. El contrato visual no reemplaza toda la sensibilidad de una comparación pixel-a-pixel

Los asserts de geometría, overflow, estado y contenido son más semánticos y menos frágiles, pero pueden no detectar un cambio cromático o tipográfico pequeño. La mitigación es conservar screenshots en artifacts y mantener la suite visual multi-viewport. Cuando el sistema visual se consolide, puede definirse una nueva baseline pixel-a-pixel sobre superficies realmente canónicas.

### R2. Los budgets pueden convertirse en techo permanente

CI impide empeorar, pero no obliga por sí mismo a mejorar 33.3% de ownership ni a bajar 811 `!important`. Cada migración posterior debe reducir explícitamente uno o más límites cuando la evidencia lo permita.

### R3. El P0 visible puede resolverse sin reducir ownership

Learning Feedback puede quedar correcto para el usuario y seguir siendo un contrato con ownership `CONFLICT`. Esto es aceptable en v1.8.4: se corrige producto y contrato visible; la consolidación estructural queda para una iteración posterior.

### R4. Reportes versionados versus artifacts generados

Algunos reportes v1.8.3 preservan un baseline manual, mientras el scanner dinámico produce inventarios exhaustivos. El guard v1.8.4 consume outputs regenerados antes de evaluar budgets para mantener el método de medición constante.

## Riesgos evitados deliberadamente

- No se elimina ningún archivo porque parezca antiguo.
- No se consolidan `renderGame` ni `renderSummary` todavía.
- No se cambia la fórmula del timer o scoring para reducir patches artificialmente.
- No se limpia CSS masivamente para mejorar una métrica.
- No se redefine arquitectura basándose sólo en nombres de versiones.
- No se actualizan snapshots automáticamente para hacer desaparecer un fallo.

## Criterio de suficiencia

El prompt es suficientemente específico para ejecución automática porque define entradas, archivos objetivo, límites, pruebas, prohibiciones y evidencia final. La ejecución también demostró una propiedad importante: el prompt admite correcciones metodológicas cuando la evidencia contradice el supuesto inicial, sin ensanchar el alcance funcional.

La decisión principal se mantiene: **v1.8.4 estabiliza antes de consolidar**. Su éxito no se mide todavía por elevar el ownership ratio, sino por reducir incertidumbre operacional, cerrar el P0 visible, volver determinística la precedencia de media y evitar que la deuda cuantificada crezca mientras se preparan v1.8.5 y v1.8.6.
