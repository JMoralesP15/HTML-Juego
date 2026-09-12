# QUÉ AÑO · versión 1.0

Descomprime **todo el ZIP** y abre **que_ano_v1_0.html** en tu navegador. Mantén `assets`, `js` y `style.css` junto al HTML. No hace falta instalar nada para jugar. Las imágenes y los sonidos funcionan sin conexión; los enlaces a fuentes se abren sólo cuando los eliges y necesitan Internet.

## Cómo jugar

- **Hoy:** cinco hitos, dos fáciles, dos medios y uno difícil. Escribe el año, mueve el selector o usa los botones. Confirma para descubrir el contexto. La pregunta y la respuesta ocupan el mismo espacio.
- **No lo sé:** revela la fecha y la guarda para repasar. Otorga cero puntos y no inventa un error numérico.
- **Repaso:** preguntas pendientes según el tiempo transcurrido y los errores. En móvil, cambia entre Repaso pendiente y Práctica libre. Puedes practicar 3, 5 o 10 preguntas: todas, no descubiertas, falladas, categoría más débil o errores persistentes. Si el filtro tiene menos preguntas, la sesión será más corta.
- **Ordenar:** coloca cuatro hitos de más antiguo a más reciente. Toca un título y luego otro para moverlo, usa las flechas o arrastra. Los años aparecen al confirmar; cada tarjeta indica si estaba bien colocada. Los hitos del mismo año pueden intercambiarse sin penalización.
- **Colección:** fechas descubiertas, progreso por década y categoría, mapa temporal y logros. Lo no descubierto sigue oculto. Usa las páginas y los filtros.
- **Estadísticas:** sólo resultados diarios, con evolución, precisión por categoría y calendario navegable. Repaso, Práctica y Ordenar mantienen registros separados.

En escritorio, Enter confirma o continúa; las flechas izquierda/derecha ajustan el año cuando el foco no está en otro control, y Mayús cambia de diez en diez. En móvil, el teclado numérico se abre sólo al tocar el año.

## Qué cambia respecto a 0.9.3

- Interfaz oscura con acento ámbar, navegación inferior en móvil y acción principal en una posición estable. El resultado reemplaza los controles. Las imágenes pasan a una ventana opcional en pantallas pequeñas. Colección y logros están paginados.
- Se elimina la pequeña cronología acumulativa de las respuestas. La modalidad independiente de ordenar permanece.
- Contexto ampliado y fuentes específicas para **19 hitos**, incluido JFK. «Leer más» añade relevancia, precisión sobre la fecha e información de la imagen.
- Revisión de las 48 imágenes heredadas: tres imágenes inadecuadas retiradas y tres sustituidas por fotografías NASA. Quedan **45 imágenes locales**: 42 ilustraciones de apoyo y 3 fotografías. Los motivos genéricos menos informativos se reservan para después de responder.
- Se corrigen títulos que regalaban la respuesta, como el plebiscito constitucional y Windows. La pregunta de la Web distingue su anuncio público de la existencia del primer servidor.
- Guardado inmediato de respuestas y del año seleccionado. Un desafío y una práctica pueden quedar pendientes a la vez sin reemplazarse.
- Memoria por pregunta: intentos, error medio, mejor error, último error y días de aciertos. «Consolidada» exige aciertos sin ayuda, con un margen de dos años, en tres días distintos que abarquen al menos una semana.
- Once logros, progreso visible y tres paletas de color. Las recompensas son cosméticas y educativas. Los sonidos breves son opcionales, con volumen ajustable y apagados inicialmente. Se respeta la reducción de movimiento del dispositivo.
- Tarjeta compartible dibujada en canvas, sin preguntas ni emojis dependientes del sistema. La racha de una tarjeta histórica corresponde a esa fecha.
- Banco, calendario, almacenamiento, motor, paneles y eventos separados en archivos. Editor local de textos y herramienta de auditoría incluidos.

## Progreso anterior

Si el navegador da acceso al almacenamiento de la versión anterior, v1.0 migra automáticamente el progreso de 0.9.3, 0.9.2 o 0.8 a una clave nueva. Los archivos abiertos en rutas distintas pueden tener almacenamientos separados: exporta una copia JSON desde la versión anterior y restáurala en **Ajustes → Importar progreso**. La restauración muestra un resumen antes de reemplazar el progreso actual. Conserva la copia anterior.

Las respuestas y las IDs de las partidas históricas se conservan. Los errores de posición de Línea temporal de versiones anteriores se muestran separados del nuevo error expresado en años. La práctica de versiones antiguas que no guardaban un historial no puede reconstruirse como sesiones completas; la memoria existente sí se conserva.

## Calendario y banco

Se mantienen las **300 preguntas**: 105 fáciles, 120 medias y 75 difíciles. `CONTENT_VERSION = 3` identifica el banco base del calendario y `SCHEDULE_VERSION = 2` su selección. La revisión editorial es v1.0; sus cambios de presentación no intervienen en la selección. El almacenamiento usa el esquema 5.

`js/calendar.js` fija las 1.096 listas diarias de 2026 a 2028. Para fechas posteriores se utiliza el motor con la misma instantánea de contenido de `js/scheduler.js`. Añadir preguntas al archivo editorial o al banco no altera esa instantánea ni las listas publicadas. No edites las IDs ni los años de entradas ya publicadas sin una migración expresa.

El objetivo de separación es 60 días, pero el balance de dificultad permite menos para algunas preguntas. La simulación de 2026 arroja **52 días de separación mínima**, sin repeticiones por debajo de 30 días. Todos los especiales anunciados contienen al menos cuatro preguntas del tema. No se promete un enfriamiento universal de 60 días.

Se corrige el cálculo de fechas para que el cambio de hora no altere el calendario entre países. Las IDs de 2026 coinciden con la edición anterior ejecutada en UTC. Una edición anterior ejecutada en otra zona podía producir otro desafío por ese error: sus partidas guardadas se respetan, pero la selección futura se unifica.

## Auditoría y alcance de la revisión

Abre **Ajustes → Revisión del banco**, o añade `#editor` al nombre del HTML. Puedes corregir textos, contextos y fuentes, exportar el banco y ejecutar la auditoría. Los cambios locales del editor no modifican los años ni el calendario.

También puedes ejecutar `node tools/audit.mjs` con Node.js 18 o posterior; no requiere instalar dependencias. `auditoria.json` contiene el informe de esta entrega. Revisa IDs, fechas, fuentes, imágenes, dificultad, subcategoría, similitud de títulos, distribución geográfica y consistencia del calendario publicado.

Todas las preguntas tienen campos de fuente, pero **281 mantienen referencias heredadas pendientes de verificación editorial individual**. La auditoría comprueba su estructura, no certifica la verdad de cada referencia. Esta entrega no presenta el banco completo como verificado. El editor permite localizar esas preguntas para continuar la revisión.

La partida está diseñada para caber sin desplazamiento en tamaños habituales. En ventanas muy bajas, con teclado abierto o texto ampliado, se conserva un desplazamiento de respaldo para no ocultar controles. Las ventanas de lectura y las vistas de análisis pueden desplazarse.

La validación incluye lógica y eventos en un DOM simulado, continuidad de partidas, migración, calendario y existencia de archivos. **No incluye pruebas de disposición visual en un navegador real ni reproducción física de audio.** Consulta `VERIFICACION.md`.
