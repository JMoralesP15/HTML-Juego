# Feedback de prueba: revisión técnica y ejecución

## Prompt inicial
Mejorar el juego publicado a partir de la observación de una persona en PC y teléfono: impedir el inicio inesperado del reloj, explicar cómo jugar, priorizar la pregunta frente al título, mejorar tipografía y visibilidad del cronómetro, reparar créditos y reducir información secundaria. Cerrar cada sesión con lo aprendido.

## Revisión metaanalítica
Una observación cualitativa identifica problemas reproducibles, pero no estima su prevalencia en todos los usuarios. Separar defectos (reloj oculto, crédito inaccesible, reanudación automática) de preferencias (tipografía y densidad). Un retraso fijo de dos segundos seguiría penalizando a lectores lentos: usar preparación explícita por pregunta. Permitir lectura sin límite invalida comparar velocidad de resolución; en esta edición de aprendizaje el puntaje dependerá de precisión, sin bonus temporal. Inspirarse en sesiones cortas y contenido progresivo, sin copiar la marca ni añadir recompensas innecesarias.

## Prompt técnico revisado
Aplicar a la edición humana publicada, manteniendo el banco de 62 eventos y sus textos/visuales. Conservar la edición completa como referencia de regresión. Atlas sigue siendo propietario del renderer y reloj: añadir vistas de preparación, respuesta y aprendizaje dentro de ese propietario; reutilizar eventos delegados y almacenamiento. Mostrar instrucciones breves en portada, incluso ante una sesión pendiente. Abrir preguntas sin reloj ni campos de respuesta hasta pulsar «Estoy listo». Reanudar tras ocultar la pestaña mediante nueva preparación explícita. Mantener 15 segundos visibles en un bloque independiente del campo de año, sin superposiciones. Bloquear envío por teclado durante lectura. Mostrar una idea breve por respuesta; desplegar el resto del texto aprobado, referencias y créditos con elementos details semánticos. Resumen final: cinco fechas e ideas; métricas adicionales opcionales. Usar tipografía sans serif del sistema, controles táctiles de al menos 44 px, foco visible y movimiento reducido.

## Criterios de aceptación
- Apertura y recarga no consumen tiempo, incluidas partidas pendientes.
- Lectura durante cinco segundos no genera respuesta ni descuenta reloj; comienza tras acción explícita.
- En 375, 390 y 1366 px pregunta, tiempo y controles no se superponen; sin desbordamiento horizontal.
- Créditos y fuente tienen enlaces visibles, navegables por teclado y no recortados.
- Texto aprobado íntegro accesible sin repetir el extracto; resumen final contiene cada evento respondido.
- Pruebas de la edición humana, auditoría arquitectónica, accesibilidad y regresiones existentes pasan antes de publicar.

