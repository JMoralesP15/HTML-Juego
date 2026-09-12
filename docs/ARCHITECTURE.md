# Arquitectura v1.2.1

## Principio de estabilización

v1.2.1 conserva la arquitectura estática y offline. No introduce framework ni bundler porque el coste de migración sería mayor que la deuda que pretende resolver esta versión.

## Capas de runtime observadas

### Contenido y calendario
1. `js/content.js`: banco base.
2. `js/scheduler.js`: reglas de selección y repetición.
3. `js/calendar.js`: calendario publicado.
4. `js/editorial.js`: utilidades editoriales.
5. `js/content-v12.js`: ampliación de contexto y placas editoriales v1.2.

### Estado y juego
6. `js/storage.js`: persistencia local y backup.
7. `js/game.js`: estado de ronda y gameplay base.
8. `js/panels.js`: colección, estadísticas y vistas auxiliares.

### Evolución visual
9. `js/archive-night.js` y `js/archive-night-polish.js`: identidad Archivo Nocturno.
10. `js/atlas-v12.js` y `js/atlas-v12-compat.js`: instrumento temporal, timer, scoring y compatibilidad v1.2.
11. `js/app.js`: inicialización y eventos de interfaz.

### Observabilidad
12. `js/analytics-config.js`: configuración pública y flags.
13. `js/analytics.js`: telemetría no bloqueante.

## Deuda observada

`atlas-v12.js` envuelve/redefine funciones globales de versiones previas. La técnica permitió evolucionar el producto con rapidez, pero eleva el acoplamiento y dificulta aislar responsabilidades. Los CSS también mantienen cinco capas acumulativas.

No se realiza una reescritura profunda en v1.2.1. Cambiar simultáneamente arquitectura, gameplay, analítica y estilos convertiría una versión de estabilización en un experimento sin grupo control, una costumbre bastante humana pero poco útil.

## Consolidación realizada

- se elimina el scaffold de Storybook que no estaba instalado ni conectado al runtime;
- se fijan dependencias y se introduce lockfile reproducible;
- QA se divide explícitamente en contratos, contenido, accesibilidad, regresión visual y QA browser existente;
- analítica queda aislada en un módulo que observa el estado sin ser dependencia del juego;
- los experimentos quedan en feature flags inactivas y no alteran el baseline.

## Storybook

Decisión: **retirar por ahora**.

Motivos:
- `package.json` no contenía Storybook;
- el scaffold pertenecía a F3/v1.1 y no representaba la arquitectura v1.2;
- sus componentes de `src/ui/` no eran la fuente real de la UI en producción;
- mantenerlo habría creado dos representaciones divergentes de los mismos componentes.

Puede reintroducirse en una futura consolidación si primero se extraen componentes reales y reutilizables desde el runtime actual.

## Deuda que permanece deliberadamente

1. Consolidar `archive-night*` y `atlas-v12*` sin romper snapshots.
2. Reducir overrides de globals mediante APIs internas explícitas.
3. Revisar si `content-v12.js` debe transformarse en generación build-time manteniendo distribución offline.
4. Consolidar tokens/CSS cuando exista evidencia de qué superficies requieren intervención.

Estas tareas son candidatas a v1.3 técnico, no criterios para retrasar el baseline analítico.
