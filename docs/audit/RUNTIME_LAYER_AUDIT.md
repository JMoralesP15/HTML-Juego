# Runtime Layer Audit v1.8.3

Scope: inventariar propiedad efectiva y deuda desde lo que `index.html` carga realmente. No se infiere arquitectura desde nombres de archivo ni se elimina código en esta iteración.

## Inventario observado

`index.html` carga 24 scripts y 5 hojas de estilo. Los 29 archivos activos están clasificados en `reports/runtime-file-classification.json`; cobertura 29/29 = 100%.

Orden JS observado: banco → scheduler → calendario → editorial/manifests → content v1.2/curation → storage → engine/panels → Archivo Nocturno → numeración → Atlas → app/runtime contract/semantic contract → analytics → producto v1.3 → experiencia v1.4 → simplificación v1.5 → aprendizaje v1.6 → media v1.8.

CSS observado: `style.css` → `archive-night.css` → `atlas-v12.css` → `experience-v17.css` → `interaction-v17.css`.

## Propiedad efectiva

La deuda principal no es la cantidad de archivos, sino la propiedad múltiple. Casos confirmados:

- `renderGame`: existe en `game.js`, `archive-night.js` y `atlas-v12.js`; Atlas es el constructor efectivo por orden, pero capas posteriores decoran el DOM.
- `commitAnswer`: engine/Atlas y wrapper v1.5 participan en la ruta final.
- timer: Atlas define el mecanismo y v1.5 reemplaza cálculo/start/pause/resume con deadline absoluto.
- learning: v1.6 vuelve a estructurar feedback sobre el resultado de Atlas/v1.5.
- media: v1.8 instala media curada pero v1.4 conserva búsqueda Commons asíncrona; precedencia final requiere prueba dinámica.
- visual: cinco hojas activas participan en la cascade.
- reviewer: consola base y asistida mantienen decisiones separadas.

## Clasificación

- `CANONICAL_ACTIVE`: responsabilidad estable y vigente demostrable.
- `TRANSITIONAL_ACTIVE`: cargado y funcional, pero participa en ownership compartido o transición.
- `LEGACY_REQUIRED`: compatibilidad pequeña todavía consumida.
- `OBSOLETE_CANDIDATE`: símbolo/regla shadowed o sin responsabilidad vigente demostrable; nunca autoriza borrado.
- `UNKNOWN`: evidencia estática insuficiente.
- `REQUIRES_BROWSER`: la precedencia depende de ejecución, asincronía o estado del navegador.

## Herramienta reproducible

`tools/runtime-layer-audit-v183.mjs` lee el orden real de `index.html`, detecta declaraciones/asignaciones funcionales, `window.*`, patches, listeners, MutationObservers, suscripciones al contrato de render, selectores CSS repetidos e `!important`. Produce:

- `reports/runtime-file-classification.json`
- `reports/runtime-ownership.json`
- `reports/global-collisions.json`
- `reports/css-cascade-audit.json`

La detección regex es un inventario estático conservador, no un parser JS completo. Un falso negativo posible se clasifica como límite metodológico, no se rellena por intuición.

## Riesgo central

Una capa posterior puede hacer que una anterior “parezca correcta” ocultándola, reescribiéndola o decorándola. Por eso una captura correcta no demuestra que el owner sea único.
