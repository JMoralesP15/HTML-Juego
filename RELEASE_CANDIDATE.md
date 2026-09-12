# QUÉ AÑO 1.1.2 RC

Objetivo: congelar el loop principal antes de v1.2.

## Cambios principales
- Pregunta desktop recompuesta para aprovechar el ancho disponible.
- YearSelector separado en cinco zonas inequívocas y protegido contra solapamientos.
- Ritmo vertical móvil corregido para pantallas altas y bajas.
- Feedback reorganizado como resultado + contexto editorial.
- TemporalScale adaptativa por magnitud del error, evitando falsa precisión en distancias grandes.
- Resumen convertido en cierre editorial con puntuación dominante y firma navegable de la partida.
- Eliminado el modal redundante “Tus respuestas”; cada hito del resumen abre su propio contexto.
- Progreso de rondas adaptable al tamaño real de la sesión.
- QA Playwright ampliado a estados cercanos, lejanos, revelados, resumen móvil, repaso y foco.

## Deuda residual esperada
- B / v1.2: ampliar cobertura visual del banco y la Colección.
- C / editorial: revisar fuentes genéricas heredadas.
- C / editorial: ampliar extendedContext más allá de las 19 preguntas actuales.
- D / nice-to-have: regresión pixel-perfect automatizada contra snapshots aprobados.

## Freeze
Si las pruebas funcionales, audit y Playwright pasan en el entorno QA del usuario y la revisión visual no detecta bloqueadores, Pregunta, Feedback y Resumen quedan congelados para v1.2 salvo bug, accesibilidad, regresión o evidencia nueva de usuario.
