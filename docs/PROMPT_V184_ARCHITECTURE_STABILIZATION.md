# Prompt técnico ejecutable — QUÉ AÑO v1.8.4

## Rol

Actúa como ingeniero senior de arquitectura frontend y QA para el repositorio `JMoralesP15/HTML-Juego`. Trabaja sobre evidencia del runtime real, no sobre nombres de ramas ni supuestos históricos.

## Base y rama

- Base obligatoria: `feature/project-traceability-audit-v1.8.3`.
- Rama de trabajo: `feature/architecture-stabilization-v1.8.4`.
- No modificar `main`.
- Abrir PR en modo Draft desde v1.8.4 hacia v1.8.3.
- No hacer merge.

## Objetivo

Ejecutar una primera remediación arquitectónica de bajo riesgo basada en la auditoría v1.8.3. El objetivo no es un refactor masivo, sino mejorar confiabilidad de QA, corregir el P0 visible de Learning Feedback, convertir la precedencia de media en una regla determinística, impedir regresión de deuda mediante budgets y establecer guardrails para futuras migraciones.

## Workstream 1 — QA visual determinista

Editar `tests/regression.spec.mjs` para que:

1. La inicialización deje `onboardingSeen=true` y cierre explícitamente `#detailDialog` si quedó abierto.
2. Antes de fotografiar una pregunta espere `.atlas-v12.is-question`.
3. Después de responder espere `.atlas-v12.is-answered`.
4. Pregunta y feedback usen screenshots de viewport, no `fullPage`.
5. El viewport móvil siga siendo exactamente `390x844`.
6. Summary puede conservar `fullPage` cuando la altura completa sea el objeto de prueba.
7. No ejecutar ni introducir `--update-snapshots` en CI.

Si las snapshots congeladas fallan porque el test anterior protegía el estado incorrecto, conservar los artifacts y actualizar únicamente las baselines cuya nueva imagen haya sido inspeccionada y aprobada visualmente. Nunca regenerar todas las snapshots por conveniencia.

## Workstream 2 — Learning Feedback narrativo

Editar `js/learning-v16.js` y `tests/v16-learning-ux.spec.mjs`.

La tarjeta primaria de aprendizaje no debe mostrar al usuario estas categorías editoriales internas:

- `Qué fue`
- `Por qué importa`
- `Dato para recordar`
- `La fecha es el punto de entrada...`

Mantener la misma información semántica. Transformarla en uno o dos párrafos naturales bajo `APRENDIZAJE ESENCIAL`. Mantener `Profundizar` como progressive disclosure para el contexto estructurado.

Los tests deben verificar de forma negativa que las etiquetas internas no aparecen en `.v16-learning-card`, y positivamente que existe al menos un párrafo narrativo, que no hay más de dos y que `Profundizar` sigue operativo.

No modificar contenido factual, IDs, años ni procedencia editorial para conseguir este resultado.

## Workstream 3 — política determinística de media

Editar `js/experience-v14.js` y ampliar `tests/curation-v14.spec.mjs`.

Política obligatoria:

`media curada v1.8 > Commons automática v1.4 > ausencia de imagen`.

`experience-v14.js` debe:

1. No iniciar enriquecimiento Commons si `q.v18Media` ya existe.
2. Volver a comprobar `q.v18Media` después del `await findOpenMedia(q)`.
3. No reemplazar un figure marcado como `data-v18="1"`.
4. Mantener Commons como progressive enhancement para preguntas sin media curada.

Agregar un test browser que reproduzca una respuesta Commons deliberadamente tardía. La prueba debe demostrar que, aun cuando la búsqueda automática comenzó antes de instalarse la media v1.8, la respuesta tardía no sobreescribe la media curada final.

## Workstream 4 — budget arquitectónico de no regresión

Crear un baseline versionado y un guard ejecutable.

Límites máximos iniciales derivados de v1.8.3:

- active scripts: 24
- active stylesheets: 5
- static collisions: 31
- behavior patches: 17
- MutationObservers: 0
- render subscriptions: 7
- CSS `!important`: 811
- repeated CSS selectors: 99

Límites mínimos:

- runtime classification coverage: 100%
- ownership ratio: 6/18 = 33.3%
- direct test protection ratio: 14/18 = 77.8%

Implementar:

- `config/architecture-budget-v184.json`
- `tools/architecture-budget-v184.mjs`
- script npm `guard:architecture:v184`
- paso de GitHub Actions después de regenerar la auditoría v1.8.3
- artifact `reports/architecture-budget-v184.json`

El guard debe permitir mejoras y fallar sólo cuando una métrica cruza el budget en dirección negativa. Event listeners pueden permanecer inicialmente como métrica informativa para evitar convertir una señal de contexto en una regla arbitraria.

## Workstream 5 — gobernanza de ownership

Crear `docs/ARCHITECTURE_GUARDRAILS_V184.md` y documentar al menos estas reglas:

1. Un contrato debe tender a un solo writer efectivo.
2. No añadir nuevos monkey patches salvo adaptadores temporales documentados.
3. Toda nueva capa versionada que intervenga un contrato existente debe declarar owner reemplazado, owner objetivo, test de paridad y condición/versión de retiro.
4. Un símbolo shadowed es únicamente `OBSOLETE_CANDIDATE`; nunca autoridad suficiente para borrar un archivo.
5. Content Bank, Calendar, Scheduler y Storage requieren PR dedicado si se cambia su comportamiento.
6. Renderer y timer/scoring se migrarán por responsabilidad y con tests de paridad, no mediante eliminación masiva.
7. Analítica y media remota nunca deben bloquear el juego.
8. CI nunca autoacepta una regresión visual actualizando snapshots antes de comparar.

## Invariantes prohibidos

No modificar en v1.8.4:

- los 300 IDs o años;
- calendario ni scheduler;
- fórmula de scoring;
- duración/lógica contractual del timer salvo tests no funcionales;
- schema o compatibilidad de storage;
- Repaso, Sets o Learning Gain;
- reglas de persistencia;
- renderer canónico de Atlas;
- `renderGame` o `renderSummary` para iniciar una consolidación estructural;
- CSS mediante limpieza masiva;
- snapshots de forma automática;
- `main`.

## Criterios de aceptación

La iteración se considera técnicamente aceptable si:

- Learning Feedback primario cumple el contrato narrativo.
- El test de precedencia asíncrona de media pasa y la media v1.8 queda final.
- El guard de arquitectura pasa sin empeorar ningún budget.
- MutationObservers permanece en 0.
- El banco sigue en 300 IDs únicos y años válidos.
- Unit/contract y accessibility continúan verdes.
- Las regresiones visuales se evalúan contra snapshots congeladas.
- Cualquier baseline visual actualizada queda limitada a imágenes inspeccionadas individualmente.
- No se modifica `main` ni se hace merge.

## Evidencia final requerida

Reportar:

- rama y head SHA;
- lista de commits;
- archivos cambiados;
- estado de CI por suite;
- métricas arquitectónicas antes/después;
- snapshots que cambiaron, con motivo;
- estado de `MEDIA_ASYNC_PRECEDENCE`;
- estado de Learning Feedback;
- riesgos residuales;
- PR Draft.

No declarar una deuda resuelta sólo porque el código fue editado. Cerrar el hallazgo únicamente cuando exista evidencia de CI o browser que sostenga la conclusión.
