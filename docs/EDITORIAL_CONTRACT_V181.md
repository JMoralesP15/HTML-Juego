# QUÉ AÑO v1.8.1 — Contrato editorial de pantalla

## Objetivo

Después de responder, el jugador debe aprender algo interesante sobre el hito. La interfaz no debe exponer la estructura interna del banco ni repetir el mismo dato con distintas etiquetas.

## Contrato de pantalla

### Resultado inmediato
Muestra sólo:
- año elegido → año real;
- diferencia temporal;
- título del hito.

### Aprendizaje breve visible
Un único bloque narrativo de 2–4 frases, normalmente 45–75 palabras.
Debe integrar de forma natural qué ocurrió y por qué vale la pena recordarlo.

No debe mostrar como etiquetas visibles:
- «Qué fue»;
- «Por qué importa»;
- «Dato para recordar».

Esas categorías pueden existir internamente para ayudar a redactar o revisar, pero no gobiernan la interfaz.

### Profundizar
Sólo aparece cuando existe información adicional real.
El contexto ampliado debe añadir información nueva, normalmente 60–120 palabras. No puede ser una repetición del aprendizaje breve.

Puede incluir:
- antecedentes relevantes;
- consecuencias;
- una curiosidad documentada;
- una imagen documental útil;
- la fuente.

### Nota de precisión cronológica
Es opcional. Se usa únicamente cuando el hito admite fechas plausibles distintas, por ejemplo presentación vs. venta, hallazgo vs. publicación o nacimiento vs. anuncio.
No sustituye el aprendizaje ni se presenta como «por qué importa».

### Fuente
La fuente respalda el contenido. No es contenido narrativo.
La interfaz no debe convertir campos de una base de datos en frases educativas.

## Lenguaje prohibido para el jugador

Evitar fórmulas metadiscursivas como:
- «la ficha indica…»;
- «la ficha identifica…»;
- «preguntamos por…» salvo una nota cronológica excepcional y reformulada de manera natural;
- «la fecha es el punto de entrada…»;
- «contenido complementario…»;
- cualquier referencia al modelo de datos, verificación o sistema editorial.

## Imágenes

Una imagen sólo se usa si aporta valor documental o explicativo.
Orden de preferencia:
1. fotografía/documento histórico directamente relacionado;
2. material institucional o de archivo con procedencia y derechos claros;
3. ilustración realmente informativa;
4. ninguna imagen.

«Sin imagen» es un resultado válido y preferible a material genérico, anacrónico o meramente decorativo.

## Separación editorial

Para revisión interna, cada propuesta v1.8.1 utiliza:

```js
{
  summary: '',
  expanded: '',
  dateNote: '',
  sourceLabel: '',
  source: '',
  confidence: 'high | medium | review',
  imageBrief: ''
}
```

`summary` y `expanded` no se aplican automáticamente al juego. Requieren revisión humana.

## Reglas de aceptación

Una propuesta sólo puede aprobarse si:
- suena natural y explica el evento, no la ficha;
- el bloque breve tiene valor por sí solo;
- el contexto ampliado agrega información nueva;
- no introduce afirmaciones que la fuente no soporte;
- la nota cronológica sólo aparece cuando resuelve una ambigüedad real;
- la imagen sugerida es relevante y contemporánea al hito o claramente contextual;
- el texto puede leerse cómodamente en móvil.

## Lote piloto

El primer lote contiene 50 hitos estratificados entre Tecnología, Historia, Ciencia, Cine, Música, Videojuegos, Chile y Cultura. Su objetivo es validar el contrato y el flujo de revisión antes de escalar a los 300.
