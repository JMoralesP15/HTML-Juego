# Metaanálisis del prompt maestro v1.7

## Propósito

Este documento revisa el prompt `PROMPT_V17_FINAL_RESOLUTION.md` antes de ejecutar sus cambios. El criterio no es si el prompt “suena completo”, sino si puede producir una intervención coherente con el estado real del repositorio sin crear otra capa de deuda.

## 1. Coherencia interna

### Riesgo 1 — Confundir cierre de versión con eliminación total de deuda
El prompt habla de “cerrar v1.7”, pero también reconoce 281 preguntas sin `editorialVerified`. Si se exigiera deuda editorial cero, el incentivo sería marcar contenido como verificado sin revisión factual suficiente.

**Corrección:** el criterio de salida se define como ausencia de falsos positivos, procedencia auditable y pipeline que impida ocultar deuda. La verificación factual total se convierte en backlog progresivo, no en una cuota ficticia de release.

### Riesgo 2 — Confundir menor cantidad de archivos con mejor arquitectura
Eliminar archivos `compat` o `polish` puede reducir contadores sin reducir acoplamiento, e incluso empeorar la mantenibilidad si se incrustan reglas antiguas sin propietario claro.

**Corrección:** sólo se absorben cuando la responsabilidad tiene un propietario canónico evidente y existen pruebas de paridad. El reporte de arquitectura se interpreta como señal, no como función objetivo única.

### Riesgo 3 — Monkey patches de comportamiento
El prompt identifica overrides de timer, `commitAnswer`, `setYear`, etc. Migrarlos todos de golpe sería una reescritura de alto riesgo en una versión cuyo objetivo es consolidación.

**Corrección:** separar overrides puramente estructurales de overrides de comportamiento. Los primeros deben desaparecer en v1.7; los segundos sólo se migran cuando hay tests de paridad explícitos. Un override estable y medido puede ser deuda transicional aceptable.

### Riesgo 4 — CI verde como prueba de corrección editorial
CI sólo puede validar integridad estructural, no comprobar automáticamente que 300 fechas históricas sean verdaderas.

**Corrección:** el pipeline valida procedencia, especificidad y consistencia de estados. La afirmación factual requiere evidencia específica revisada. El reporte debe evitar vocabulario de “verificado” cuando sólo se comprobó estructura.

### Riesgo 5 — Imágenes como métrica de cobertura
El historial del proyecto ya mostró que perseguir una cuota de imágenes generaba láminas artificiales que parecían aumentar calidad.

**Corrección:** no hay objetivo mínimo de imágenes. Se mide calidad de procedencia, licencia y relevancia. `none` es un estado editorial válido.

## 2. Coherencia con el repositorio actual

El CI más reciente previo a este prompt muestra:

- 28/28 contratos Node verdes;
- banco de 300 preguntas íntegro;
- 1096 días de calendario sin mismatches;
- 365 días simulados con `minGap=52` y cero repeticiones <30 días;
- 45 imágenes explícitas, 3 clasificadas como documentales;
- 300/300 preguntas con alguna URL de fuente;
- sólo 19/300 con `editorialVerified`;
- 281/300 marcadas para revisión editorial;
- 6 hojas CSS activas;
- 1 `MutationObserver` activo en analítica;
- 3 lifecycle assignments detectados, dos en `atlas-v12-compat.js` y uno en `runtime-contract.js`.

Por tanto el orden de intervención correcto es:

1. resolver primero los blockers del gate arquitectónico que ya están objetivamente identificados;
2. normalizar reproducibilidad/lockfile;
3. mejorar la taxonomía de procedencia editorial;
4. ejecutar QA completo;
5. sólo después evaluar si los overrides conductuales restantes son blockers de v1.7 o deuda aceptable documentada.

## 3. Complementos y fuentes externas

Se revisó el directorio de complementos buscando Wikipedia/Wikimedia, archivos históricos, museos, Library of Congress, Europeana e Internet Archive. No apareció un conector especializado en archivos abiertos que sea claramente mejor que la integración web/Commons ya existente.

Resultados relevantes:

- **Adobe** está instalado, pero es apropiado para edición/preparación de imágenes, no para validar hechos ni licencias de procedencia.
- **Shutterstock** está disponible como complemento, pero no se recomienda para este flujo: introduce material comercial, no resuelve procedencia factual y entra en tensión con el objetivo offline/abierto.
- **Context7** puede ayudar a consultar documentación técnica de librerías, pero el stack de runtime es mayormente JS nativo y no es necesario para resolver el blocker actual.
- **Scite/Sider Scholar** pueden ser útiles en hitos científicos concretos o para justificar principios pedagógicos, pero no deben convertirse en fuente universal para cine, música, historia, cultura o tecnología.

La estrategia coherente sigue siendo: web y fuentes oficiales para hechos; Wikimedia Commons/archivos abiertos para imágenes; herramientas académicas sólo cuando el tipo de hito lo justifique.

## 4. Error potencial adicional detectado

El workflow actualmente ejecuta `npm install --package-lock-only` antes de `npm ci`. Eso oculta incoherencias del lockfile porque CI lo reescribe antes de comprobar reproducibilidad.

**Corrección necesaria:** actualizar el lockfile en la rama y luego retirar el bootstrap regenerativo del workflow. `npm ci` debe fallar si `package.json` y lockfile divergen.

## 5. Criterio revisado de aceptación v1.7

### Blockers obligatorios

- CI completo verde en el head final.
- cero `MutationObserver` usados como mecanismo de coordinación de runtime/render.
- cero lifecycle monkey patches puramente visuales.
- cero hojas activas `compat/fix/polish` separadas cuando su contenido ya puede vivir en un propietario canónico.
- `package.json` y `package-lock.json` coherentes.
- 300/300 preguntas con procedencia clasificada.
- cero preguntas promovidas automáticamente a `editorialVerified`.
- cero imágenes generadas para cumplir cuotas.
- QA de accesibilidad, regresión visual y gameplay intacto.

### Deuda aceptable documentada

- overrides de comportamiento que siguen teniendo propietario histórico si su migración tiene riesgo y los tests muestran paridad funcional;
- preguntas con fuente genérica aún pendientes de sustitución;
- ausencia de imagen documental;
- concentración geográfica del banco, tratada como descriptor y backlog editorial, no como defecto automático.

## 6. Veredicto del metaanálisis

El prompt es coherente después de estas precisiones. Su principal virtud es que evita dos trampas que el proyecto ya sufrió: mejorar “cobertura” inventando contenido y mejorar “arquitectura” sólo disminuyendo contadores.

La ejecución debe orientarse a **propiedad explícita, procedencia explícita y gates que fallen ante regresiones reales**. El objetivo de v1.7 es que la deuda restante sea deliberada y visible, no que desaparezca mágicamente de un dashboard.