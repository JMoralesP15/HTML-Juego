# Metaanálisis del prompt v1.8.7

Puntaje global: **9,4/10**.

## Fortalezas
- Respeta el contrato editorial existente en vez de inventar un tercer formato.
- Corrige la ambigüedad “100 fotografías” por una unidad de trabajo más segura: **100 eventos con intento de candidata fotográfica**, permitiendo `no_photo` cuando corresponde.
- Separa descubrimiento automático de aprobación humana, evitando que relevancia o derechos se den por sentados.
- Usa una fuente principal reproducible y auditable para la primera pasada: Wikimedia Commons con metadatos de licencia/procedencia.
- Consolida los dos modos de revisión existentes en vez de crear otra capa de interfaz.
- Mantiene el contenido público y los invariantes de juego fuera del alcance hasta que exista aprobación editorial.

## Riesgos detectados
1. **Forzar 100 imágenes aprobadas** incentivaría material irrelevante. Corrección: el lote es de 100 eventos y `no_photo` es válido.
2. **Confundir licencia abierta con fotografía adecuada**. Corrección: licencia, relevancia, contemporaneidad y naturaleza fotográfica son dimensiones separadas.
3. **Generar narrativa automática desde metadatos estructurados** puede producir frases de sistema o afirmaciones sin contexto. Corrección: las propuestas v1.8.2 ya redactadas son la fuente narrativa del primer lote; la automatización sólo valida el contrato y organiza revisión.
4. **Mantener `editorial-assist-v181.js` como overlay** perpetuaría dos stores y dos lógicas de decisión. Corrección: integrar propuestas y decisiones en `review.js`, retirar el overlay de la página y migrar datos legacy de forma compatible.
5. **Descargar 100 binarios al repositorio antes de aprobarlos** aumentaría tamaño, deuda de derechos y ruido. Corrección: la fase de descubrimiento compila primero un manifiesto remoto con procedencia; sólo assets aprobados deberían localizarse después.

## Corrección final aplicada al prompt
La secuencia ejecutable queda: Pages → manifiesto de lote 100 → validación narrativa/visual → consola unificada → revisión humana → promoción posterior. La interfaz puede consumir candidatas pendientes, pero el juego público no las usa hasta que el estado editorial las apruebe explícitamente.

Con esta corrección el prompt tiene alta trazabilidad, bajo riesgo de contaminación del banco y una condición de éxito medible sin sacrificar calidad por cobertura artificial.
