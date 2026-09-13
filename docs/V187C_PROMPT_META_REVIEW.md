# Metaanálisis del prompt v1.8.7-c

## Evaluación global
**9,7/10.** El prompt traduce el lenguaje informal de la revisión humana a estados operables sin perder la intención editorial. La principal mejora respecto de v1.8.7-b es que deja de interpretar los flags como meros problemas de validación y los convierte en decisiones semánticas distintas: reemplazar evento, reformular, reescribir o buscar otra visual.

## Hallazgo previo a la ejecución
El export recibido contiene **300 registros**. Hay **198 registros con `updatedAt`**, no exactamente 150; 165 tienen los tres ejes principales ya clasificados. Dentro de los registros tocados aparecen 30 `doubtful`, 2 `review_source`, 118 `generic`, 136 `anachronistic`, 4 `irrelevant` y 1 `rights_review`. Además, 31 registros tienen `mediaStatus=approved` con `mediaChoice=pending`.

Esto obliga a no usar “150” como selector técnico. La selección correcta es el feedback explícito del export. En particular, una aprobación visual sin `mediaChoice` debe interpretarse como aceptación del visual actual, porque pedir una segunda decisión para una foto que el usuario ya aprobó sería convertir la consola en una pequeña oficina pública.

## Lo que el prompt resuelve bien
1. **Distingue relevancia de exactitud.** `doubtful` deja de significar “investigar más el mismo evento”. La instrucción del usuario es reemplazar hitos demasiado de nicho o poco útiles para cultura general.
2. **Conserva la intención de `review_source`.** Se mantiene el evento y se corrige el modo de plantearlo, especialmente título y pregunta.
3. **No confunde texto estructuralmente válido con buen texto.** `generic` exige contexto o consecuencia específica, no sólo longitud suficiente.
4. **Separa descubrimiento visual y derechos de publicación.** Se puede ampliar la búsqueda para que el humano compare más alternativas sin fingir que una coincidencia semántica o una miniatura encontrada en la web otorgan derechos de uso.
5. **Protege el feedback ya invertido.** El merge por `updatedAt` impide que una nueva versión de la consola borre decisiones locales más recientes.
6. **Mantiene la revisión humana como gate.** Reemplazos, textos y fotos pueden ser propuestos automáticamente, pero no entran al juego por sí solos.

## Riesgos detectados y correcciones
### 1. Reemplazar por eventos igual de nicho
Riesgo alto. Si se optimiza sólo por año/categoría, un algoritmo puede cambiar un hito desconocido por otro igualmente especializado. Se corrige exigiendo `rationale`, riesgo de duplicado y evaluación explícita de reconocimiento cultural.

### 2. Forzar año y categoría a toda costa
Riesgo medio. Preservarlos ayuda al balance del banco, pero puede producir peores preguntas. El prompt los convierte en preferencia fuerte, no en dogma. Una excepción debe ser visible y aprobada manualmente.

### 3. “Relajar copyright” convertido en publicación insegura
Riesgo alto. La necesidad real del usuario es **ver más opciones para decidir**, no publicar material sin derecho. Por eso se introduce `rightsTier`: una candidata puede ser útil como referencia `review_only` y aun así estar bloqueada para producción.

### 4. Reescribir `generic` de eventos que serán eliminados
Trabajo inútil. Los `generic` que además sean `doubtful` se excluyen de la reconstrucción final; primero se reemplaza el evento y luego se genera texto para el reemplazo elegido.

### 5. Tomar “imagen contemporánea” como requisito absoluto
Riesgo medio. Para productos físicos y obras, una fotografía posterior del objeto original puede ser la mejor pista. El prompt permite ese caso con etiqueta explícita, pero sigue rechazando una foto posterior que pretenda representar un hecho histórico efímero.

### 6. Sobrecargar la consola con seis imágenes por defecto
Riesgo UX medio. Deben ordenarse por score y mostrar primero las mejores; el resto puede mantenerse en una franja secundaria. El beneficio de elección supera el costo mientras el número se limite a seis.

## Decisión de ejecución
El prompt está alineado con la intención del usuario y con la arquitectura v1.8.7: **se ejecuta** sobre la rama `feature/editorial-media-batch-v1.8.7`, manteniendo el PR como Draft y `main` intacto.

## Criterio de cierre
La iteración no se considera terminada porque “el script corrió”. Se considera terminada cuando:
- el feedback humano está versionado y preservado;
- cada `doubtful` dispone de reemplazos razonables;
- cada `review_source` dispone de reformulación;
- cada `generic` aplicable dispone de texto nuevo;
- los visuales rechazados vuelven a tener una bandeja de candidatas más amplia;
- la consola permite elegir y exportar esas nuevas decisiones;
- QA contractual, accesibilidad y arquitectura siguen verdes.