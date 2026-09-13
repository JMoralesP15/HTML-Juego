# Runtime Layer Audit v1.8.2

Scope: identificar propiedad y obsolescencia; no limpiar.

## Observado
`index.html` carga 5 CSS y 24 JS. Conviven base, Archivo Nocturno, Atlas y capas v1.3–v1.8.

La cadena de render activa incluye definiciones históricas y decoradores posteriores. `game.js`, `archive-night.js` y `atlas-v12.js` definen/han definido renderers globales; v1.3–v1.8 después modifican DOM o comportamiento.

## Clasificación
- CANONICAL_ACTIVE: banco, scheduler, calendario, storage, app, runtime contract, analytics v17, evidencia/manual v18.
- TRANSITIONAL_ACTIVE: `game.js` (parcial), `archive-night.js`, `atlas-v12.js`, `content-v12.js`, `curation-v14.js`, `product-v13.js`, `experience-v14.js`, `simplification-v15.js`, `learning-v16.js`, `experience-v17.css`.
- LEGACY_REQUIRED: compatibilidades pequeñas aún consumidas, p.ej. numeración de archivo.
- OBSOLETE_CANDIDATE: símbolos previos que la auditoría estática detecte como shadowed. No implica que el archivo completo sea eliminable.

## Riesgo principal
La deuda no es el número de archivos sino la propiedad múltiple: una capa posterior puede hacer que una anterior “parezca correcta” ocultándola o sobrescribiéndola.

## Regla
Ninguna marca de obsolescencia autoriza borrado. Retirada futura exige test de paridad del comportamiento que hoy provee el propietario efectivo.
