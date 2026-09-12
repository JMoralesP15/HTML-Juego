# Arquitectura v1.7

## Propósito

QUÉ AÑO sigue siendo una aplicación HTML/CSS/JS estática, ejecutable desde `file://` y publicable en GitHub Pages. v1.7 no introduce framework ni bundler: consolida responsabilidades y hace explícita la deuda restante sin cambiar las reglas del juego.

La arquitectura actual debe leerse junto con `CONTEXT_CURRENT_TRUTH.md`, `architecture-v17.json` y los contratos de CI. La documentación histórica v1.2–v1.6 explica evolución, pero no define el runtime vigente.

## Runtime activo

### Contenido y calendario

- `js/content.js`: banco canónico de 300 preguntas y metadatos explícitos.
- `js/scheduler.js`: selección, repetición y reglas del desafío.
- `js/calendar.js`: calendario publicado.
- `js/editorial.js`: normalización/overrides editoriales heredados.
- `js/content-v12.js`: helpers temporales/editoriales históricos. En v1.7 ya no muta el banco para fabricar imágenes o `extendedContext` por cuota.
- `js/curation-v14.js`: clasificación cultural y relaciones derivadas para priorización. No constituye verificación factual.

### Estado y producto

- `js/storage.js`: estado local, migraciones y backup.
- `js/game.js`: núcleo de ronda, vista base y acciones.
- `js/panels.js`: Repaso, Línea temporal, Colección, Estadísticas y diálogos.
- `js/archive-night.js`: identidad/base de render Archivo Nocturno.
- `js/archive-numbering.js`: numeración visible 001–300 como responsabilidad explícita y estable.
- `js/atlas-v12.js`: timer, scoring temporal y renderer Atlas. Sigue siendo una capa conductual histórica cubierta por tests.
- `js/app.js`: delegación de eventos e inicialización.

### Contrato de render y semántica

- `js/runtime-contract.js`: único punto de notificación `onRender/emit` para decoradores y analítica. Mantiene un único wrapper de `setView` como deuda transicional deliberada.
- `js/semantic-contract.js`: añade hooks semánticos estables después del render sin reemplazar `renderGame` ni `renderSummary`.

No hay `MutationObserver` activo como mecanismo de coordinación del runtime.

### Observabilidad

- `js/analytics-config.js`: configuración pública, versión y feature flags.
- `js/analytics-v17.js`: telemetría no bloqueante suscrita al contrato de render. No observa mutaciones del DOM y se desactiva en `file://`, localhost y QA.

### Capas de producto todavía versionadas

- `js/product-v13.js`: Sets, Learning Gain y loop de repaso.
- `js/experience-v14.js`: Commons/open media y ambiente opcional.
- `js/simplification-v15.js`: timer absoluto, simplificación y sincronización de acciones.
- `js/learning-v16.js`: micro-lección, resumen y ficha profunda.

Siguen activos porque contienen comportamiento o contratos que no conviene trasladar en masa sin pruebas de paridad. Son deuda transicional, no capas invisibles de presentación: v1.7 las coordina mediante el contrato explícito de render.

## CSS activo

`index.html` carga cinco hojas:

1. `style.css`: base del producto;
2. `archive-night.css`: identidad estructural heredada;
3. `atlas-v12.css`: instrumento/timer y superficies Atlas;
4. `experience-v17.css`: consolidación de las antiguas hojas v1.3, v1.3 mobile fix, v1.4, v1.5 y v1.6;
5. `interaction-v17.css`: foco visible, reduced motion y contratos transversales de interacción/accesibilidad.

Las hojas `archive-night-polish.css`, `atlas-v12-compat.css`, `product-v13.css`, `product-v13-mobile-fix.css`, `curation-v14.css`, `simplification-v15.css` y `learning-v16.css` ya no participan del cascade activo; las capas retiradas de v1.3–v1.6 fueron consolidadas y los dos parches legacy fueron eliminados del árbol v1.7.

## Reproducibilidad

- `package.json` y `package-lock.json` comparten versión `1.7.0-beta.1`.
- CI comprueba esa coherencia antes de instalar.
- `npm ci` usa el lockfile commiteado y el workflow ya no lo regenera silenciosamente.
- dependencias de QA siguen fijadas.

## Calidad editorial como parte de arquitectura

v1.7 trata procedencia como un contrato estructural:

- `tools/editorial-quality-report.mjs` separa verificación factual, especificidad de fuente y procedencia de media;
- `tools/editorial-review-backlog.mjs` genera la siguiente acción de revisión para las 300 preguntas sin promoverlas a verificadas;
- `editorialVerified` sólo representa revisión explícita;
- una imagen puede ser `documentary`, `project_generated_illustration`, otra clase pendiente o `none`;
- cero láminas sintéticas v1.2/v1.4 se adjuntan al banco para cumplir objetivos de cobertura.

## Deuda estructural aceptada en v1.7

El reporte de arquitectura contabiliza overrides globales de comportamiento en timer, acciones y ficha. v1.7 no intenta llevarlos a cero a cualquier precio. La regla es:

1. retirar coordinación visual/DOM implícita;
2. retirar parches triviales sin propietario;
3. conservar temporalmente overrides conductuales cuando están cubiertos por QA y su migración aumenta superficie de riesgo;
4. trasladarlos a módulos canónicos en v2.0 mediante tests de paridad.

El único lifecycle wrapper permitido en v1.7 es el de `setView` dentro de `runtime-contract.js`. Su objetivo futuro es que el renderer canónico emita el hook directamente.

## Gates arquitectónicos v1.7

CI exige actualmente:

- hojas activas ≤ 6;
- `MutationObserver` de runtime = 0;
- lifecycle assignments ≤ 1;
- archivos activos cuyo nombre sea `compat`, `fix` o `polish` = 0;
- lockfile/version coherentes;
- banco/calendario/scheduler íntegros;
- accesibilidad, regresión visual y browser QA verdes antes de declarar la versión lista.

Estos gates son límites de riesgo, no una función objetiva de “menos archivos = mejor producto”. Si un refactor reduce un contador pero empeora paridad funcional, el refactor es un fracaso con una planilla muy ordenada.