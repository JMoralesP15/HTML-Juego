# QUÉ AÑO v1.8 — Prompt maestro de verificación factual y medios documentales

## Mandato

Transformar la deuda editorial visible de v1.7 en evidencia factual trazable sin convertir cobertura en una falsa sensación de verificación. Trabajar sobre `feature/factual-editorial-verification-v1.8`, conservando intactos IDs, años de respuesta, calendario, scheduler, timer, scoring, persistencia, offline, Repaso, Sets y Learning Gain.

La unidad de trabajo no es «una pregunta con URL», sino un hito con una afirmación temporal, contexto útil y, cuando corresponda, una imagen documental con derechos identificables.

## 1. Estados de evidencia

Clasificar cada hito en uno y sólo uno de estos estados:

- `manual_verified`: revisado contra una fuente institucional, archivo, entidad oficial o fuente primaria/curada específica. Sólo este estado puede mantener o activar `editorialVerified=true`.
- `structured_corroborated`: el año del juego coincide con evidencia temporal estructurada de Wikidata y con una página temática específica; sirve como corroboración, no como verificación manual.
- `item_specific_reference`: existe una referencia temática específica, pero la evidencia estructurada no basta para corroborar el año con seguridad.
- `needs_review`: falta correspondencia suficiente, existe ambigüedad de evento, o la evidencia contradice el año esperado.

Nunca promover contenido a `manual_verified` sólo porque Wikipedia, Wikidata o dos endpoints del mismo ecosistema coincidan.

## 2. Fuentes y prioridad

Priorizar en este orden cuando estén disponibles:

1. organismos públicos, archivos, museos, bibliotecas, universidades, misiones científicas y organismos internacionales;
2. entidad responsable del acontecimiento o publicación: fabricante, estudio, editorial, sello, artista, liga, plataforma, etc.;
3. bases curatoriales reconocidas y páginas específicas;
4. Wikipedia/Wikidata como capa de corroboración estructurada y descubrimiento, nunca como sustituto automático de revisión humana.

Una homepage genérica no cuenta como fuente específica. Una página de Wikipedia dedicada al objeto sí cuenta como referencia temática, pero no como verificación institucional.

## 3. Valor del contexto

No generar frases de relleno del tipo «este acontecimiento fue importante» o «marcó un antes y un después».

Un detalle nuevo sólo se incorpora si agrega información verificable que no repite título, pregunta, año ni `fact`. Priorizar datos como:

- fecha exacta dentro del año;
- lugar;
- autor, fundador, director, fabricante, institución o protagonista;
- obra, misión, dispositivo o publicación concreta;
- relación temporal útil con otro hito;
- distinción conceptual que evite una confusión frecuente, por ejemplo presentación vs. lanzamiento, nacimiento vs. anuncio, plebiscito vs. entrada en vigencia.

Si la evidencia estructurada no aporta al menos un dato adicional concreto, no crear un nuevo texto. La ausencia es preferible al contenido genérico.

## 4. Fotografías y medios

Las imágenes deben aportar evidencia o comprensión. No existe cuota mínima.

Prioridad:

1. fotografía/documento exacto del acontecimiento u objeto, con procedencia y licencia;
2. imagen principal de una página temática específica, sólo si su metadata confirma licencia abierta y relación clara con el hito;
3. imagen abierta de Commons estrechamente relacionada con el mismo objeto/evento;
4. ninguna imagen.

Rechazar automáticamente imágenes genéricas de categoría, stock, logos, iconos, banderas, sellos, mapas, pósteres o portadas cuando sólo decoran. Las excepciones requieren una razón editorial explícita.

Toda imagen aceptada debe registrar como mínimo: `sourcePage`, `artist/creator`, `license`, `licenseUrl` cuando exista, `description`, `selectionMethod` y procedencia del archivo. Licencias aceptables para integración automática: dominio público/PD, CC0, CC BY y CC BY-SA. Rechazar NC, ND y estados de derechos ambiguos.

Una licencia abierta no demuestra relevancia histórica. La relevancia y los derechos son gates separados.

## 5. Procesamiento por lotes

Procesar los 300 hitos por lotes reproducibles. Los 19 ya verificados manualmente se preservan y se auditan; los restantes se enriquecen sin falsificar revisión humana.

Para referencias Wikipedia específicas:

- resolver la página exacta;
- obtener `pageprops.wikibase_item`, extracto introductorio y `pageimages`;
- consultar Wikidata por lotes;
- comparar el año esperado con propiedades temporales pertinentes, priorizando `P571` (inception), `P575` (discovery/invention), `P577` (publication date), `P580` (start time) y `P585` (point in time), sin asumir que todas significan lo mismo;
- registrar qué propiedad produjo la corroboración;
- generar contexto sólo desde propiedades concretas no redundantes;
- marcar contradicciones y no modificar el año automáticamente.

## 6. Medios por lotes

Para la imagen principal o candidata:

- recuperar `imageinfo` y `extmetadata` en pocas imágenes por solicitud;
- exigir licencia abierta explícita;
- comprobar tamaño y tipo de archivo razonables;
- verificar que la imagen provenga de la página exacta o que los términos del archivo coincidan con la entidad/hito;
- almacenar una manifestación estática reproducible, no depender de una búsqueda distinta en cada sesión del jugador.

El runtime puede conservar Commons como fallback no bloqueante, pero debe preferir el medio factual curado de v1.8.

## 7. Artefactos obligatorios

Crear o actualizar:

- `js/editorial-verification-v18.js`: overlay estático con estados, evidencia y medios aceptados;
- `reports/factual-verification-v18.json`: resumen completo de 300 hitos;
- `tools/factual-enrichment-v18.mjs`: pipeline reproducible de enriquecimiento;
- `tools/factual-quality-report-v18.mjs`: gate de calidad y contradicciones;
- documentación de metodología y limitaciones;
- pruebas de integridad para confirmar que IDs/años/calendario no cambiaron.

## 8. Criterios cuantitativos

El éxito no se mide por «300 verificados». Medir por:

- `N_manual_verified` preservado o aumentado sólo mediante revisión real;
- `N_structured_corroborated`;
- `N_item_specific_reference`;
- `N_needs_review`;
- contradicciones temporales detectadas;
- contextos nuevos con datos concretos;
- imágenes aceptadas con licencia + procedencia completas;
- tasa de rechazo de imágenes irrelevantes o con derechos ambiguos;
- 0 cambios no autorizados en IDs/años/calendario.

## 9. Criterios de aceptación

La versión puede pasar a revisión final sólo si:

- QA técnico completo está verde;
- no hay cambios en 300 IDs ni años históricos;
- calendario y scheduler conservan integridad;
- ninguna corroboración automática activa `editorialVerified`;
- toda nueva imagen integrada tiene licencia y procedencia estructuradas;
- toda contradicción temporal queda en `needs_review` y bloquea una falsa corroboración;
- contexto nuevo añade valor concreto y no relleno;
- los reportes distinguen observación, derivación y verificación manual.

No fusionar a `main`. Publicar en Pages sólo después del metaanálisis post-integración y CI verde del mismo SHA que se despliegue.