# Dos iteraciones: coherencia editorial y experiencia móvil

## Idea de producto
QUÉ AÑO debe ofrecer una partida sencilla de manejar en teléfono y una lectura útil después de responder. La consola y el juego deben distinguir propuestas de decisiones aprobadas. Las fotografías deben corresponder al evento concreto, conservar procedencia y explicar su ausencia. La cantidad de candidatas no mide su pertinencia.

## Revisión crítica del encargo
- Es verificable mediante contratos y recorridos, pero no permite prometer una foto adecuada para todos los eventos.
- La consolidación debe preceder a nuevas capas: el cambio anterior incumplió el presupuesto arquitectónico.
- Los criterios textuales no sirven para puntuar fotos: una palabra de una explicación no identifica una escena.
- La aprobación humana permanece explícita. No publicar propuestas desde el almacenamiento privado del navegador.

## Prompt técnico, iteración 1
Inspeccionar el renderer, el ciclo de render, el almacenamiento editorial y el generador visual. Integrar el ajuste móvil en CSS existente sin nuevos scripts activos. Corregir deduplicación de aprendizaje, conservar fuente visible y no ocultar imágenes válidas por ausencia de texto ampliado. Ampliar búsqueda a todos los IDs; aceptar selección explícita de IDs para reintentos. Puntuar términos de identidad completos; excluir PDF, SVG y coincidencias sólo de fecha/región. No confundir fecha de digitalización con fecha de captura. Añadir timeout, reintentos y registro de errores. Probar casos adversos antes de evaluar el resultado.

## Puerta entre iteraciones
Contrastar archivos y resultados con la versión de partida. Registrar fallos reales y convertirlos en el segundo prompt; no considerar un commit o un workflow iniciado como validación.

## Prompt técnico, iteración 2
Tras verificar la primera iteración, simplificar el selector móvil manteniendo año editable, deslizador y ajuste fino. Dejar los saltos de diez años para pantallas amplias. Distinguir en consola no buscado, búsqueda fallida y sin coincidencias. Impedir aprobar imagen vacía o candidata desaparecida. Versionar recursos modificados. Ejecutar pruebas de regresión y recorrer pregunta, revelado y contexto en móvil. Documentar la diferencia entre código verificado, búsquedas efectivamente ejecutadas y contenido pendiente de revisión humana.

## Criterios de aceptación
Sin cambios en IDs, años, puntuación o esquema de progreso. Sin incremento de scripts, estilos o suscripciones activas respecto a v1.8.7. Sin frases de procedencia en narrativa. Fuente accesible aun sin contexto ampliado. Ninguna aprobación de un recurso ausente. Cobertura de búsqueda y errores medidos, sin inventar resultados.
