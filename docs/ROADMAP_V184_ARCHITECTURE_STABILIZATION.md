# QUÉ AÑO — Roadmap de estabilización arquitectónica v1.8.4

Base: `feature/project-traceability-audit-v1.8.3`.

Objetivo: convertir los hallazgos de la auditoría v1.8.3 en una primera iteración de remediación de bajo riesgo. Esta versión no consolida todavía renderer ni timer/scoring; primero corrige contratos visibles, resuelve una precedencia asíncrona y vuelve exigibles los límites arquitectónicos.

## 1. QA visual determinista

**Problema:** la regresión móvil usaba `fullPage: true` para pregunta/feedback y podía capturar un diálogo abierto. La baseline terminaba midiendo altura documental y estado incidental, no sólo la experiencia objetivo.

**Cambio:** cerrar diálogos de forma explícita, esperar la superficie semántica `.atlas-v12.is-question`/`.is-answered`, usar captura de viewport para pregunta y feedback, y reservar `fullPage` para summary.

**Criterio de aceptación:** pregunta y feedback móvil producen capturas 390×844 estables; ninguna snapshot se actualiza automáticamente.

## 2. Learning Feedback narrativo

**Problema:** la UI primaria mostraba taxonomía editorial interna (`Qué fue`, `Por qué importa`, `Dato para recordar`) y la frase de encuadre “La fecha es el punto de entrada”.

**Cambio:** mantener la misma información, pero presentarla como uno o dos párrafos naturales bajo `APRENDIZAJE ESENCIAL`. `Profundizar` conserva el contexto estructurado bajo demanda.

**Criterio de aceptación:** la tarjeta primaria no contiene las etiquetas internas; sigue mostrando contenido de aprendizaje y `Profundizar`.

## 3. Precedencia explícita de media

**Problema:** Commons v1.4 es asíncrono y podía completar después de la instalación determinística de media curada v1.8.

**Cambio:** `experience-v14.js` debe abstenerse de buscar/instalar media automática cuando exista `v18Media`, y repetir la comprobación después del `await`. También debe respetar un `<figure data-v18="1">` ya instalado.

**Política:** `media curada v1.8 > Commons automática > sin imagen`.

**Criterio de aceptación:** un test browser con Commons deliberadamente tardío mantiene la media curada como resultado final.

## 4. Presupuesto de deuda arquitectónica

**Problema:** la auditoría midió deuda, pero las métricas podían empeorar sin que CI lo impidiera.

**Cambio:** convertir el baseline v1.8.3 en límites de no regresión:

- scripts activos ≤ 24;
- CSS activos ≤ 5;
- colisiones estáticas ≤ 31;
- behavior patches ≤ 17;
- MutationObservers = 0;
- render subscriptions ≤ 7;
- `!important` ≤ 811;
- selectores CSS repetidos ≤ 99;
- classification coverage ≥ 100%;
- ownership ratio ≥ 33,3%;
- direct test protection ≥ 77,8%.

**Criterio de aceptación:** CI falla si una modificación empeora cualquiera de estos límites. Mejorar las métricas no requiere cambiar el baseline.

## 5. Gobernanza de ownership y migraciones

**Problema:** varias generaciones del runtime siguen compartiendo responsabilidad. La consolidación futura de renderer y timer/scoring sería peligrosa si se vuelve a añadir otra capa.

**Cambio:** adoptar reglas explícitas de arquitectura: un contrato debe tender a un único writer efectivo; no se admiten nuevos monkey patches sin plan de retirada; una capa versionada debe declarar owner reemplazado, owner objetivo, test de paridad y condición de retiro; un símbolo shadowed sólo es `OBSOLETE_CANDIDATE` hasta demostrar paridad.

**Criterio de aceptación:** las reglas quedan documentadas y el presupuesto de CI evita que la deuda crezca mientras se preparan v1.8.5 y v1.8.6.

## Fuera de alcance de v1.8.4

- No cambiar 300 IDs/años.
- No cambiar calendario ni scheduler.
- No cambiar fórmula de scoring ni timer.
- No migrar schema de storage.
- No cambiar Repaso, Sets ni Learning Gain.
- No retirar archivos runtime completos.
- No consolidar todavía `renderGame`/`renderSummary`.
- No limpiar masivamente CSS.

## Secuencia posterior

`v1.8.5`: congelar y consolidar `SCORING_TIMER` bajo un owner único.

`v1.8.6`: crear renderer canónico y retirar definiciones shadowed una a una con paridad.

`v1.9`: consolidación progresiva del sistema visual y reducción de cascade CSS.
