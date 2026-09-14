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

## Segunda iteración: intereses y lenguaje del resultado
El segundo conjunto de comentarios no demuestra que los hechos sean incorrectos ni que nadie se interese por ellos. Refuerza la hipótesis de desajuste entre temas y preferencias. El lote tiene 32 eventos de Chile sobre 62 (51,6 %), 8 de Cine, 5 de Música, 5 de Tecnología, 5 de Ciencia, 4 de Cultura y 3 de Historia; no hay Videojuegos aprobados. La selección anterior podía agrupar cinco hitos chilenos consecutivos. Esto es un sesgo de exposición verificable, distinto de la validez de cada evento.

Prompt ajustado: incorporar elección múltiple de categorías aprobadas, persistida como preferencia validada. Sin selección, ofrecer mezcla; el calendario humano mezcla cinco categorías diferentes mediante selección determinista. Con selección, generar práctica de hasta cinco eventos únicos exclusivamente dentro de esos temas, sin completar un grupo pequeño con temas no elegidos. Preservar partidas diarias pendientes. Mostrar disponibilidad real y permitir cambiar de temas desde el cierre. No introducir eventos nuevos ni reescribir los textos aprobados a partir de dos opiniones. Registrar señales editoriales para revisión humana en un informe separado.

El resultado debe describir el hecho, no exigir una inversión mental: «El evento ocurrió 5 años antes de tu estimación» si el año real es menor que la respuesta; «después» si es mayor. Mantener «¡Exacto!» y «Para recordar» para aciertos y omisiones. Reemplazar recomendaciones prescriptivas por elección del siguiente tema. El resumen principal de esta edición no utiliza «conviene» ni obliga a profundizar.

Validación adicional: categoría única, selección múltiple, persistencia, categoría con tres eventos, mezcla de cinco categorías, exclusión de eventos no aprobados, ambos sentidos del desfase y ninguna recomendación prescriptiva. La auditoría del lote es de relevancia y presentación; no se presenta como verificación histórica independiente de 62 fuentes.

