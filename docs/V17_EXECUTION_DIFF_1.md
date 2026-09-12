# v1.7 — Diferencias después de la primera ejecución

## Alcance

Comparación entre el diagnóstico que originó `PROMPT_V17_FINAL_RESOLUTION.md` y la primera ejecución material sobre el PR #8. Los valores se etiquetan como observados cuando proceden de CI/código; no se interpretan como evidencia conductual de usuarios.

## 1. Arquitectura

| Indicador | Antes de esta ejecución | Después, run #111 | Interpretación |
|---|---:|---:|---|
| Hojas CSS activas | 6 | 4 | Se retiraron del runtime los estilos `compat/polish`; luego el contrato explícito de interacción añade una quinta hoja con responsabilidad transversal, no histórica. |
| `MutationObserver` activos | 1 | 0 | Analítica migrada a `__QYA_RUNTIME__.onRender`. |
| Lifecycle assignments | 3 | 1 | Eliminados monkey patches de `renderGame`/`renderSummary`; queda el wrapper deliberado de `setView` en `runtime-contract.js`. |
| Patch styles activos | >0 históricamente | 0 | El gate arquitectónico queda verde. |
| Behavior assignments | no presupuestados | 10 | Permanecen visibles. No se migran sólo para mejorar el contador. |
| CSS `archive-night-polish.css` | activo/legacy | retirado y luego borrado | Sus contratos útiles se trasladan a propietarios explícitos o se validan por QA. |
| CSS `atlas-v12-compat.css` | activo/legacy | retirado y luego borrado | La compatibilidad deja de ser una capa de cascade. |
| JS `atlas-v12-compat.js` | activo | reemplazado por `semantic-contract.js` y borrado | Las clases semánticas se aplican vía contrato de render, sin reemplazar renderers. |
| JS `analytics.js` | observer de DOM | `analytics-v17.js` por eventos | El archivo heredado se retiró del runtime y posteriormente del árbol. |

### Hallazgo posterior

Retirar los estilos compatibilidad reveló dos contratos que estaban escondidos dentro del parche: foco visible y `prefers-reduced-motion`. Esto es precisamente el tipo de información que se pierde cuando un archivo llamado `compat` contiene reglas funcionales. Se creó `interaction-v17.css` como propietario explícito de esos contratos.

## 2. Reproducibilidad

| Indicador | Antes | Después |
|---|---|---|
| `package.json` | `1.7.0-beta.1` | `1.7.0-beta.1` |
| `package-lock.json` raíz | `1.2.1` | `1.7.0-beta.1` |
| CI previo a `npm ci` | regeneraba lockfile | valida metadata commiteada y ejecuta `npm ci` directamente |
| Vulnerabilidades npm observadas | 0 | 0 |

El lockfile fue normalizado una vez por CI y el workflow se corrigió después para impedir que vuelva a ocultar divergencias mediante regeneración silenciosa.

## 3. Deuda editorial

El reporte `1.7-editorial-provenance-2` desagrega la cobertura anterior:

- 300 preguntas totales;
- 300 con alguna URL de fuente;
- 19 `editorialVerified` explícitas;
- 281 con referencia general que debe reemplazarse/revisarse;
- 18 fuentes `item_specific` y 1 `topic_specific`;
- 281 referencias `homepage_or_generic` según la política conservadora;
- 45 imágenes locales explícitas;
- 3 fotografías/documentos clasificados como `documentary_with_provenance`;
- 42 ilustraciones generadas por el proyecto heredadas de v0.8;
- 0 láminas sintéticas v1.2/v1.4 creadas para cumplir cuotas;
- 255 hitos sin imagen local, estado editorial válido;
- 0 imágenes con licencia formal estructurada en el banco actual.

La diferencia importante es que las 42 ilustraciones antiguas ya no quedan invisibles dentro de una métrica genérica de “imagen existente”. Se reconocen por lo que son: ilustraciones del proyecto, no documentos históricos.

## 4. Integridad del producto observada en run #111

Pasaron antes de la etapa visual:

- 28/28 contratos Node;
- banco de 300 preguntas sin IDs duplicados, años fuera de rango ni assets faltantes;
- calendario publicado: 1096 días, 0 mismatches;
- simulación: 365 días, `minGap=52`, 0 repeticiones bajo 30 días;
- gate de arquitectura: verde;
- gate editorial/procedencia: verde;
- regresión visual canónica: 2/2;
- accesibilidad axe: 4/4.

La suite visual dejó 71/74 verdes. Los tres fallos fueron informativos:

1. reduced-motion se había perdido al retirar el CSS compatibilidad;
2. foco visible se había perdido por la misma causa;
3. un test v1.3 todavía exigía láminas sintéticas en cinco familias, contradiciendo expresamente la política v1.7.

Los dos primeros son regresiones reales y se corrigieron en `interaction-v17.css`. El tercero es un contrato histórico obsoleto y se sustituyó por una prueba que exige **cero filler sintético**, 45 imágenes explícitas y 3 documentales.

## 5. Diferencia conceptual

Antes el proyecto podía declarar mejora porque aumentaba un denominador de cobertura. Después de v1.7 la unidad de análisis cambia:

`cantidad de campos llenos` → `procedencia + tipo + certeza + deuda visible`

Eso significa que 19 verificaciones honestas y 281 pendientes clasificadas son un estado de mayor calidad que 300 supuestas verificaciones derivadas automáticamente.

## 6. Deuda que permanece después de la primera ejecución

No se considera blocker automático:

- 10 overrides globales de comportamiento, principalmente timer/acciones v1.5 y detalle v1.6. Están cubiertos por tests y migrarlos sin pruebas de paridad sería una reescritura innecesaria.
- 1 wrapper de lifecycle (`setView`) que concentra la notificación del runtime. Puede eliminarse en el hardening final si el renderer canónico adopta el hook directamente.
- `archive-night-polish.js`, pequeño override de numeración de archivo, todavía activo.
- 281 fuentes generales pendientes de sustitución/revisión factual.
- 42 ilustraciones heredadas sin `imageSource` porque son composiciones propias de v0.8; deben seguir claramente rotuladas como ilustración.
- 3 documentales con procedencia, pero el esquema todavía no contiene licencia estructurada.

## 7. Decisión para segunda pasada

El segundo prompt debe concentrarse en tres asuntos, no abrir otra versión dentro de la versión:

1. retirar el último patch script trivial (`archive-night-polish.js`) y, si es de riesgo bajo, llevar el hook de render al propietario canónico;
2. endurecer procedencia editorial/media y producir un backlog por pregunta sin fabricar verificación;
3. cerrar QA sobre el head definitivo y realizar una revisión de coherencia entre código, tests, reportes y documentación.

Los behavior overrides con gameplay se migran sólo si aparece una razón funcional o un test de paridad específico. La deuda visible y acotada es preferible a una refactorización ceremonial.