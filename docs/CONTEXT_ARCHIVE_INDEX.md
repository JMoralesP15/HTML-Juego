# Índice de contexto histórico y vigencia

Este índice evita que una decisión antigua vuelva a convertirse accidentalmente en requisito actual. Los documentos no se borran: cambian de estatus.

## Canónico / vigente

- `CONTEXT_CURRENT_TRUTH.md`: estado narrativo canónico.
- `PROMPT_V17_ARCHITECTURE_EDITORIAL.md`: mandato de la edición v1.7.
- `V17_META_REVIEW.md`: contradicciones, límites y criterios de cierre v1.7.
- `ARCHITECTURE.md`: referencia técnica general; debe interpretarse junto al reporte v1.7.
- `ANALYTICS.md`: contrato de analítica; métricas conductuales sólo son evidencia cuando existen observaciones reales.

## Vigente como contrato funcional

- `PROMPT_V15_SIMPLIFICATION.md`: mantiene los principios de claridad, timer absoluto, CTA principal y progressive disclosure. Sus selectores y detalles de presentación no son invariantes por sí mismos.
- `PROMPT_V16_LEARNING_UX.md`: mantiene el objetivo de resultado como micro-lección y resumen como aprendizaje. La implementación concreta puede consolidarse.
- `V16_SCREEN_SPEC.md`: referencia visual funcional, subordinada a la implementación v1.7 si el contrato semántico se conserva.

## Histórico / útil para trazabilidad

- `PRODUCT_V13_PROMPT.md`: origen de Sets, Learning Gain y loop de repaso. Sus decoraciones v1.3 no gobiernan la UI actual.
- `PROMPT_V14_CURATION_ATMOSPHERE.md`: origen de curaduría heurística, Commons y ambiente. Las cuotas de fallback y metadata editorial visible están superadas.
- `CONTENT_CURATION_V14.md`: metodología histórica. No transforma score cultural en verificación factual.
- `V15_UI_REVIEW.md`: evidencia de decisiones de simplificación tomadas en v1.5.
- `V16_SENIOR_AUDIT_META_CORRECTION.md`: auditoría que motivó la consolidación v1.7.

## Contexto superado que no debe volver a ser requisito

- cobertura artificial de 180 imágenes o 220 `extendedContext`;
- obligación de rellenar una pregunta sin imagen con placa SVG;
- mostrar metadata interna de archivo, cultura tier o método editorial al jugador;
- conservar literalmente `.answer-signature-item`, `.v13-context-toggle`, `.v15-context-button` u otros selectores de presentación cuando el contrato semántico ya migró;
- interpretar score cultural, HHI regional o presencia de URL como medición de usuarios o fact-checking.

## Regla para nuevos documentos

Todo documento nuevo debe declarar uno de estos estados: `CANONICAL`, `ACTIVE_CONTRACT`, `HISTORICAL_EVIDENCE` o `SUPERSEDED`. Si no lo declara, se considera informativo y no normativo. La humanidad ya inventó suficientes documentos contradictorios sin que este repositorio contribuya gratuitamente.
