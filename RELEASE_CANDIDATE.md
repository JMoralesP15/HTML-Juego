# QUÉ AÑO 1.2.1 — Instrumentation & Consolidation

## Propósito

Esta versión estabiliza la línea v1.2 antes de nuevas decisiones de UX/UI o jugabilidad. No modifica el banco de años/IDs/calendario ni incorpora una nueva mecánica principal.

## Cambios de v1.2.1

- versionado unificado en `1.2.1`;
- dependencias fijadas, con lockfile generado por CI antes del cierre del candidato;
- PostHog opcional y no bloqueante;
- cuatro feature flags de experimentos preparadas e inactivas;
- auditoría axe-core en flujos canónicos;
- regresión visual canónica desktop/mobile;
- reporte de cobertura editorial y geográfica;
- retiro del scaffold Storybook v1.1 no conectado a producción;
- documentación de arquitectura y roadmap condicionado por datos;
- staging/preview en Vercel como complemento de GitHub Pages.

## Invariantes

- 300 preguntas esperadas.
- 365 días de schedule y cooldown mínimo de 52 días según auditoría existente.
- calendario publicado de 1.096 días sin mismatches.
- cero assets faltantes.
- cero date leaks.
- funcionamiento `file://` preservado.
- analítica no requerida para ejecutar ninguna interacción.

## Criterios antes de aprobar merge

1. tests funcionales existentes pasan;
2. QA browser existente pasa;
3. axe sin violaciones críticas/relevantes acordadas;
4. snapshots visuales reproducibles;
5. auditoría de contenido intacta;
6. `package-lock.json` presente y CI usando `npm ci`;
7. staging Vercel accesible;
8. documentación y Jira conciliados con evidencia real;
9. PR revisado por una persona;
10. `main` no se modifica automáticamente.

## Deuda deliberadamente postergada

La superposición `archive-night*` / `atlas-v12*` sigue siendo la principal deuda estructural. Se documenta y controla mediante regresión antes de intentar una refactorización más profunda. Hacer esa cirugía al mismo tiempo que se introduce analítica habría aumentado demasiado el riesgo de atribución y regresión.
