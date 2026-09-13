# QUÉ AÑO — Guardrails de arquitectura desde v1.8.4

Estos guardrails nacen de la auditoría v1.8.3. Su propósito no es congelar el producto, sino impedir que nuevas features vuelvan a aumentar ownership múltiple y layering accidental.

## 1. Un contrato, un writer efectivo

Cada contrato debe tener un owner objetivo explícito. Puede haber múltiples consumidores, adaptadores o render subscribers, pero una nueva feature no debe crear un segundo writer permanente de la misma responsabilidad.

Cuando durante una migración existan dos writers, el PR debe declarar cuál es el owner actual, cuál será el owner final y qué condición permite retirar el anterior.

## 2. Nuevos monkey patches están prohibidos por defecto

No introducir redefiniciones de funciones globales del tipo `const base = fn; fn = function (...) { ... }` como solución permanente.

Un adapter temporal sólo es admisible cuando el PR documenta:

- símbolo intervenido;
- owner reemplazado;
- owner objetivo;
- razón de compatibilidad;
- test de paridad;
- condición y versión de retiro.

## 3. Las capas versionadas deben tener salida

No añadir una nueva capa `*-vNN.js` que simplemente se cargue después de las anteriores sin plan de convergencia. Toda capa transitoria debe declarar el contrato que migra y su condición de retirada.

Una versión nueva puede agregar capacidades, pero no debe convertirse silenciosamente en otro propietario de un contrato existente.

## 4. Shadowing no autoriza borrado

Todo símbolo anterior que quede shadowed se clasifica como `OBSOLETE_CANDIDATE` como máximo. Su eliminación requiere:

1. owner sustituto explícito;
2. test de paridad conductual;
3. QA visual sin actualización automática de baseline;
4. validación de persistencia cuando intervenga estado;
5. comparación de métricas arquitectónicas después del retiro.

## 5. Núcleo protegido

Los contratos `CONTENT_BANK`, `SCHEDULER`, `CALENDAR` y `STORAGE` tienen ownership único y deben tratarse como núcleo protegido.

Cambios funcionales en cualquiera de ellos requieren un PR dedicado y tests específicos. Una migración visual, editorial o de renderer no debe aprovechar para modificar estos contratos.

## 6. Renderer se migra por responsabilidad

La futura consolidación de `RENDER_GAME` no se realizará borrando de una vez `game.js`, `archive-night.js` o Atlas.

La secuencia debe ser:

1. congelar el comportamiento visible con tests;
2. elegir renderer canónico;
3. migrar una superficie: pregunta, feedback o summary;
4. retirar una definición shadowed;
5. ejecutar QA y presupuesto arquitectónico;
6. continuar con la siguiente superficie.

## 7. Timer/scoring requiere contrato matemático previo

Antes de consolidar `SCORING_TIMER` deben existir tests que definan de forma observable:

- cálculo de tiempo restante;
- pause/resume;
- expiración por deadline;
- respuesta por timeout;
- puntos base;
- bonus temporal;
- persistencia de los campos temporales.

No cambiar fórmula y ownership en el mismo paso sin una baseline contractual previa.

## 8. Media y analítica son progressive enhancement

La falta, latencia o error de media remota y analytics nunca debe impedir iniciar, responder, guardar o finalizar una partida.

Precedencia de media desde v1.8.4:

`curada v1.8 > automática Commons > sin imagen`.

## 9. Snapshots no se autoaceptan

CI compara primero contra snapshots congeladas. Nunca debe ejecutar `--update-snapshots` como parte del workflow normal antes de evaluar regresión.

Una baseline visual sólo cambia cuando:

- existe un cambio visual intencional;
- la captura actual fue inspeccionada;
- se actualiza únicamente la imagen afectada;
- el PR documenta el motivo.

## 10. Budgets de deuda son gates

Los límites definidos en `config/architecture-budget-v184.json` son techos de no regresión. Una feature puede mejorar cualquier métrica sin modificar el baseline. Empeorarla exige una decisión arquitectónica explícita, evidencia y actualización deliberada del budget.

A medida que se retiren capas, los máximos deben reducirse. No mantener artificialmente los valores iniciales como permiso perpetuo para 31 colisiones o 811 `!important`.

## 11. Evidencia según el tipo de problema

- Git demuestra genealogía.
- Análisis estático demuestra carga, definiciones y señales de colisión.
- Browser demuestra precedencias dependientes de interacción o asincronía.
- Tests de contrato demuestran paridad observable.
- Screenshots demuestran salida visual, no lógica interna.

No sustituir una categoría de evidencia por otra sólo porque sea más cómoda.

## 12. Definición de mejora arquitectónica

Una iteración de arquitectura debe mejorar al menos una de estas propiedades sin empeorar las restantes de forma no justificada:

- menos owners concurrentes;
- menos behavior patches;
- menos colisiones;
- menos cascade accidental;
- mayor protección directa de contratos;
- mayor determinismo en runtime y QA.

Añadir funcionalidad sin mover ninguna de estas métricas puede ser una buena feature, pero no debe presentarse como una mejora arquitectónica.
