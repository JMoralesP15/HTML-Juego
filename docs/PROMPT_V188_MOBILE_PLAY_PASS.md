# Prompt técnico — v1.8.8 Mobile Play Pass

## Rol
Actúa como ingeniero principal de producto y frontend para QUÉ AÑO, un juego web estático de estimación temporal. Trabaja sobre `feature/editorial-media-batch-v1.8.7`.

## Evidencia de auditoría
Auditoría visual a 390 × 844 px:
1. La bienvenida es legible, pero exige demasiado texto antes de jugar.
2. La portada concentra el contenido arriba y deja una zona vertical extensa antes de la navegación.
3. La pregunta ofrece controles comprensibles, pero el pie de acción termina a media pantalla y el área restante queda vacía.
4. La respuesta explica el error y el aprendizaje, pero la acción “Siguiente” tampoco se mantiene en una posición predecible.
5. Durante una ronda la navegación se oculta correctamente y evita salidas accidentales.
6. La aplicación ya tiene foco visible, regiones vivas, reducción de movimiento y objetivos táctiles cercanos al mínimo.
7. La arquitectura carga cinco capas CSS y múltiples capas de presentación; el cascade histórico usa numerosos `!important`.

## Objetivo
Mejorar la experiencia móvil de 320 a 760 px, principalmente 360 × 800 y 390 × 844, sin cambiar contenido editorial, selección diaria, calendario, scoring, estadísticas ni esquema de almacenamiento.

## Implementación
1. Crear una única capa `mobile-v188.css`, cargada al final del cascade.
2. Crear `js/mobile-v188.js`, cargado después de `experience-v18.js` y suscrito a `window.__QYA_RUNTIME__.onRender`.
3. Exponer en `<body>` el estado móvil actual mediante atributos de vista y fase, sin envolver ni reemplazar renderizadores.
4. En móvil:
   - usar `100dvh` y safe areas;
   - hacer que portada, pregunta y respuesta ocupen el alto disponible;
   - mantener la acción principal en el borde inferior del flujo cuando el contenido es corto;
   - convertir la navegación principal en barra inferior estable fuera de una ronda;
   - asegurar objetivos táctiles de al menos 44 px;
   - reducir ruido de cabecera y conservar jerarquía editorial;
   - permitir scroll normal cuando aprendizaje, colección o estadísticas excedan el viewport;
   - mejorar reflow a 320–390 px y orientación horizontal baja.
5. Respetar `prefers-reduced-motion`, zoom, teclado, lectores de pantalla y contraste existente.
6. No añadir dependencias, imágenes, service worker ni persistencia nueva.
7. No introducir nuevos `MutationObserver`, wrappers de `setView` ni reglas de negocio.

## Validación
- Ejecutar auditoría y pruebas existentes.
- Verificar portada, pregunta, respuesta, resumen y al menos una vista secundaria.
- Probar 320 × 568, 360 × 800, 390 × 844 y 844 × 390.
- Confirmar que no existe overflow horizontal.
- Confirmar que el año sigue siendo editable y que ±1, ±10, No lo sé, Confirmar y Siguiente funcionan.
- Confirmar que el contenido largo desplaza la página y que la acción no tapa texto.
- Confirmar que el estado se conserva tras recargar.

## Entregables
- Implementación.
- Informe breve de auditoría con prioridades.
- Registro de validación y límites.
