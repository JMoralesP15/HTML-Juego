# Analítica de producto v1.2.1

## Principios

PostHog se integra como dependencia opcional. El juego debe cargar, responder y guardar progreso aunque el SDK, DNS o red fallen. La telemetría se desactiva en `file://`, localhost y QA automatizado.

No se envían nombres, correos, texto libre ni otra PII. Se usa un identificador efímero de sesión generado en memoria para relacionar eventos de una ronda. No se habilita session recording ni autocapture desde el cliente.

## Eventos instrumentados

Eventos mínimos del roadmap:

- `session_started`
- `question_seen`
- `answer_submitted`
- `time_expired`
- `date_revealed`
- `feedback_seen`
- `context_opened`
- `source_opened`
- `summary_seen`
- `review_started`
- `collection_opened`

Eventos auxiliares:

- `landing_viewed`, denominador para conversión de inicio;
- `feedback_exited`, contiene `feedback_dwell_ms`;
- `review_opened`;
- `session_exited`.

Propiedades permitidas incluyen versión, modo, posición, ID de pregunta, categoría, subcategoría, dificultad, región, año verdadero, año estimado, error absoluto, tiempo de respuesta, estado del resultado, tipo de imagen, timeout, skip, puntos y bonus temporal. No se captura texto libre.

## Funnel principal

`landing_viewed → session_started → question_seen → answer_submitted → summary_seen`

El funnel solicitado por producto puede comenzar en `session_started`; `landing_viewed` permite además estimar qué proporción de visitas efectivamente inicia una sesión.

## Métricas definidas

1. Start conversion = sesiones iniciadas / landing views.
2. Completion rate = `summary_seen` / `session_started`.
3. Abandonment = 1 - completion rate.
4. Abandono por pregunta = última `question_seen` sin cierre de ronda.
5. Timeout rate = `time_expired` / `question_seen`.
6. No lo sé = respuestas con `skipped=true` / `question_seen`.
7. MAE = media de `error_abs`, excluyendo skip.
8. Mediana de error absoluto.
9. Tiempo de respuesta = `response_ms`.
10. Feedback dwell = `feedback_dwell_ms` de `feedback_exited`.
11. Context engagement = `context_opened` / `feedback_seen`.
12. Source engagement = `source_opened` / `context_opened`.
13. Review conversion = `review_started` / sesiones elegibles.
14. Collection conversion = `collection_opened` / `summary_seen` o visitas, según pregunta analítica.
15. D1 y D7 retention, una vez exista volumen real.
16. Rendimiento por categoría/dificultad.
17. Timeout por dificultad.
18. Relación velocidad-precisión mediante `response_ms` y `error_abs`.

## Learning Gain

Para una pregunta repetida por el mismo identificador anónimo persistente disponible en PostHog o, preferentemente, mediante los datos locales agregados que se decida enviar sin PII:

`Learning Gain = MAE anterior - MAE repetición`

`Learning Gain % = (MAE anterior - MAE repetición) / MAE anterior`, sólo si el error anterior es mayor que cero.

Segmentos recomendados: dificultad, categoría, días desde el intento anterior y estado inicial. Learning Gain mide mejora de desempeño, no retención de usuarios.

Nota metodológica: la implementación v1.2.1 no envía un identificador personal persistente. Por tanto, antes de calcular Learning Gain longitudinal entre visitas hay que decidir explícitamente si se adopta un identificador anónimo local estable o si se calcula dentro del almacenamiento local y se envía sólo el resultado agregado. Esto evita disfrazar una decisión de privacidad como si fuera una mera consulta SQL.

## Feature flags preparadas

Todas permanecen **inactivas durante baseline**:

- `que-ano-timer-duration`: 15 s vs 20 s;
- `que-ano-speed-bonus`: bonus activado vs desactivado;
- `que-ano-progressive-context`: contexto completo vs progressive disclosure;
- `que-ano-compact-summary`: resumen actual vs compacto.

La variante, cuando exista, se adjunta a eventos mediante propiedades `experiment_*`. Ninguna flag altera actualmente gameplay.

## Tamaños de muestra de referencia

Con proporción base cercana a 70%, alfa 0,05 y potencia 80%:

| Cambio mínimo | Sesiones aproximadas por variante |
|---|---:|
| +5 pp | 1.250 |
| +8 pp | 470 |
| +10 pp | 294 |
| +15 pp | 121 |

Con menos tráfico, los resultados deben tratarse como direccionales y no como evidencia confirmatoria.

## Objetivos internos iniciales

No son resultados observados:

- Completion > 75%
- Timeout < 10%
- Feedback dwell 4–12 s
- Review conversion > 20%
- Collection conversion > 15%

Se recalibran después de un baseline real.
