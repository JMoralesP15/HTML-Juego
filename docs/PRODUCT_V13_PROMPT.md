# Prompt maestro — v1.3 Product Loop

Trabaja sobre `JMoralesP15/HTML-Juego`, partiendo de `feature/instrumentation-consolidation-v1.2.1`, en una rama nueva `feature/product-loop-v1.3`.

Objetivo: dedicar la siguiente iteración principalmente a mejoras visibles y jugables. No añadir herramientas por añadirlas. Mantener intactos IDs, años correctos, calendario, scheduler, modo offline, accesibilidad y scoring/timer mientras no exista evidencia suficiente para experimentar con esas mecánicas.

## 1. Mobile UX

Rediseñar específicamente 390×844 y 375×667. La prioridad visual debe ser: pregunta → año → temporizador → acción primaria. Reducir metadata simultánea, compactar cabecera y escala temporal, mantener targets táctiles adecuados y evitar overflow. El footer de juego puede hacerse persistente si no tapa contenido. No eliminar funciones.

Criterios: sin overflow horizontal, timer y año visibles sin competir con metadata, una acción primaria clara, feedback secuencial legible y navegación intacta.

## 2. Feedback histórico progresivo

Convertir la respuesta en una secuencia explícita: estimar → revelar → ubicar → comprender. Mantener visible primero el hecho principal y hacer expandible el contexto adicional, especialmente `Por qué importa` y `En el mapa del tiempo`. Conservar fuente, ficha completa y toda la información existente. Reducir densidad en móvil sin empobrecer el contenido.

Criterios: el año real sigue dominando, la escala temporal sigue disponible, existe un control accesible de expansión con `aria-expanded`, ninguna fuente o texto se pierde y el feedback sigue funcionando con y sin imagen.

## 3. Riqueza y variedad visual

Reducir la repetición de las láminas editoriales generadas. Mantenerlas offline y originales, pero usar al menos cinco familias visuales determinísticas con composición distinta (por ejemplo orbital, timeline, matriz, señal y cartográfica). No usar imágenes externas sin licencia y procedencia verificadas. No cambiar qué preguntas poseen imágenes documentales existentes.

Criterios: todas las láminas generadas reciben una familia visual, existen al menos cinco familias en el banco y su suma coincide con la cantidad de imágenes editoriales generadas.

## 4. Colección + Repaso como segundo loop

Hacer que Colección deje de ser solo un catálogo. Añadir sets temáticos jugables con progreso de descubrimiento y dominio. Permitir practicar las fechas descubiertas de cada set priorizando las no consolidadas y los errores mayores. En Repaso, añadir una recomendación de `siguiente sesión` basada primero en fechas vencidas, luego categoría débil y finalmente errores persistentes.

Calcular `Learning Gain` localmente usando la misma pregunta respondida en días distintos: `error previo - error nuevo`. Mostrar número de pares, mejora media y proporción de comparaciones con mejora. No inventar resultados cuando no existan pares válidos.

## Restricciones

- No cambiar años, IDs, calendario ni scheduler.
- No cambiar timer de 15 s ni fórmula de bonus en esta iteración.
- No añadir frameworks ni dependencias nuevas.
- Conservar funcionamiento `file://` y sin red.
- No introducir PII.
- Mantener QA existente y añadir pruebas específicas del producto v1.3.
- No hacer merge a `main` automáticamente.
- Abrir PR de revisión contra la rama v1.2.1 de integración.

## QA mínimo

Verificar 390×844 y 375×667 sin overflow; feedback expandible; cinco familias visuales; Colección con seis sets iniciales; Learning Gain entre días; panel de siguiente sesión en Repaso; suite funcional existente, axe y QA visual sin errores de consola.

## Entrega

Documentar qué cambió realmente para el jugador, qué deuda queda y qué parte de la recomendación visual sigue pendiente de curación documental. Crear un PR draft y no fusionarlo automáticamente.