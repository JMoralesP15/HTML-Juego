# QUÉ AÑO — Contexto vigente

Última consolidación: v1.7 beta. Este documento es la fuente narrativa canónica del estado del producto. Cuando una nota histórica, prompt anterior o README contradiga este archivo, prevalecen en este orden: código y CI del branch vigente, este documento, documentación de la versión actual y finalmente documentación histórica.

## 1. Qué está activo

- Producto público estable: v1.5 en GitHub Pages mediante `infra/pages-setup`.
- Iteración de aprendizaje: v1.6 en `feature/learning-result-ux-v1.6`, PR #7 en borrador. No publicada ni fusionada a `main`.
- Consolidación actual: v1.7 en `feature/architecture-editorial-consolidation-v1.7`. Objetivo: reducir deuda acumulativa de arquitectura y deuda estructural editorial sin añadir mecánicas nuevas.
- `main` sigue siendo una referencia histórica atrasada y no debe tratarse como estado de producto actual.

## 2. Invariantes duras

No modificar sin una decisión explícita y una migración demostrable:

- 300 IDs históricos y sus años.
- calendario publicado y scheduler; 365 días simulados, separación mínima histórica >=30 días y calendario de 1.096 días sin discrepancias en la última línea base verificada.
- persistencia local y compatibilidad con historiales legacy.
- timer de 15 s basado en deadline real, scoring y bonus existentes.
- `No lo sé`, teclado, offline, accesibilidad, Repaso, Sets, Learning Gain y navegación funcional.
- PostHog es no bloqueante y no justifica conclusiones conductuales sin muestra real.

## 3. Decisiones de producto vigentes

- Una pantalla debe tener una pregunta principal y una acción principal.
- El resultado debe enseñar antes de decorar.
- El contexto ampliado es progresivo, no obligatorio.
- Una imagen ausente es preferible a una imagen genérica que aparenta evidencia documental.
- El contenido generado por reglas internas no se considera verificación editorial.
- `editorialVerified` es el único marcador actual que puede ser interpretado como verificación dentro del repositorio.
- Las métricas de cultura general y concentración geográfica son herramientas de priorización, no evidencia de reconocimiento real ni cuotas normativas.

## 4. Evidencia técnica vigente

La línea base previa a v1.7 confirmó 28/28 tests funcionales, 300 preguntas, categorías casi balanceadas, 0 IDs duplicados, 0 años inválidos, calendario de 1.096 días con 0 discrepancias, 365 días de schedule con `minGap=52`, 0 repeticiones bajo 30 días, accesibilidad 4/4 y regresión canónica 2/2. El último v1.6 antes de consolidar llegó a 73/74 pruebas de navegador; el único fallo restante era un selector histórico `.answer-signature-item` que contradijo el resumen v1.6 con `.v16-learned-item`. El contrato se migró antes de abrir v1.7.

Estas cifras son QA de ingeniería y contenido. No equivalen a retención, comprensión, satisfacción ni aprendizaje observado.

## 5. Deuda que v1.7 ataca

### Arquitectura

Antes de v1.7 `index.html` activaba 10 hojas CSS y una cadena de scripts versionados que envolvían funciones globales o inspeccionaban el DOM. v1.3 envolvía `setView`; v1.4, v1.5 y v1.6 mantenían observers o wrappers de render. La corrección del resumen v1.6 mostró el costo: una capa debía adivinar cuándo otra había terminado de construir el DOM.

v1.7 introduce `js/runtime-contract.js` como ciclo de render único, migra las decoraciones v1.3-v1.6 a ese contrato y elimina MutationObservers de esas capas. Además consolida los cinco estilos de producto v1.3-v1.6 en `experience-v17.css`, reduciendo el cascade activo de 10 a 6 hojas sin borrar todavía la historia fuente.

### Calidad editorial

La arquitectura v1.2/v1.4 rellenaba cuotas mediante láminas SVG generadas y contextos derivados. Esos mecanismos eran útiles como prototipo, pero chocan con la dirección v1.5-v1.6: una ausencia honesta es mejor que contenido de relleno. v1.7 detiene esas mutaciones automáticas. Los helpers históricos siguen disponibles para reproducibilidad, pero no se adjuntan a `QUESTIONS`.

Los reportes `architecture-v17.json` y `editorial-quality-v17.json` distinguen cobertura, procedencia, verificación explícita, fuentes genéricas y deuda pendiente.

## 6. Contexto histórico que ya no debe gobernar decisiones

Los objetivos de cobertura como ">=180 imágenes" o ">=220 extendedContext", la obligación de mostrar placas editoriales, la secuencia visible Estima/Revela/Ubica/Aprende, badges de cultura general y la exigencia de conservar selectores DOM de versiones antiguas se consideran decisiones superadas. Se conservan como evidencia de evolución y para explicar compatibilidad, no como requisitos de producto actuales.

## 7. Incertidumbres reales

- No hay evidencia conductual suficiente para afirmar que 15 s, bonus temporal, resumen actual o contexto progresivo mejoren retención o aprendizaje.
- La clasificación cultural es heurística.
- Tener una URL de fuente no implica que el dato haya sido fact-checkeado.
- La concentración regional describe el banco. Por sí sola no demuestra sesgo indebido.
- La verificación editorial pendiente debe reducirse por lotes auditables, no mediante una bandera automática.

## 8. Regla de gobernanza

Toda nueva edición debe separar cuatro estados: observado, derivado, objetivo y recomendación. No se convierte un objetivo en evidencia, una heurística en verificación ni un test histórico en requisito si la presentación que protegía fue reemplazada deliberadamente.
