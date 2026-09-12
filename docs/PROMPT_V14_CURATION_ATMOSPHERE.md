# Prompt maestro — v1.4 · Curaduría, atmósfera y valor cultural

Trabaja de manera autónoma sobre `feature/curation-atmosphere-v1.4`, derivada de `feature/product-loop-v1.3`. El objetivo no es sumar funciones por sumar, sino hacer que **QUÉ AÑO** se sienta más claro, más rico, más documental y más cercano a un juego de cultura general que a un banco de trivia de nicho.

## Restricciones

- No fusionar a `main` ni a la rama base sin aprobación humana.
- Mantener el juego estático, usable por `file://` y con fallback offline.
- No modificar IDs, años históricos ni calendario salvo error factual objetivo y documentado.
- No incorporar PII.
- No incorporar archivos multimedia cuya licencia no esté identificada.
- No presentar como “verificada” una imagen obtenida sólo por búsqueda automática.
- No usar autoplay audible. Todo audio debe partir desde un gesto explícito del usuario y poder silenciarse.
- Preservar navegación por teclado, `prefers-reduced-motion`, contraste y targets táctiles.

## 1. Cerrar primero la deuda de QA de v1.3

Antes de añadir valor nuevo, corregir los cinco fallos conocidos del QA del PR v1.3:

1. los tests de divulgación progresiva y Sets deben partir con `detailDialog` cerrado;
2. eliminar el overflow horizontal de feedback en 390×844 y 375×667;
3. mantener verdes tests unitarios, auditoría de contenido, axe y regresión visual.

No ocultar un overflow mediante una captura o un cambio de test: corregir la causa de layout o contener explícitamente el componente responsable.

## 2. UI/UX v1.4

Refinar la interfaz sin reescribir la aplicación:

- reducir densidad visual no informativa;
- reforzar jerarquía pregunta → estimación → resultado → aprendizaje;
- hacer que el feedback tenga aspecto de ficha documental, no de panel SaaS;
- mostrar mejor qué parte del contenido es esencial y cuál es ampliación;
- mejorar móvil primero, especialmente 375–390 px;
- mantener la identidad “archivo nocturno / atlas temporal”.

Añadir un pequeño indicador editorial en el feedback que explique el nivel de alcance cultural del hito: `Cultura general`, `Contexto recomendado` o `Especialista`, sin convertirlo en una nota escolar ni penalizar al jugador.

## 3. Audio: atmósfera clásica sin problemas de derechos

Crear una capa sonora opcional con Web Audio API, sin grabaciones externas. Debe ser un ambiente generativo de cámara, sobrio y breve, construido con osciladores y envolventes, inspirado en recursos armónicos de tradición clásica pero sin copiar una grabación ni una obra concreta.

- Estado inicial: apagado.
- Inicio sólo por interacción explícita.
- Botón separado `Ambiente` y control de volumen reutilizando las preferencias existentes cuando sea posible.
- Pausar/silenciar cuando la pestaña quede oculta.
- Sonidos funcionales existentes deben seguir siendo distinguibles.
- Si Web Audio no está disponible, el juego funciona igual.

## 4. Densificar el valor de cada fecha

Añadir una capa editorial no destructiva sobre las 300 preguntas. Para cada hito, cuando haya datos suficientes, estructurar el aprendizaje en bloques breves:

- `Por qué importa`: significado del hito en una frase.
- `En el mapa del tiempo`: uno o dos anclajes cronológicos cercanos.
- `Dato para recordar`: una pieza breve de información memorable.
- `Conexión`: relación con otro hito del banco cuando exista.

No fabricar información. Reutilizar primero los contextos y fuentes existentes; cualquier expansión que no esté respaldada debe quedar marcada para revisión editorial.

## 5. Auditoría de “cultura general” de las 300 preguntas

Evaluar cada pregunta con una rúbrica explícita de 0–100 y una clasificación editorial. La puntuación no pretende medir verdad histórica, sino adecuación al público general.

Componentes recomendados:

- impacto social/histórico global o regional: 0–30;
- reconocimiento probable fuera del nicho: 0–25;
- persistencia cultural o curricular: 0–20;
- capacidad de generar aprendizaje aun sin conocer el tema: 0–15;
- claridad de la pregunta sin conocimiento especializado previo: 0–10.

Clasificación:

- `core` ≥ 70: cultura general;
- `context` 50–69: importante, pero necesita buen contexto;
- `niche` < 50: especialista o subcultural.

La clasificación debe ser conservadora. No eliminar automáticamente hitos de cine de autor, discos de culto, videojuegos de diseño influyente o innovaciones regionales. El objetivo es **identificarlos y decidir cómo usarlos**: diario general, Sets temáticos, práctica o reemplazo futuro.

Generar `reports/culture-curation-v14.json` y `docs/CONTENT_CURATION_V14.md` con:

- conteos y porcentajes por nivel;
- distribución por categoría;
- candidatos de nicho priorizados para revisión;
- explicación de por qué algunos hitos importantes siguen siendo poco adecuados como pregunta diaria sin contexto;
- recomendaciones de equilibrio geográfico. La concentración previa de EE. UU., Chile, Japón y Reino Unido debe ser tratada como una señal editorial, no como error matemático.

## 6. Fotografías e imágenes con licencia abierta

Construir una capa de enriquecimiento progresivo para intentar obtener una imagen documental para cualquier fecha cuando haya conexión, sin romper el modo offline.

Fuente prioritaria: Wikimedia Commons, usando la API de MediaWiki. Solicitar sólo pocos resultados por pregunta y metadatos necesarios. Renderizar una imagen remota únicamente cuando:

- la licencia declarada sea de una lista permitida: dominio público, CC0, CC BY o CC BY-SA;
- exista URL de la página de archivo o descripción;
- exista atribución o autor disponible cuando la licencia lo requiera;
- el resultado pase una validación mínima de relevancia basada en título de archivo, título del hito y términos de búsqueda.

Mostrar bajo la imagen: autor/crédito, licencia y enlace a la ficha original. No usar licencias NC/ND ni resultados sin licencia legible. No afirmar que una imagen fue “curada” si fue elegida automáticamente.

Orden de preferencia visual:

1. asset documental local ya existente y con fuente;
2. imagen abierta remota validada por licencia;
3. ilustración local existente;
4. lámina editorial generada offline.

Añadir cache local sólo de metadatos/URL, no de archivos binarios, y límite temporal para no consultar Commons en cada render. Si la red falla, no debe aparecer error visible ni bloquear la partida.

## 7. Telemetría

Extender la instrumentación, sin PII, sólo para medir la nueva capa:

- `ambient_audio_toggled`;
- `open_media_loaded` / `open_media_failed`;
- `culture_context_expanded`;
- propiedad `culture_tier` en `question_seen` y `answer_submitted` si puede añadirse sin acoplar gameplay a analytics.

La telemetría debe seguir siendo no bloqueante. No crear conclusiones ni dashboards con datos inventados: si no hay eventos reales, documentar que la línea base aún no existe.

## 8. QA adicional

Añadir pruebas para:

- cero overflow horizontal en pregunta y feedback a 375×667 y 390×844;
- ambiente sonoro apagado por defecto y activable por gesto;
- `detailDialog` no bloquea flujos de test no relacionados;
- toda imagen abierta renderizada incluye licencia y enlace de fuente;
- fallo de red de Commons conserva el fallback offline;
- las 300 preguntas reciben `cultureTier` y `cultureScore` válidos;
- ninguna clasificación cambia ID, año o asignación del calendario;
- reporte de curaduría es determinístico.

## 9. Criterio de cierre

La iteración termina sólo con:

- CI verde;
- versión coherente en `package.json` e interfaz;
- reporte editorial generado;
- capa de imágenes abiertas funcionando como mejora progresiva y con atribución;
- audio opcional funcionando sin autoplay;
- v1.3 preservada funcionalmente;
- PR draft contra `feature/product-loop-v1.3`, sin merge automático.

El informe final debe separar con claridad: **implementado**, **validado automáticamente**, **requiere validación humana/editorial**, y **bloqueado por infraestructura externa**.