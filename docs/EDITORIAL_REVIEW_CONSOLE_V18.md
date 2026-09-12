# QUÉ AÑO v1.8 — Consola de revisión editorial

## Objetivo

`/review/` es una interfaz estática para revisar manualmente las 300 fichas del banco sin exponer credenciales ni escribir directamente en GitHub.

Cada ficha separa tres decisiones:

1. **Hecho/fuente**: correcto, dudoso, fuente por revisar o incorrecto.
2. **Texto de aprendizaje**: aprobado, editar, genérico o redundante.
3. **Fotografía/imagen**: aprobada, irrelevante, anacrónica, derechos por revisar o ausencia de fotografía aceptable.

La ausencia de imagen es un estado válido. Una licencia abierta no convierte una imagen irrelevante en una buena fotografía documental.

## Persistencia

La consola guarda automáticamente en `localStorage` con la clave:

`que-ano-editorial-review-v18`

No envía decisiones al repositorio ni requiere token de GitHub.

## Exportar / importar

El botón **Exportar revisión** descarga un JSON versionado con las decisiones, notas y ediciones manuales. El mismo archivo puede importarse después en otro navegador o entregarse para aplicar los cambios al banco.

Esquema conceptual:

```json
{
  "schema": "que-ano-editorial-review",
  "version": "1.8.0-beta.1",
  "records": {
    "mac": {
      "factualStatus": "approved",
      "textStatus": "approved",
      "mediaStatus": "anachronistic",
      "mediaChoice": "none",
      "note": "La imagen propuesta corresponde a hardware contemporáneo.",
      "edits": {}
    }
  }
}
```

## Priorización

La cola ordena primero:

1. `needs_review`
2. `item_specific_reference`
3. `structured_corroborated`
4. `manual_verified`

También permite filtrar por estado de revisión, categoría, existencia de fotografía candidata y texto de búsqueda.

## Atajos

- `←` / `→`: navegar
- `A`: aprobar lo disponible de la ficha
- `R`: marcar la ficha para revisión
- `N`: aceptar que no necesita fotografía

Los atajos se desactivan mientras se escribe en inputs o textareas.

## Criterio de aceptación

Una ficha se considera **revisada** sólo cuando las tres dimensiones principales tienen decisión. Se considera **aprobada** cuando hecho y texto están aprobados y la imagen está aprobada o explícitamente marcada como `no_photo`.

## Seguridad editorial

La consola nunca cambia `year`, `id`, calendario ni scheduler. Tampoco convierte corroboración automática en `editorialVerified`. Las decisiones exportadas requieren un paso posterior de integración y QA antes de afectar el juego público.
