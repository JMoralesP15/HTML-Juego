# Estrategia editorial de fuentes e imágenes — v1.7

## Objetivo

QUÉ AÑO no necesita que cada hito tenga una fotografía. Necesita que cada afirmación y cada imagen que sí se muestran tengan una procedencia comprensible. v1.7 separa cuatro problemas que antes quedaban mezclados bajo la palabra “cobertura”: dato factual, contexto, imagen y derechos de reutilización.

## 1. Contexto factual

La revisión por hito sigue esta prioridad:

1. **Fuente oficial o institucional específica**: archivo nacional, organismo científico, museo, universidad, organismo internacional, biblioteca, fabricante/autor/editor oficial cuando documenta su propio lanzamiento u obra.
2. **Fuente secundaria autoritativa específica**: institución cultural, enciclopedia especializada, publicación académica o medio de referencia cuando el dato no dispone de una fuente primaria práctica.
3. **Referencia general**: Wikipedia u otra referencia amplia sirve para orientar la búsqueda, pero no promueve por sí sola `editorialVerified`.
4. **Homepage genérica**: sólo sirve como deuda visible; debe reemplazarse por un recurso que documente la afirmación concreta.

La pregunta se considera verificada únicamente cuando una revisión humana confirma que la fuente específica respalda el año/fecha que se pregunta y que el `prompt`, `fact` y cualquier `context/significance` no alteran el alcance de esa evidencia.

## 2. Matriz de evidencia por pregunta

`reports/editorial-quality-v17.json` debe permitir distinguir:

- año/fecha que se valida;
- fuente actual, dominio, autoridad y especificidad;
- `editorialVerified` explícito;
- disponibilidad de `fact`, `context` y `significance`;
- estado de la imagen, crédito, fuente y licencia;
- campos derivados que sirven para UX pero no como evidencia factual.

Una clasificación automática es triage, no fact-checking.

## 3. Fotografía e imagen

### Orden de preferencia

1. Fotografía/documento directamente relacionado con el hito y con derechos claros.
2. Objeto de museo/archivo directamente relacionado.
3. Ilustración explícitamente identificada como ilustración.
4. Ninguna imagen.

Nunca: ilustración sintética presentada como documento, fotografía vagamente relacionada para “llenar espacio”, o imagen cuya licencia no puede explicarse.

### Proveedores abiertos recomendados

**Wikimedia Commons**

- Sigue siendo el proveedor automático principal por su API `imageinfo/extmetadata` y porque permite filtrar licencias abiertas.
- La ficha de Commons debe permanecer accesible para atribución.
- `CC BY`, `CC BY-SA`, `CC0` y dominio público son estados reutilizables; `NC` y `ND` no se aceptan en la búsqueda automática del juego.

**Smithsonian Open Access**

- Útil para historia cultural, ciencia, tecnología y objetos de museo.
- Los assets marcados CC0 pueden reutilizarse; conviene mantener título, institución, licencia y URL aunque CC0 no exija atribución.
- Su API pública requiere registro de key, por lo que se considera mejor fuente de curaduría editorial/batch que dependencia obligatoria del runtime.

**Library of Congress**

- API JSON pública y valiosa para fotografías, carteles, archivos y cultura de EE. UU.
- Los derechos se evalúan por objeto/colección; la pertenencia a LoC no implica dominio público automático.
- Por esa razón es fuente de candidatos, no un “auto-accept”.

**Europeana**

- Agrega instituciones europeas y expone rights statements estandarizados.
- Sólo se deben incorporar assets cuyo statement permita el tipo de reutilización requerido.
- Mejor como herramienta editorial que como dependencia crítica del flujo diario.

### Proveedores temáticos

- NASA / JPL para misiones espaciales y astronomía, revisando siempre el crédito asociado al asset.
- Archivos/bibliotecas nacionales para política, historia y cultura local.
- Museos y sitios oficiales de producto/obra cuando aportan una imagen reutilizable con derechos explícitos.

## 4. Complementos revisados

Se buscó un conector especializado para Wikipedia/Wikimedia, Europeana, Smithsonian, Library of Congress e Internet Archive. No apareció uno que mejore materialmente el flujo ya disponible con web + APIs abiertas.

- **Adobe** está conectado y puede servir para preparar/corregir técnicamente un asset ya validado. No debe utilizarse para fabricar evidencia histórica.
- **Shutterstock** existe como complemento disponible, pero no se incorpora al pipeline de v1.7: es un banco comercial y no resuelve procedencia factual, apertura ni fallback offline.
- **Context7** es útil para documentación técnica actualizada, pero no resuelve curaduría histórica.
- **Scite / Sider Scholar** son complementarios para hitos científicos o para sustentar decisiones pedagógicas, no una fuente universal para las 300 preguntas.

## 5. Política runtime vs. curaduría

El runtime debe ser robusto sin red. La curaduría puede usar herramientas externas para mejorar la edición, pero el juego nunca puede depender de ellas para poder responder o aprender el dato esencial.

Por eso:

- `fact`/contexto esencial permanece local;
- fuentes son enlaces de profundización;
- Commons es progressive enhancement;
- fallas de red no cambian gameplay;
- un asset remoto no se convierte automáticamente en asset local;
- una imagen no entra al banco permanente sin revisión de relevancia y derechos.

## 6. Deuda heredada de v0.8

Las ilustraciones locales generadas para versiones tempranas se mantienen separadas de fotografías documentales. Deben contabilizarse como `project_generated_illustration`, no como “documentary” ni como “auto synthetic filler”. Esto permite conservar el fallback offline sin mentir sobre su naturaleza.

En futuras rondas editoriales pueden retirarse o reemplazarse por material abierto mejor, pero no es necesario hacerlo a ciegas para cerrar v1.7.

## 7. Criterio de aceptación

v1.7 puede estar lista aunque no tenga 300 fuentes primarias ni 300 fotografías. No puede estar lista si:

- existen preguntas sin fuente alguna;
- un hito se marca verificado sólo por heurística;
- un documento generado se presenta como fotografía/archivo;
- una fotografía documental carece de crédito/fuente básica;
- el pipeline vuelve a imponer una cuota artificial de imágenes.

La calidad editorial se mide por **procedencia y honestidad de estado**, no por porcentaje de casillas llenas.