# QUÉ AÑO

Juego web estático de estimación temporal: cinco hitos por sesión, 15 segundos por respuesta y un cierre orientado a aprendizaje y repaso.

## Estado actual

- **Público estable:** v1.5 en GitHub Pages desde `infra/pages-setup`.
- **v1.6:** aprendizaje/resultados, PR #7 en borrador. No publicada ni fusionada a `main`.
- **v1.7 beta:** consolidación arquitectónica y calidad editorial en `feature/architecture-editorial-consolidation-v1.7`. Esta es la rama de trabajo actual.
- **`main`:** referencia histórica atrasada. No debe usarse para inferir el estado público actual.

La fuente narrativa canónica del proyecto es `docs/CONTEXT_CURRENT_TRUTH.md`. La evolución anterior se conserva mediante `docs/CONTEXT_ARCHIVE_INDEX.md`.

## Ejecutar

El juego conserva su modo offline: puede abrirse `index.html` directamente. La analítica se desactiva en `file://`, localhost y QA automatizado; nunca participa en decisiones de gameplay.

Para QA con Node 24:

```bash
npm ci
npm test
npm run audit
npm run report:content
npm run report:culture
npm run report:architecture
npm run report:editorial
npx playwright install --with-deps chromium
npm run qa:accessibility
npm run qa:regression
npm run qa:visual
```

## Qué cambia en v1.7

v1.7 no añade mecánicas. Reduce deuda acumulada:

- introduce un contrato único de ciclo de render para las capas de producto;
- elimina MutationObservers de presentación v1.4-v1.6 y el wrapper visual de `setView` v1.3;
- consolida los estilos de producto v1.3-v1.6 en `experience-v17.css`, reduciendo el cascade activo de 10 a 6 hojas;
- deja de generar automáticamente láminas SVG y contexto para alcanzar cuotas artificiales de cobertura;
- diferencia procedencia, revisión pendiente y verificación editorial explícita;
- incorpora presupuestos de deuda arquitectónica y editorial a CI;
- mantiene intactos IDs, años, calendario, scheduler, persistencia, timer, scoring, offline, accesibilidad, Repaso, Sets y Learning Gain.

## Calidad editorial

Una URL no significa que un hito haya sido fact-checkeado. Un score cultural tampoco. Desde v1.7 `editorialVerified` es el único estado interno tratado como verificación explícita. Una pregunta puede no tener imagen; esa ausencia es preferible a una placa genérica que aparente evidencia documental.

Los reportes se generan en:

- `reports/content-metrics.json`
- `reports/culture-curation-v14.json`
- `reports/architecture-v17.json`
- `reports/editorial-quality-v17.json`

## Gobernanza

Antes de cambiar producto, clasificar la evidencia como **observada**, **derivada**, **objetivo** o **recomendación**. Los prompts y tests históricos son trazabilidad, no constitución eterna. Ninguna edición preview se publica o fusiona a `main` automáticamente.
