# Metaanálisis del metaprompt de hardening v1.7

## 1. Coherencia interna

El prompt tiene una tensión deliberada: pide eliminar patch layers pero prohíbe reescrituras riesgosas. La resolución correcta es usar **riesgo funcional** como criterio de decisión, no el número bruto de overrides. Por tanto, el gate obligatorio se limita a patch layers de responsabilidad trivial/duplicada y deja los behavior overrides de gameplay como deuda aceptable si están cubiertos por QA.

Otra tensión aparece entre “backlog 300/300” y “no inventar verificación”. Se resuelve haciendo que el backlog describa **la siguiente acción de búsqueda/revisión**, no el resultado de esa revisión. Un query o proveedor sugerido nunca modifica `editorialVerified`.

## 2. Coherencia con el estado observado

El último run completo revisado antes de este metaprompt, #111, tiene 71/74 visuales verdes y tres fallos. Dos son regresiones funcionales concretas producidas por retirar CSS compatibilidad: foco visible y reduced motion. El tercero exige la antigua cuota de láminas sintéticas y contradice la política aprobada en v1.7. Por ello:

- restaurar foco/reduced motion es corrección de producto;
- reemplazar el test de familias visuales es corrección de contrato;
- no corresponde restaurar láminas generadas sólo para satisfacer el test.

La arquitectura observada ya alcanzó 0 MutationObservers, 1 lifecycle wrapper y 4 estilos activos antes de añadir el contrato transversal de interacción. El hardening debe comprobar que la nueva hoja no reintroduce un patrón `fix/compat/polish`; `interaction-v17.css` tiene un propietario semántico explícito y no se considera parche histórico.

## 3. Revisión de criterios editoriales

El reporte de procedencia reveló un dato que cambia la interpretación de las imágenes: 45 imágenes locales no significan 45 documentos. Son 3 documentales con procedencia y 42 ilustraciones generadas por el propio proyecto en v0.8. El prompt acierta al separar ambas clases.

Sin embargo, exigir “open rights known” a las tres documentales como blocker sería excesivo antes de revisar cada fuente. La política correcta es:

- procedencia mínima y alt/credit obligatorios para documentales locales;
- rights metadata desconocida se mantiene visible como deuda;
- sólo una licencia explícita puede promover el asset a `open rights known`.

## 4. Backlog editorial: evitar falsa precisión

El proveedor recomendado no debe inferirse sólo por categoría. `Ciencia` puede requerir NASA, OMS, Nobel o una universidad; `Historia` puede requerir un archivo nacional distinto según país. Por ello el backlog debe combinar categoría + región + título y producir:

- `providerFamily`, no una URL inventada;
- `searchQuery`, no una supuesta fuente específica;
- `factualPriority` basada en el estado observado;
- `imageProviderOrder`, no una licencia supuesta.

Esto mantiene el reporte útil sin convertir la automatización en un bibliotecario con exceso de confianza, enfermedad profesional bastante extendida en software.

## 5. Arquitectura: qué no hacer

No se recomienda trasladar ahora todo el timer v1.5 o `openDetail` v1.6 al núcleo. Son reglas con múltiples contratos browser y de persistencia ya cubiertos por suites específicas. Una migración en esta versión aumentaría superficie de regresión sin necesidad de producto.

Sí es razonable intentar dos reducciones de bajo riesgo:

1. integrar `archiveNumber` en `archive-night.js` y borrar `archive-night-polish.js`;
2. evaluar el wrapper de `setView`. Sólo eliminarlo si el hook explícito puede colocarse en el propietario canónico con un cambio local y pruebas existentes suficientes. Si la modificación requiere tocar demasiado código, un único wrapper documentado es una arquitectura transicional aceptable.

## 6. Métrica de aceptación revisada

Se adopta una matriz de tres niveles:

### Blocker
Fallo de CI, regresión accesibilidad/visual, lock inconsistente, runtime observer, patch trivial activo, dato sin fuente, filler sintético o falso `editorialVerified`.

### Deuda aceptable
Fuente general pendiente, rights metadata desconocida pero visible, behavior monkey patch testeado, concentración geográfica descrita.

### Roadmap posterior
Migración completa hacia módulos estables, revisión factual de 281 fuentes, expansión documental abierta, experimentación con usuarios y reducción de concentración del banco basada en criterio editorial.

## 7. Veredicto previo a ejecución

El metaprompt es coherente después de estas precisiones. Puede ejecutarse sin cambiar el alcance de v1.7: hardening estructural, backlog editorial determinista y cierre QA. Su condición de éxito será `READY_FOR_HUMAN_REVIEW`, no `deuda=0`.