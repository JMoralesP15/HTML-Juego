# Metaanálisis del prompt v1.8 de verificación factual

## Conclusión

El prompt es internamente coherente si se interpreta como un sistema de **graduación de evidencia**, no como una orden de declarar 300 hitos «verificados». Su principal fortaleza es separar cobertura, corroboración estructurada y revisión manual.

## Contradicciones internas detectadas y resolución

### 1. «Verificación factual» vs. automatización por lotes

Una verificación manual exige juicio sobre qué evento está preguntando el juego. Wikidata puede contener varias fechas igualmente válidas: fundación, anuncio, publicación, estreno, lanzamiento o apertura. Por tanto, el pipeline automático no puede activar `editorialVerified`.

**Resolución:** la automatización produce `structured_corroborated`; `manual_verified` requiere evidencia previamente revisada o una revisión humana posterior.

### 2. «Añadir valor» vs. llenar todos los campos

Obligar a crear contexto para cada hito reproduciría la deuda de v1.2-v1.4 con otra etiqueta.

**Resolución:** un texto nuevo sólo existe cuando hay un dato concreto adicional. Cobertura incompleta es un resultado válido.

### 3. «Mejorar fotografías» vs. aumentar número de imágenes

Una política basada en cantidad incentivaría logos, pósteres o imágenes genéricas.

**Resolución:** no existe objetivo porcentual de imágenes. Se miden relevancia, derechos y procedencia. La tasa de rechazo es una señal positiva si evita medios mediocres.

### 4. Congelar años vs. detectar errores

El contrato histórico prohíbe modificar años automáticamente, pero una verificación puede encontrar una discrepancia objetiva.

**Resolución:** toda discrepancia se registra como blocker editorial `needs_review`; nunca se corrige silenciosamente durante el batch.

### 5. Wikipedia + Wikidata como «dos fuentes»

Ambos pertenecen al ecosistema Wikimedia y pueden compartir dependencia editorial.

**Resolución:** su coincidencia se denomina corroboración estructurada, no doble verificación independiente.

## Contradicciones externas con el repositorio

### A. v1.7 trata `editorialVerified` como único marcador de verificación

El prompt v1.8 es compatible porque preserva esa semántica. Los nuevos estados se añaden como evidencia auxiliar y no redefinen `editorialVerified`.

### B. v1.7 permite ausencia de imagen

Compatible. v1.8 no restablece cuotas de cobertura y debe preferir ausencia antes que una imagen abierta irrelevante.

### C. Commons v1.4 selecciona imágenes en runtime mediante búsqueda

El enfoque actual es útil como progressive enhancement, pero no es reproducible como curaduría editorial. Una búsqueda puede devolver resultados distintos con el tiempo.

**Resolución:** v1.8 genera un manifest estático de medios aceptados y lo prioriza. La búsqueda viva queda sólo como fallback no bloqueante y claramente automático.

### D. Persistencia/offline

Las evidencias textuales deben vivir en archivos locales. Los medios remotos no pueden convertirse en dependencia para jugar ni aprender.

**Resolución:** el texto factual queda estático; una imagen remota es mejora progresiva y su ausencia/fallo no rompe feedback ni navegación.

## Riesgos metodológicos

1. Las propiedades temporales de Wikidata no tienen una semántica universal. El mismo `P577` puede ser correcto para un libro, álbum o película, pero no para un evento político.
2. El año puede aparecer en la introducción de Wikipedia por razones distintas a la fecha preguntada.
3. `PageImages` optimiza representación de página, no necesariamente valor documental.
4. Una licencia abierta puede permitir reutilización pero la atribución debe conservarse igualmente.
5. Descripciones estructuradas pueden ser demasiado genéricas. Debe existir un gate que compare el texto nuevo contra título/prompt/fact.

## Ajustes que debe obedecer la ejecución

- Usar la categoría y `kind` para ordenar propiedades temporales esperables; no tratar todas las propiedades como equivalentes.
- Exigir coincidencia del año y registrar la propiedad exacta usada.
- Nunca generar contexto únicamente desde la descripción corta de Wikidata.
- Para enriquecer texto, exigir al menos un dato adicional estructurado: fecha completa, persona/organización, ubicación, creador, fabricante, director, autor, fundador, editorial/sello o país.
- Rechazar automáticamente una imagen si su archivo sugiere `logo`, `poster`, `cover`, `icon`, `flag`, `seal` o `map`, salvo excepción documentada.
- Separar reportes de evidencia y de medios.

## Función objetivo corregida

No maximizar cobertura:

`max(cobertura)`

Sino maximizar valor esperado bajo restricciones:

`max(datos concretos y trazables + medios relevantes)`

sujeto a:

`0 cambios históricos no autorizados + 0 falsas verificaciones + licencias válidas + QA verde`.

## Dictamen

**PROMPT APTO PARA EJECUCIÓN**, con la condición de que los resultados automáticos se etiqueten como corroboración y no como verificación manual. El metaprompt posterior debe auditar precisamente que esa frontera no haya sido erosionada por la implementación.