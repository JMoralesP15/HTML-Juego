# Prompt maestro — QUÉ AÑO v1.5 · Simplificación, claridad y ritmo de juego

Trabaja de manera autónoma sobre `feature/simplification-game-clarity-v1.5`, derivada de `feature/curation-atmosphere-v1.4`.

El objetivo es simplificar radicalmente la experiencia de juego, mejorar la jerarquía visual y corregir inconsistencias de UX observadas en la v1.4 publicada. La v1.5 no agrega modos ni sistemas nuevos: poda, consolida y mejora lo existente.

Regla general: **una pantalla → una pregunta principal → una acción principal**.

El jugador debe comprender en menos de dos segundos qué se le pregunta, qué año está seleccionando, cuánto tiempo tiene y cómo envía su respuesta.

## Alcance obligatorio

1. Reducir aproximadamente 40–50% del texto auxiliar de la pantalla de pregunta.
2. Mantener sólo categoría+dificultad y un único indicador de progreso `n / 5`.
3. Hacer del selector temporal el control central: `−10  −1  AÑO  +1  +10`, con timer visible pero secundario.
4. Convertir el CTA en `CONFIRMAR AÑO`, siempre visible sin scroll obligatorio en desktop y móvil.
5. Mantener `No lo sé` como acción secundaria y Enter como shortcut, nunca como interacción oculta.
6. Eliminar del flujo principal `ARCHIVO #`, `DESAFÍO #`, `COORDENADA`, `INSTRUMENTO TEMPORAL`, textos de familia visual, duplicación de categoría/subcategoría y badges editoriales de cultura general.
7. Sustituir el timer pausado por `visibilitychange` por un deadline absoluto basado en `Date.now()`. La pestaña puede dejar de repintar, pero el tiempo real continúa.
8. Simplificar feedback a tres niveles: resultado inmediato, aprendizaje esencial y contexto opcional.
9. Resultado dominante: `estimación → año real` más una sola diferencia temporal.
10. Aprendizaje esencial: hecho principal y anclaje temporal en máximo 2–3 bloques breves.
11. Contexto, imagen, conexiones, fuentes y licencias quedan bajo `Ver contexto e imagen`.
12. Prioridad visual: documento/fotografía relevante > Commons relevante > ilustración útil > ninguna imagen > placa decorativa.
13. Durante una partida reducir navegación a `Hoy | Repaso | Colección`; Ordenar y Estadísticas no deben competir con el juego.
14. Mover Ambiente a Ajustes y ocultar ritmo semanal durante la pregunta.
15. Reducir tamaño máximo de títulos y la cantidad de bordes/divisores decorativos.
16. Validar 375×667, 390×844 y 412×915 sin scroll obligatorio para leer, elegir año y responder.
17. Mantener extendedContext, Commons, Sets, Repaso, Learning Gain, cultureTier/cultureScore, estadísticas, telemetría, modo offline, `file://`, teclado y accesibilidad.
18. No modificar IDs, años, calendario, scheduler ni repetición espaciada.
19. Mantener PostHog no bloqueante y registrar/validar `answer_confirmed`, `answer_skipped`, `time_expired`, `context_expanded`, `next_question` y tiempo de respuesta.
20. Consolidar CSS de forma conservadora, sin reescritura de framework.

## QA de salida

- CTA visible a 1366×768, 375×667, 390×844 y 412×915.
- Cero overflow horizontal.
- Timer sigue corriendo aunque la pestaña quede oculta.
- Al volver después del deadline se registra timeout.
- Enter confirma.
- `No lo sé` funciona.
- Flujo respuesta → feedback → siguiente funciona.
- Contexto expandible funciona.
- Commons y fallback offline siguen funcionando.
- Sets y Repaso siguen funcionando.
- Ningún ID, año o calendario cambia.
- Accesibilidad y regresión visual verdes.

## Entrega

Crear `docs/V15_UI_REVIEW.md`, añadir QA específico, versionar interfaz y package como 1.5 beta, y abrir PR draft desde `feature/simplification-game-clarity-v1.5` hacia `feature/curation-atmosphere-v1.4`. No hacer merge ni publicar automáticamente.

Criterio final: **si algo no ayuda al jugador a responder o aprender, quitarlo**.
