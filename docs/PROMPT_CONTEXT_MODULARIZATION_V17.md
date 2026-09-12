# PROMPT A — Auditoría senior del contexto del contexto

Estado: `HISTORICAL_EVIDENCE` una vez ejecutado. Su resultado canónico se consolida en `CONTEXT_CURRENT_TRUTH.md`.

## Prompt

Actúa como consultor senior de producto digital, arquitectura front-end, QA y evaluación de proyectos. Tu tarea no es diseñar una nueva funcionalidad, sino revisar el contexto acumulado del proyecto QUÉ AÑO y reducir su entropía decisional.

Usa como jerarquía de evidencia: 1) comportamiento verificable del código y CI del branch objetivo; 2) invariantes de datos y persistencia; 3) documentación de la edición vigente; 4) decisiones activas de producto; 5) prompts y notas históricas. Una nota antigua nunca debe sobreescribir silenciosamente una realidad comprobada más reciente.

Clasifica cada pieza de contexto en exactamente una categoría principal: `ACTIVE_INVARIANT`, `ACTIVE_DECISION`, `OBSERVED_EVIDENCE`, `DERIVED_EVIDENCE`, `BEHAVIORAL_UNKNOWN`, `LEGACY_COMPATIBILITY`, `DEFERRED_OR_BLOCKED`, `SUPERSEDED_DECISION` o `HISTORICAL_RATIONALE`. Conserva una referencia al origen de todo elemento superado que explique por qué existe código legacy.

Para cada conflicto encontrado, registra: afirmación A, afirmación B, cuál tiene mayor autoridad, riesgo de mantener ambas como activas y resolución recomendada. No borres historia sólo para que el repositorio parezca limpio. Archiva o reclasifica primero. El objetivo es que una persona nueva pueda saber qué debe obedecer hoy sin perder trazabilidad.

Cuantifica deuda cuando sea posible: cantidad de hojas CSS activas, scripts activos, wrappers de funciones globales, MutationObservers de presentación, capas versionadas, tests que protegen selectores históricos, contextos generados, imágenes generadas, preguntas pendientes de revisión, fuentes genéricas, concentración geográfica y cualquier otro indicador reproducible. Distingue siempre entre una señal de deuda y un defecto demostrado.

Protege como invariantes hasta que exista una migración explícita: 300 IDs y años, calendario, scheduler, persistencia local, timer, scoring, offline, accesibilidad, Repaso, Sets y Learning Gain. No concluyas que una métrica conductual mejoró si no existen observaciones reales.

En calidad editorial, no conviertas automáticamente URL, score cultural, heurística, texto generado ni relación cronológica en `verificado`. Una ausencia de imagen o explicación es aceptable. Un elemento debe considerarse factual y editorialmente verificado sólo si existe evidencia explícita de revisión humana o un mecanismo equivalente documentado.

Entrega: a) mapa de contexto vigente; b) índice histórico; c) contradicciones; d) deuda cuantificada; e) decisiones a retirar; f) decisiones a mantener; g) incertidumbres; h) plan de consolidación por fases; i) criterios objetivos para impedir que la deuda vuelva a crecer.

## Metaanálisis del Prompt A antes de ejecutarlo

1. **Riesgo: modularizar se confunde con borrar.** Corrección: el prompt exige reclasificación y archivo, no eliminación automática.
2. **Riesgo: declarar al código como verdad absoluta.** El código demuestra estado observado, pero puede contener un bug. Corrección: código+CI tienen prioridad para describir lo que ocurre; intención de producto sigue siendo necesaria para juzgar si aquello debería ocurrir.
3. **Riesgo: “eliminar toda la deuda” induce una reescritura.** Corrección: medir, fijar presupuestos y migrar con paridad. Cero deuda literal no es un objetivo técnico razonable.
4. **Riesgo: confundir calidad editorial con cantidad de contenido.** Corrección: se prohíbe usar cobertura como sustituto de procedencia y revisión.
5. **Riesgo: tratar concentración geográfica como sesgo demostrado.** Corrección: HHI/top4 son descriptores, no cuotas normativas.
6. **Riesgo: tests antiguos bloquean decisiones actuales.** Corrección: se conserva el contrato semántico y se migra el test cuando el selector/copy antiguo ya fue reemplazado deliberadamente.
7. **Riesgo: refactor arquitectónico y fact-checking simultáneos destruyen causalidad.** Corrección: primero infraestructura y procedencia; después revisión factual por lotes auditables.

## Ejecución del metaanálisis sobre el repositorio

La ejecución confirmó que el mayor problema no era el número de funciones sino la superposición de mecanismos de presentación. Antes de v1.7 el HTML activaba 10 CSS. v1.3 envolvía `setView`; v1.4, v1.5 y v1.6 reaccionaban al DOM mediante wrappers u observers. El fallo final 73/74 de v1.6 fue evidencia concreta: un test seguía esperando `.answer-signature-item` cuando el producto ya había migrado a `.v16-learned-item`.

En contenido, v1.2 y v1.4 habían convertido objetivos de cobertura en mutaciones de runtime: se generaban láminas SVG y contextos estructurados para llenar cupos. Esa política contradice la decisión posterior de v1.5-v1.6 de preferir contenido relevante o ausencia honesta. También hacía que “cobertura” mezclara evidencia real y contenido de soporte generado.

La resolución aplicada en v1.7 es: contexto canónico separado de historia, ciclo de render central, observers de presentación retirados, CSS de producto consolidado y generación automática de fallback editorial detenida. Los helpers históricos se conservan para reproducibilidad, pero ya no se adjuntan al banco.

Resultado del Prompt A: la deuda debe evaluarse como `acoplamiento + ambigüedad de autoridad + procedencia editorial`, no sólo como cantidad de archivos. Eso corrige el sesgo inicial del propio prompt hacia métricas de superficie.
