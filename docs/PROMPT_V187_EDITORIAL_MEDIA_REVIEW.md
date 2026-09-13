# QUÉ AÑO v1.8.7 — prompt técnico de curaduría editorial y visual

Objetivo: sincronizar Pages con el runtime estabilizado y luego consolidar el flujo editorial en lotes de 100 eventos, con texto de aprendizaje conforme al contrato editorial, candidatos fotográficos reales con procedencia y licencias explícitas, y una sola consola de revisión para marcar contenido factual, textual y visual.

## Alcance
1. Mantener `/pages` alineado con v1.8.6 sin tocar `main`.
2. Usar `batch-02-100` como primer lote de 100 porque ya contiene propuestas narrativas v1.8.2 para Historia, Ciencia y Tecnología.
3. Compilar por evento un candidato fotográfico documental de Wikimedia Commons, guardando URL de archivo, página de procedencia, autor, licencia, URL de licencia, descripción y señales de relevancia. Sólo se aceptan como candidatos licencias reutilizables: dominio público, CC0, CC BY y CC BY-SA. NC, ND, fair use, logos, posters, mapas, ilustraciones y material decorativo se rechazan automáticamente cuando sean detectables. Ninguna fotografía se publica sin revisión humana.
4. Validar texto contra `EDITORIAL_CONTRACT_V181`: aprendizaje visible narrativo, normalmente 45–75 palabras; contexto ampliado sólo cuando agrega información nueva, normalmente 60–120 palabras; sin etiquetas “Qué fue”, “Por qué importa” o “Dato para recordar”; sin metadiscurso de ficha, verificación o base de datos.
5. Reemplazar los dos flujos paralelos actuales (`review.js` y el overlay `editorial-assist-v181.js`) por una sola consola. La consola canónica debe incorporar propuestas v1.8.1/v1.8.2 y candidatos visuales dentro de la misma ficha y del mismo store de decisiones.
6. La ficha debe permitir decidir por separado: hecho/fuente, contenido textual y contenido visual. Debe filtrar por lote, estado, categoría y disponibilidad de candidata, y exportar un único JSON de revisión.
7. Migrar decisiones locales del overlay v1.8.1 al store canónico cuando sea posible, sin perder notas o ediciones.
8. No cambiar `id`, `year`, scheduler, calendar, scoring/timer, renderer, storage del juego ni contenido público automáticamente.

## Definición de lote
Un lote contiene 100 eventos, no una cuota obligatoria de 100 imágenes aprobadas. Para cada evento se intenta obtener una fotografía documental válida; `no_photo` sigue siendo un resultado aceptable cuando no existe una candidata relevante y reutilizable.

## Criterios de cierre
- Pages sincronizado y desplegado.
- Lote de 100 con propuestas narrativas y manifiesto visual generado.
- Procedencia y licencia preservadas para cada candidata.
- Ninguna candidata promovida por heurística solamente.
- Una sola interfaz de revisión activa.
- Decisiones textuales y visuales almacenadas en un único esquema.
- Tests de consola actualizados y QA global verde.
