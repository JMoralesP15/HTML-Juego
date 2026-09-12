# Roadmap después del baseline

Este documento transforma métricas observadas en decisiones. No asigna prioridad antes de contar con datos suficientes.

## Reglas de decisión

| Señal observada | Diagnóstico plausible | Próxima intervención a evaluar |
|---|---|---|
| Timeout elevado, especialmente en preguntas difíciles | presión temporal excesiva | test 15 s vs 20 s |
| Timeout bajo pero error empeora cuando baja `response_ms` | bonus puede incentivar velocidad sobre precisión | bonus on/off |
| Abandono mobile claramente mayor que desktop | densidad/ergonomía móvil | simplificar jerarquía del instrumento y metadata |
| `feedback_dwell_ms` muy bajo | feedback se omite o no tiene jerarquía suficiente | revisar composición y progresión del feedback |
| `context_opened / feedback_seen` bajo | contexto no descubre valor o CTA débil | progressive disclosure / affordance de contexto |
| `source_opened / context_opened` bajo | fuentes poco relevantes para el flujo | reducir prominencia o mejorar vínculo editorial |
| `review_started` bajo | Repaso no comunica utilidad | revisar CTA y propuesta de valor de Repaso |
| Learning Gain positivo y consistente | repetición produce aprendizaje medible | potenciar Repaso y espaciamiento |
| Learning Gain cercano a cero/negativo | feedback/repetición no consolidan aprendizaje | rediseñar contenido pedagógico antes de gamificar más |
| Collection engagement bajo | Colección no sostiene comportamiento | no ampliar esa sección todavía |
| Completion alta y feedback/contexto altos | loop base sólido | explorar retención, variedad editorial y nuevas capas con prudencia |

## Orden recomendado de análisis

1. Integridad de datos: eventos, duplicados, denominadores y cobertura.
2. Funnel: inicio, primera respuesta, progresión por posición y cierre.
3. Segmentar por viewport/dispositivo, dificultad y categoría.
4. Examinar tiempo vs precisión.
5. Examinar engagement de feedback, contexto, Repaso y Colección.
6. Sólo entonces elegir un experimento.

## Umbral práctico para experimentar

No iniciar cuatro tests simultáneos. Seleccionar una hipótesis con mayor pérdida esperada y suficiente volumen. Como referencia de potencia para una conversión base cercana al 70%: unos 294 usuarios/sesiones por variante permiten detectar aproximadamente +10 pp con alfa 0,05 y potencia 80%; para +5 pp la necesidad sube a alrededor de 1.250 por variante.

## Árbol de decisión para v1.3

- Si el mayor problema es **completar**: priorizar fricción y timer.
- Si se completa pero **no se aprende**: priorizar feedback, contexto y Repaso.
- Si se aprende pero **no se vuelve**: priorizar retorno/ritmo diario y colección sólo si tiene uso real.
- Si UX es estable pero hay deuda técnica que dificulta cambios: consolidar módulos `archive-night`/`atlas-v12` detrás de APIs explícitas.
- Si no hay volumen suficiente: seguir recolectando baseline y hacer investigación cualitativa ligera en vez de fingir significancia con doce personas y mucha esperanza.

## Métricas de performance

Objetivos internos, no resultados actuales:
- LCP < 1,8 s
- CLS < 0,05
- INP < 100 ms

Vercel staging debe utilizarse para medirlos con contexto de red real antes de optimizaciones adicionales.
