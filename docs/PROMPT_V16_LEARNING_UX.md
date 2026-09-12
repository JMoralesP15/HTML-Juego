# Prompt maestro — QUÉ AÑO v1.6 · Learning Result UX

Trabaja sobre `feature/learning-result-ux-v1.6`, derivada de la v1.5 validada. No publiques ni hagas merge automático.

## Objetivo

Convertir la experiencia posterior a cada respuesta en una micro-lección breve y transformar el resumen final en un cierre de aprendizaje. Resolver cuatro líneas detectadas por revisión humana y auditoría externa: resultado, resumen final, arquitectura UX móvil y pulido visual/editorial.

## Decisiones de producto

1. **Resultado:** mostrar primero la estimación, año real y diferencia; después enseñar sobre el hito mediante `Qué fue`, `Por qué importa` y, cuando exista evidencia suficiente, `Dato para recordar`.
2. **Contexto:** la relación con otros hitos deja de ser aprendizaje principal y pasa a profundidad secundaria. `Profundizar` debe abrir el contenido en la misma pantalla. No repetir párrafos ni estados editoriales internos.
3. **Resumen:** reducir protagonismo del scoreboard. Mostrar `Qué aprendiste hoy` con los cinco hitos y una frase memorable; después `Para tu próximo repaso` basada sólo en errores u omisiones reales de la sesión.
4. **Arquitectura móvil:** durante pregunta y resultado ocultar navegación global para priorizar jugar/aprender. Recuperarla fuera del loop.
5. **Pulido:** evitar recortes del selector temporal, corregir wrapping de métricas, limpiar referencias `v1.4`, `Referencia heredada` y `pendiente de revisión editorial` del producto visible. Mantener las fuentes reales y sus enlaces.
6. **Dificultad:** seguir mostrándola, pero aclarar mediante accesibilidad/tooltip que es una clasificación editorial y no modifica el puntaje.

## Restricciones

- No cambiar IDs, años, calendario, scheduler, repetición espaciada ni persistencia.
- No “implementar LocalStorage”: ya existe y debe conservarse.
- No añadir modos, rachas nuevas ni features de engagement.
- No inventar hechos. El contenido v1.6 se deriva sólo de `fact`, `context`, `significance`, fuentes y contexto editorial existente.
- No forzar una imagen decorativa. Una lámina generada es fallback, no protagonista.
- Mantener `file://`, offline, teclado, WCAG AA y telemetría no bloqueante.

## QA obligatorio

- aprendizaje esencial visible antes de profundizar;
- contexto inicialmente cerrado y expandible;
- `Siguiente` accesible;
- navegación móvil oculta durante pregunta/resultado;
- resumen con cinco aprendizajes y recomendación de repaso;
- ninguna referencia editorial interna visible;
- fuente concreta disponible cuando exista;
- cero overflow 375×667, 390×844 y desktop;
- 300 IDs/años y calendario intactos;
- axe, regresión y batería previa verdes;
- generar screenshots de resultado, contexto y resumen en desktop y móvil dentro del artifact `visual-qa-screenshots`.

## Entrega

Crear PR draft `feature/learning-result-ux-v1.6` → `feature/simplification-game-clarity-v1.5`. No fusionar ni publicar hasta revisión humana.
