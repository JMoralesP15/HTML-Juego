# Verificación · v1.0

Se ejecutaron 28 comprobaciones de lógica e interacción utilizando Node.js, VM y LinkeDOM. LinkeDOM simula el documento y los eventos; no calcula la disposición CSS ni reproduce audio. No se realizaron capturas ni pruebas en un navegador real.

## Comprobaciones superadas

- Carga inicial y navegación mediante eventos de los botones Hoy, Repaso, Colección y Estadísticas.
- Sustitución de controles por respuesta y conservación del botón principal.
- Recarga en mitad del desafío, incluso en la pantalla de respuesta; memoria sin doble conteo.
- Práctica de tres preguntas, omisiones con error nulo y promedio calculado sobre las respondidas.
- Una práctica no borra el desafío pendiente ni suma partidas al historial diario.
- Finalización única del desafío, aun repitiendo la llamada de cierre.
- Ordenar oculta fechas hasta confirmar, marca posiciones individuales y evita doble registro. Una ronda perfecta suma cuatro posiciones; no modifica el historial diario.
- Renderizado de Colección, sus cinco vistas, estadísticas, calendario, ajustes, editor y operaciones de dibujo de la tarjeta compartible.
- Filtros de práctica respetados y reserva de las preguntas de próximos desafíos.
- Consolidación basada en aciertos de días distintos; repetir en un día no equivale a aprendizaje espaciado.
- Migración de memoria ausente a partir de partidas antiguas e importación/exportación lógica de los tres historiales.
- Banco de 300 preguntas con 45 imágenes y 19 contextos ampliados.

## Calendario

- 2026: separación mínima de 52 días; cero repeticiones bajo 30 días; todos los especiales con cuatro o cinco preguntas temáticas.
- Las 1.096 listas publicadas de 2026–2028 coinciden con el motor de selección.
- Las 365 listas de 2026 generan la misma huella al ejecutar v1.0 en UTC, America/Santiago y Asia/Tokyo. Coinciden también con v0.9.3 ejecutada en UTC.
- Huella SHA-256 de las fechas e IDs de 2026: `2537e244a353349cb96bca1f3812cf29c308cee63f20c10f7c3118aa63a96d8f`.

## Integridad

La auditoría no encuentra IDs duplicadas, años inválidos, campos obligatorios vacíos, títulos casi duplicados, referencias locales ausentes ni años de respuesta explícitos en título/pregunta. Sus resultados completos están en `auditoria.json`. La existencia de una URL de fuente no equivale a una verificación histórica: 281 referencias heredadas siguen pendientes de revisión individual.

## Reproducir

Para la auditoría, ejecuta `node tools/audit.mjs` desde esta carpeta. No necesita paquetes externos.

Para las pruebas de interacción, ejecuta `npm install` y luego `npm test`. La dependencia de desarrollo LinkeDOM sólo se utiliza para estas pruebas; el juego funciona sin instalarla.

## Pendiente de validación visual

Antes de una publicación pública conviene comprobar en los navegadores y dispositivos de destino: teclado numérico móvil, ventanas cortas o texto ampliado, foco de los diálogos, impresión visual de las imágenes, descarga de PNG y reproducción de los sonidos. La presencia de reglas adaptables y comandos de canvas fue comprobada en código; su apariencia y reproducción reales no están certificadas por estas pruebas.
