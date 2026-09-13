# Metaanálisis del prompt v1.8.8

## Evaluación global
**9,6 / 10**

El prompt es suficientemente operacional para ejecutar la remediación sin confundir cuatro señales humanas distintas: reemplazar evento, reformular encuadre, reescribir aprendizaje y volver a buscar visual. Esa separación es el punto más importante porque evita que una etiqueta como `doubtful` se trate como un mero problema factual.

## Fortalezas
1. **Semántica de estados explícita.** `doubtful`, `review_source`, `generic` y rechazo visual producen acciones diferentes y verificables.
2. **Mantiene el gate humano.** No convierte heurísticas ni coincidencias de imagen en decisiones editoriales definitivas.
3. **Distingue pertinencia editorial de veracidad factual.** Un hecho puede ser correcto y, aun así, salir del banco por ser demasiado de nicho.
4. **Resuelve el principal error de la consola anterior.** Si se selecciona un reemplazo, la visual debe corresponder al reemplazo, no al evento obsoleto.
5. **Relaja la búsqueda visual de manera controlada.** Permite más recall para revisión sin degradar el estándar de publicación: `review_only` y `publishable` siguen separados.
6. **Evita trabajo inútil.** Los 17 eventos simultáneamente `generic` y `doubtful` no reciben una reescritura del evento que se pretende retirar.
7. **QA medible.** Los criterios se expresan como conteos y propiedades que pueden automatizarse.

## Riesgos detectados y correcciones incorporadas

### Riesgo A: interpretar “menos riguroso con copyright” como permiso de publicación
Corrección: se amplía el universo de referencias visuales para comparación, pero los derechos no resueltos quedan `review_only`. La publicación sigue exigiendo licencia compatible o sustitución posterior.

### Riesgo B: sobreajustar a “150 revisados” cuando el export muestra otra cardinalidad
El archivo exportado contiene 198 registros tocados y 165 completamente triados. El prompt no inventa una frontera de 150; ejecuta sobre los estados explícitos del export y conserva lo pendiente como pendiente.

### Riesgo C: reescribir 118 textos cuando 17 eventos serán eliminados
Corrección: objetivo real de reescritura inmediata = **101** registros `generic` no dudosos. Los otros 17 se resuelven mediante reemplazo.

### Riesgo D: más candidatos visuales = más ruido
Corrección: el ranking sigue priorizando entidad, año, contemporaneidad y procedencia; el aumento de recall sólo ocurre después de la búsqueda estricta y cada candidata conserva score/warnings.

### Riesgo E: reemplazar eventos por otros igualmente especializados
Corrección: se exige racional editorial y se priorizan hitos de alta recognoscibilidad occidental, latinoamericana o chilena, sin convertir el banco en una lista exclusivamente estadounidense.

### Riesgo F: duplicados dentro del banco
Corrección: cada propuesta puede declarar `duplicateRisk`, y la consola debe mostrarlo antes de que el usuario la elija.

## Concordancia con la dirección del proyecto
La propuesta es consistente con la arquitectura editorial v1.8.7: mantiene el banco canónico intacto mientras las decisiones sigan en revisión, conserva procedencia, usa un store único y trata la consola como un sistema de decisión humana. El cambio v1.8.8 no es una expansión de alcance arbitraria: cierra exactamente los defectos que aparecieron después de la primera mitad de la revisión humana.

## Criterio de ejecución
**Aprobado para ejecutar.**

La única restricción no negociable es que una imagen `review_only` no debe terminar en el juego por una acción automática. La búsqueda puede ser más permisiva; la publicación no.