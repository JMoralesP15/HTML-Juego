# QUÉ AÑO v1.5 — revisión UI/UX

## Objetivo

v1.5 corrige la principal deuda observable de v1.4: demasiadas capas compitiendo por atención. No añade modos. Reduce chrome, hace visible la acción principal y convierte el feedback en divulgación progresiva.

## v1.4 → v1.5

| Área | v1.4 | v1.5 |
|---|---|---|
| Cabecera de pregunta | categoría, dificultad, archivo, pregunta, desafío y timeline de ronda | categoría + dificultad + `n / 5` |
| Progreso | varias representaciones simultáneas | una sola representación |
| Pregunta | metadatos editoriales + título muy grande | título y pregunta como jerarquía principal |
| Selector | instrumento visual grande con etiquetas explicativas | año + botones ±1/±10 + slider compacto |
| Acción principal | `Revelar año` podía quedar fuera del viewport | `Confirmar {año}` sticky y dominante |
| Timer | se congelaba al ocultar la pestaña | deadline absoluto; el tiempo real continúa |
| Imagen de pregunta | placas abstractas podían dominar el panel | sólo documento local realmente útil tiene protagonismo |
| Feedback | resultado, sigilo, gráfico, años, diferencia, score, pasos y contexto simultáneos | estimación → real, diferencia y aprendizaje esencial |
| Contexto | gran parte visible desde el inicio | `Ver contexto e imagen` bajo demanda |
| Badge cultural | visible al jugador | permanece en datos, oculto en gameplay |
| Navegación durante partida | cinco destinos + actividad semanal + Ambiente + Sonido + Ajustes | Hoy, Repaso, Colección; chrome secundario reducido |
| Ambiente | toggle permanente de cabecera | control dentro de Ajustes |

## Elementos eliminados del flujo principal

- `ARCHIVO #...`
- `DESAFÍO #...`
- `COORDENADA`
- `INSTRUMENTO TEMPORAL`
- texto explicativo del timer
- timeline editorial 01–05
- familias visuales y leyendas técnicas
- clasificación Cultura general / Contexto recomendado / Especialista
- duplicación visual de estimación, año real y distancia

Los datos subyacentes no se eliminan.

## Componentes rediseñados

### Pregunta

Jerarquía prevista:

1. categoría + dificultad / progreso;
2. título y pregunta;
3. timer + selector temporal;
4. `CONFIRMAR {año}`;
5. `No lo sé`.

### Feedback

1. resultado dominante;
2. aprendizaje esencial;
3. contexto/documento/fuente bajo demanda;
4. `Siguiente`.

### Timer

El estado visual puede suspender el `setInterval` cuando la pestaña se oculta, pero el deadline continúa. Al volver, la interfaz recalcula `deadline - Date.now()` y registra timeout si corresponde.

## Deuda técnica reducida

- v1.5 centraliza la simplificación en `simplification-v15.css` y `js/simplification-v15.js` para evitar modificar IDs/años/scheduler.
- tests de v1.4 se actualizan cuando una expectativa visual deja de ser válida por diseño, sin eliminar las garantías de Commons, licencia y fallback offline.
- PostHog sigue desacoplado del gameplay.

## Deuda pendiente

- las capas CSS históricas `archive-night`, `atlas-v12`, `product-v13` y `curation-v14` continúan cargándose. v1.5 las sobreescribe de forma conservadora; una consolidación física de CSS debe hacerse sólo después de validar visualmente el nuevo diseño.
- `package-lock.json` conserva metadatos de versión históricos; CI regenera el lock antes de `npm ci`. No afecta dependencias, pero conviene normalizarlo en una limpieza posterior.
- la calidad de las imágenes Commons sigue dependiendo de selección automática y requiere revisión editorial humana para una biblioteca documental definitiva.

## Criterio de aceptación

La versión no se considera validada hasta que CI y QA visual confirmen CTA visible, cero overflow, timer absoluto, teclado, feedback progresivo, Commons/fallback y ausencia de regresiones en las 300 fechas.
