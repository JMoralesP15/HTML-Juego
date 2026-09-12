# QUÉ AÑO v1.2.1

Juego web estático de estimación temporal con cinco hitos por sesión. La versión `1.2.1` es una iteración de **instrumentación y consolidación**: no amplía el gameplay principal, sino que estabiliza dependencias, CI, observabilidad, accesibilidad y regresión visual.

## Estado de ramas

- `main`: canal público/estable. No se actualiza automáticamente desde esta rama.
- `infra/pages-setup`: integración que contenía la versión funcional v1.2 previa a esta intervención.
- `feature/instrumentation-consolidation-v1.2.1`: candidato actual. Todo cambio de v1.2.1 se valida aquí antes de revisión humana.

## Ejecutar

El juego conserva su modo offline: abre `index.html` directamente. La analítica se desactiva en `file://` y no participa en ninguna decisión de gameplay.

Para QA con Node 24:

```bash
npm ci
npm test
npm run audit
npm run report:content
npx playwright install --with-deps chromium
npm run qa:accessibility
npm run qa:regression
npm run qa:visual
```

## Alcance de v1.2.1

- versionado coherente;
- dependencias fijadas y lockfile reproducible;
- PostHog no bloqueante y sin texto libre/PII;
- feature flags preparadas pero inactivas durante baseline;
- axe-core en flujos canónicos;
- snapshots visuales canónicos desktop/mobile;
- reporte automatizado de cobertura editorial y diversidad geográfica;
- Vercel para staging/preview, manteniendo GitHub Pages como estable;
- documentación de arquitectura y decisiones posteriores al baseline.

## Arquitectura

La aplicación sigue siendo HTML/CSS/JS clásico para preservar ejecución local. Consulta `docs/ARCHITECTURE.md` y `docs/ANALYTICS.md`.

## Política de cambios

Los IDs, años, calendario publicado y banco de preguntas no se modifican en v1.2.1 salvo corrección objetiva y trazable. Un despliegue o una métrica nueva no equivale a evidencia de mejora UX: primero baseline, después experimento. La estadística, para desgracia de quienes prefieren los botones brillantes, exige observar antes de concluir.
