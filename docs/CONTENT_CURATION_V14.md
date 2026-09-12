# Curaduría de cultura general — v1.4

## Qué intenta resolver

El banco de 300 fechas mezcla hitos de reconocimiento transversal con obras, productos y eventos muy influyentes dentro de comunidades específicas. Eso enriquece el archivo, pero puede deteriorar la experiencia diaria cuando una pregunta difícil se siente simplemente desconocida y no razonablemente deducible.

La v1.4 no elimina esas fechas. Las clasifica para separar tres usos editoriales:

- **Cultura general (`core`)**: buen candidato para el desafío diario sin explicación previa.
- **Contexto recomendado (`context`)**: importante, pero necesita un feedback especialmente claro para que la dificultad produzca aprendizaje y no sólo desconcierto.
- **Especialista (`niche`)**: valioso para Sets, práctica, colecciones temáticas o revisión futura; su presencia en el diario general debe ser deliberada.

## Rúbrica

La puntuación 0–100 combina cinco criterios editoriales: impacto social/histórico, reconocimiento probable fuera del nicho, persistencia cultural/curricular, capacidad de producir aprendizaje aun sin conocimiento previo y claridad de la pregunta. Los cortes iniciales son `core >= 70`, `context = 50–69`, `niche < 50`.

**Importante:** es una estimación editorial heurística, no una tasa observada de reconocimiento. No debe interpretarse como “el 78% de la población conoce este hito”. El reporte `reports/culture-curation-v14.json` conserva los 300 registros para revisión humana posterior.

## Casos que justifican la revisión

Algunos candidatos que merecen contexto o tratamiento de nicho son obras altamente valoradas dentro de su campo pero menos previsibles como cultura general temporal: *In the Aeroplane Over the Sea*, *Clube da Esquina*, *Construção*, *Trans-Europe Express*, *Dynamo*, *Homogenic*, *To Pimp a Butterfly*, *Chungking Express*, *Portrait of a Lady on Fire*, *The Battle of Algiers*, *Celeste*, *Disco Elysium*, *Hades*, *Baldur’s Gate 3* o *Black Myth: Wukong*.

Esto no implica que deban desaparecer. Precisamente algunas de esas fechas tienen gran valor cultural. La decisión editorial correcta puede ser mantenerlas en Sets temáticos y hacer que su contexto posterior explique por qué importan, en lugar de fingir que todo hito influyente es automáticamente conocimiento general.

## Densificación sin inventar hechos

Cada pregunta recibe una estructura de lectura posterior con:

1. **Qué ocurrió**: hecho/contexto ya disponible.
2. **Por qué importa**: significado existente cuando está disponible; de lo contrario se reutiliza el hecho base y queda pendiente de revisión.
3. **En el mapa del tiempo**: relación cronológica con otros elementos del banco.
4. **Dato para recordar**: hecho breve ya presente en la pregunta.
5. **Conexión**: anclas anteriores/posteriores o vecinos cronológicos de la misma categoría.

La capa v1.4 completa la estructura para las 300 fechas sin modificar ID ni año. Donde falta una revisión editorial humana, el dato queda marcado como tal.

## Política visual

Toda fecha conserva un recurso visual offline. Los hitos sin fotografía/ilustración local reciben una lámina editorial generada a partir de sus propios metadatos. Cuando existe conexión, la interfaz puede intentar enriquecer el feedback con Wikimedia Commons.

Una imagen remota sólo se muestra si la API declara una licencia de la lista permitida: dominio público, CC0, CC BY o CC BY-SA. La interfaz muestra autor/crédito, licencia y enlace a la ficha del archivo. La selección automática no se denomina “curada” y nunca reemplaza la necesidad de revisión editorial de una futura biblioteca documental local.

## Geografía

El banco previo presenta una concentración relevante en Estados Unidos, Chile, Japón y Reino Unido. El reporte v1.4 mantiene `top4Share`, HHI y número efectivo de regiones para seguir esta concentración. No se define una cuota normativa automática porque una distribución exactamente uniforme sería tan artificial como dejar que Estados Unidos se coma el calendario completo, esa noble tradición de la historia cultural en Internet.

La recomendación es que nuevas incorporaciones prioricen Latinoamérica fuera de Chile, África, Asia fuera de Japón, Europa continental y Medio Oriente cuando existan hitos con suficiente relevancia general y fuentes sólidas.

## Decisiones futuras

Antes de reemplazar preguntas, conviene contrastar esta clasificación con datos reales de juego: error absoluto, `No lo sé`, timeout, abandono y apertura de contexto. Un hito etiquetado como `niche` que genere aprendizaje y buena retención puede merecer quedarse; uno `core` que sistemáticamente resulte incomprensible puede estar mal redactado o sobrevalorado editorialmente.