# Metaprompt v1.7 — Hardening final para quedar lista para revisión humana

Actúa simultáneamente como arquitecto front-end senior, editor técnico, QA lead y evaluador de proyecto. Toma como entrada el PR #8 después de la primera consolidación y `V17_EXECUTION_DIFF_1.md`. No diseñes una v1.8 disfrazada: esta pasada existe para cerrar contradicciones y blockers de v1.7.

## Resultado esperado

Al terminar, produce una conclusión binaria y trazable:

- `READY_FOR_HUMAN_REVIEW`, o
- `NOT_READY`, enumerando blockers observados.

“Ready” no significa deuda cero. Significa que la deuda restante está acotada, clasificada, cubierta por contratos y no contradice las invariantes de v1.7.

## 1. Revalidar primero, no asumir

Lee el head actual y su CI. Reconstruye la matriz de estado usando únicamente observaciones actuales:

- Node/contracts;
- banco/calendario/scheduler;
- accesibilidad;
- regresión/visual browser QA;
- arquitectura;
- reproducibilidad;
- procedencia editorial y de imágenes.

No reutilices como hecho un valor de un run anterior si el head cambió.

## 2. Cerrar deuda estructural de bajo riesgo

### `archive-night-polish.js`

Si sólo redefine una función pequeña y existe un propietario canónico obvio, integra su comportamiento al propietario y elimina el archivo/carga. Conserva exactamente la numeración visible mediante test existente o prueba de paridad nueva.

### Hook de render

Evalúa si `runtime-contract.js` puede dejar de monkey-patchear `setView` haciendo que el propietario canónico notifique explícitamente al runtime. Hazlo sólo si:

- el cambio es local;
- no altera orden de render;
- los suscriptores siguen ejecutándose después de que el DOM esté actualizado;
- existe QA que cubra pregunta, feedback, resumen y vistas secundarias.

Si exige reescribir `game.js/app.js` de forma desproporcionada, conserva el único wrapper y decláralo deuda transicional aceptable.

### Behavior overrides

No migres en masa los overrides del timer, scoring, persistencia o detalle. Para cada override restante clasifica:

- `critical_behavior_override`: afecta reglas del juego;
- `presentation_behavior_override`: sincroniza UI sin cambiar regla;
- `legacy_duplicate_override`: sustituible con riesgo bajo.

Sólo elimina los `legacy_duplicate_override` demostrables. El contador no es un KPI de negocio.

## 3. Revisión de tests tras consolidación

Busca contratos que todavía exijan elementos retirados por decisiones posteriores. Para cada test fallido decide explícitamente:

- regresión real: corregir producto;
- contrato obsoleto: corregir test y documentar la decisión;
- comportamiento ambiguo: no modificar hasta resolver especificación.

No usar `skip`, tolerancias laxas ni borrado de asserts para obtener verde.

## 4. Backlog editorial operativo por las 300 preguntas

Amplía el reporte para que cada pregunta tenga una acción editorial siguiente, sin navegar ni inventar 281 verificaciones en masa.

Para cada hito determina:

- prioridad factual P0–P3;
- proveedor/familia de fuente sugerida por tipo de hito;
- query editorial sugerida que incluya entidad + evento + año;
- prioridad de imagen;
- proveedor de imagen sugerido;
- si la ausencia de imagen es aceptable;
- motivo de priorización.

Familias recomendadas, adaptables por pregunta:

- Ciencia/espacio: organismo científico oficial, universidad, Nobel, NASA/JPL/CERN, artículo académico cuando corresponda.
- Historia/política: archivo, biblioteca nacional, organismo internacional, institución pública, museo histórico.
- Chile: BCN, Memoria Chilena/Biblioteca Nacional, archivos e instituciones chilenas específicas.
- Tecnología: fabricante/archivo corporativo, museo tecnológico, Computer History Museum, institución que documente el lanzamiento.
- Cine: archivo/museo cinematográfico, BFI/Academy/filmoteca, distribuidor o estudio sólo cuando documente la fecha.
- Música: artista/sello/archivo oficial, Grammy/Library of Congress/museos cuando sea pertinente.
- Videojuegos: fabricante/editor/desarrollador, archivo/museo del videojuego; referencias generales sólo como puente.
- Cultura: museo, biblioteca, archivo nacional, Smithsonian, LoC, Europeana o institución temática.

Para imágenes:

1. Wikimedia Commons con licencia abierta;
2. Smithsonian Open Access/CC0 cuando aplique;
3. Library of Congress con revisión de rights statement por objeto;
4. Europeana cuando el rights statement permita reutilización;
5. archivo oficial con licencia explícita;
6. ilustración local claramente rotulada;
7. ninguna imagen.

Genera un reporte determinista `reports/editorial-review-backlog-v17.json`. Es un plan de revisión, no verificación factual.

## 5. Revisión del esquema de imágenes

El reporte debe diferenciar al menos:

- documentary/open rights known;
- documentary/provenance known, rights not yet structured;
- project illustration;
- remote open enhancement;
- none.

No conviertas automáticamente derechos desconocidos en dominio público. Para los tres documentales locales, si no existe evidencia de licencia estructurada en el banco, mantenlos como deuda de rights metadata aunque la fuente esté identificada.

## 6. Gate de release v1.7

Blockers obligatorios:

- lockfile coherente y `npm ci` reproducible;
- 0 vulnerabilidades npm de severidad reportada por `npm audit` actual;
- 28/28 o más contratos Node verdes sin regresión;
- 300 preguntas, 1096 días calendario sin mismatch, schedule válido;
- 0 `MutationObserver` de coordinación de runtime;
- 0 patch CSS/JS activos de tipo `compat/fix/polish` cuando su contenido tenga propietario canónico;
- accesibilidad completa verde;
- visual/regression verde;
- 0 filler editorial sintético v1.2/v1.4;
- 0 preguntas sin URL de fuente;
- 0 falsos positivos de `editorialVerified` introducidos automáticamente;
- backlog editorial 300/300 generado;
- documentación de current truth coherente con el código.

No son blockers por sí solos:

- 281 fuentes generales pendientes, si están visibles y priorizadas;
- ausencia de foto en un hito;
- behavior overrides cubiertos por QA cuya migración exceda el riesgo de esta versión;
- concentración geográfica, si se reporta como descriptor y roadmap.

## 7. Metaanálisis final

Después de implementar y ejecutar QA, revisa el propio resultado:

- ¿algún indicador mejoró sólo porque redefinimos su denominador?
- ¿algún test fue actualizado para ocultar un defecto?
- ¿algún contenido quedó presentado con más certeza de la que soporta su evidencia?
- ¿el nuevo backlog es accionable o sólo un JSON ornamental?
- ¿la arquitectura tiene propietarios más claros o sólo archivos con nombres nuevos?
- ¿se mantuvo v1.5 pública intacta y PR #8 sin merge/publicación?

Sólo emite `READY_FOR_HUMAN_REVIEW` si las respuestas anteriores no revelan un blocker. Actualiza el PR con métricas observadas del head final, pero mantenlo draft y no publiques.