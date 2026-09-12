# Prompt maestro v1.7 — Resolución final de deuda arquitectónica y editorial

Actúa como consultor senior de producto digital, arquitectura front-end, QA, gobernanza editorial y evaluación de proyectos. Trabaja sobre el PR #8 y la rama `feature/architecture-editorial-consolidation-v1.7`. Tu función no es añadir funcionalidades ni embellecer métricas: debes decidir qué deuda sigue siendo material, resolver la que pueda eliminarse con riesgo controlado y dejar trazabilidad de la que deba permanecer.

## Objetivo

Cerrar v1.7 como una consolidación verificable del producto actual. La versión sólo puede considerarse lista para revisión humana cuando:

1. el CI del head final está completamente verde;
2. los contratos de arquitectura activos dejan de depender de parches visuales o observers de DOM para coordinar el render;
3. `package.json` y `package-lock.json` expresan la misma versión y las mismas dependencias;
4. la procedencia editorial de las 300 preguntas es auditable;
5. ninguna pregunta es declarada `editorialVerified` por inferencia, heurística o mera existencia de una URL;
6. fotografías e imágenes sólo se presentan como documentales cuando su procedencia, relación con el hito y licencia son explícitas;
7. la ausencia de imagen es una salida válida;
8. no se modifica `main`, `infra/pages-setup`, IDs, años, calendario publicado, scheduler, scoring, timer, persistencia, Repaso, Sets, Learning Gain ni compatibilidad offline.

## Jerarquía de evidencia

Usa esta jerarquía y no la inviertas:

1. ejecución de tests/CI y código activo para describir comportamiento observado;
2. especificación vigente para juzgar si ese comportamiento es correcto;
3. evidencia documental o fuente externa específica para validar contenido factual;
4. documentación histórica sólo para explicar decisiones pasadas.

Una fuente genérica, homepage, buscador o artículo no específico no constituye verificación del año del hito. Un `cultureScore` tampoco.

## Fase A — Diagnóstico arquitectónico

Revisa el runtime activo desde `index.html` y cuantifica:

- hojas CSS activas;
- scripts activos;
- `MutationObserver` activos;
- reasignaciones globales de `setView`, `renderGame`, `renderSummary`;
- monkey patches de comportamiento (`commitAnswer`, `nextQuestion`, `setYear`, `openSettings`, `openDetail`, timer);
- archivos cuyo nombre indique `compat`, `fix`, `polish` o versión histórica;
- duplicación de responsabilidades entre v1.2, v1.3, v1.4, v1.5 y v1.6.

Distingue cuatro estados: deuda eliminable ahora, deuda transicional aceptable, deuda riesgosa que exige tests de paridad antes de migrarse y código histórico inactivo.

### Acciones arquitectónicas prioritarias

- llevar las notificaciones de render a un contrato explícito y sin `MutationObserver` de presentación;
- migrar la analítica para consumir ese contrato en vez de observar el DOM;
- eliminar `atlas-v12-compat.js` si sus dos efectos pueden expresarse directamente en el renderer canónico;
- absorber `archive-night-polish.css` y `atlas-v12-compat.css` en la hoja activa apropiada y retirar sus referencias;
- integrar `archive-night-polish.js` en su propietario canónico si sólo redefine `archiveNumber`;
- evitar reescrituras masivas del motor si la reducción de un contador no compensa el riesgo funcional;
- no considerar un override de comportamiento resuelto hasta que exista paridad funcional en tests.

## Fase B — Lockfile y reproducibilidad

Normaliza `package-lock.json` para que el paquete raíz coincida exactamente con `package.json` (`1.7.0-beta.1`) y conserva dependencias fijadas. El CI debe usar el lockfile como entrada reproducible, no regenerarlo silenciosamente antes de `npm ci`. Si se requiere regeneración, hazla una vez, commitéala y luego usa `npm ci` sin mutar el lock en cada ejecución.

## Fase C — Auditoría editorial real

Construye una matriz de procedencia para las 300 preguntas. Como mínimo registra por pregunta:

- `id`, título, año, categoría, región;
- URL de fuente actual y dominio;
- tipo de fuente: `primary_institutional`, `authoritative_secondary`, `general_reference`, `weak_or_generic`;
- especificidad: `item_specific`, `topic_specific`, `homepage_or_generic`;
- estado factual: `verified`, `source_specific_needs_human_check`, `generic_needs_replacement`, `missing`;
- qué afirmación se pretende validar: fecha/año, contexto, importancia;
- procedencia de imagen, licencia, tipo y relación con el hito;
- indicador de si la imagen es documental, ilustrativa o ausente.

`editorialVerified=true` sólo puede conservarse o añadirse cuando exista evidencia específica que soporte el dato de la pregunta. No promociones estados por reglas automáticas.

### Fuentes y complementos

Para contexto factual prioriza:

1. instituciones oficiales, archivos, museos, organismos científicos, universidades y sitios oficiales de la obra/producto cuando documenten la fecha;
2. fuentes secundarias autoritativas;
3. referencias generales sólo como puente para localizar una fuente específica.

Para imágenes prioriza:

1. Wikimedia Commons con licencia abierta y ficha de atribución;
2. archivos institucionales con licencia reutilizable explícita;
3. assets locales documentales cuya procedencia esté registrada;
4. ninguna imagen, antes que una imagen dudosa o meramente decorativa.

No uses bancos comerciales como sustituto automático de evidencia histórica. Herramientas de edición de imagen pueden servir para preparar un asset ya validado, nunca para crear evidencia documental.

## Fase D — Estrategia por lotes

No intentes fingir revisión manual de 281 preguntas en una sola regla. Haz triage cuantitativo:

- lote 1: preguntas ya `editorialVerified`, comprobar coherencia y no degradarlas;
- lote 2: fuente específica pero sin flag, priorizar para revisión factual;
- lote 3: fuente genérica, reemplazar por fuente específica cuando sea viable;
- lote 4: imágenes documentales, verificar crédito/licencia/relevancia;
- lote 5: imágenes ilustrativas o dudosas, reclasificar o retirar.

El criterio de salida de v1.7 no es “300/300 verificadas” si eso exige inventar certeza. Es que la deuda esté clasificada, que no haya falsos positivos de verificación y que el pipeline impida volver a ocultarla.

## Fase E — QA y aceptación

Ejecuta como mínimo:

- unit/contract tests;
- audit de banco/calendario/scheduler;
- reporte de arquitectura;
- reporte editorial/procedencia;
- accesibilidad;
- regresión visual;
- visual browser QA;
- `npm audit`.

Corrige fallos reales. Si un test contradice una decisión vigente, actualiza el contrato de prueba con justificación explícita, no lo debilites para obtener verde.

## Fase F — Comparación antes/después

Entrega una tabla de diferencias con, como mínimo:

- CI: antes/después;
- estilos activos;
- patch styles activos;
- observers;
- lifecycle overrides;
- behavior overrides;
- versión lockfile;
- preguntas con fuente;
- preguntas con fuente específica;
- preguntas verificadas;
- preguntas pendientes por fuente genérica;
- imágenes totales/documentales/con licencia conocida;
- imágenes generadas artificialmente;
- cobertura de texto de aprendizaje.

Separa estrictamente `observado`, `derivado`, `objetivo` y `recomendación`.

## Regla de cierre

No publiques ni merges. Cuando el head final esté verde, realiza un metaanálisis final: busca contradicciones entre política, código, tests y reportes. Sólo declara “v1.7 lista para revisión humana” si no hay blockers de arquitectura, reproducibilidad, QA o falsos positivos editoriales. La deuda factual pendiente puede permanecer, pero debe estar visible, priorizada y no disfrazada como verificación.