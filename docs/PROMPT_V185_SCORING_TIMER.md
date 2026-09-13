# QUÉ AÑO — Prompt técnico v1.8.5

## Objetivo
Consolidar `SCORING_TIMER` bajo un único owner efectivo, preservando exactamente el comportamiento observable de v1.8.4.

## Base y rama
- Base: `feature/architecture-stabilization-v1.8.4` en el head validado por CI.
- Rama de trabajo: `v185-scoring-timer`.
- No modificar `main` ni hacer merge automático.

## Alcance
1. Congelar por tests el contrato actual: 15 s, deadline absoluto, pausa de repaint sin detener reloj real, resume, timeout, `No lo sé`, bonus temporal, campos persistidos y compatibilidad legacy.
2. Convertir `js/atlas-v12.js` en owner único del timer y scoring temporal.
3. Retirar de `js/simplification-v15.js` las redefiniciones de `qaTimerComputeRemaining`, `qaTimerStart`, `qaTimerPause`, `qaTimerResume` y las mutaciones equivalentes de `window.__QA_TIMER__`; v1.5 puede conservar telemetría y presentación que no sean dominio timer/scoring.
4. Mantener sin cambios la fórmula `qaTimeBonus`, `QA_TIMER_DURATION_MS=15000`, `QA_TIMER_SCORING_VERSION='timer-v1'` y la semántica de `commitAnswer`.
5. Regenerar auditoría y endurecer el architecture budget sólo después de medir la mejora real.

## Fuera de alcance
No consolidar renderer, no limpiar CSS, no cambiar contenido, scheduler, calendar, storage schema, Repaso, Sets, Learning Gain ni media.

## Aceptación
- Todo QA verde.
- Un solo writer cargado para las funciones del timer.
- `SCORING_TIMER` pasa de `CONFLICT` a `UNIQUE` en el registro contractual.
- `ownership_ratio` esperado mínimo: 7/18 = 38,9% si la auditoría confirma la consolidación.
- Las colisiones/behavior patches no pueden aumentar y el baseline se reduce cuando la medición lo justifique.
