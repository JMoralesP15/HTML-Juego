# QUÉ AÑO — Auditoría de trazabilidad y arquitectura v1.8.3

Base: `feature/audit-contracts-editorial-batch02-v1.8.2` · corte 2026-09-13. Draft PR: https://github.com/JMoralesP15/HTML-Juego/pull/10. Esta rama documenta y protege la auditoría; no refactoriza runtime ni modifica invariantes de juego.

## TRACEABILITY

La genealogía v1.0→v1.8.2 es lineal por ancestría Git y suma 218 commits sobre `main`. Se clasificaron 14/14 refs relevantes y 9/9 PR observados: `traceability_coverage = 100%`. PR #1 está cerrado sin merge aunque su head es ancestro; #4–#9 permanecen draft/open pese a estar superados; v1.2.1, v1.8.1 y v1.8.2 carecen de PR propio. Ver `reports/project-traceability.json`.

## OBSERVED ARCHITECTURE

`index.html` carga 24 JS y 5 CSS. Los 29/29 archivos activos están clasificados por orden real de carga, no por su nombre. Conviven base, Archivo Nocturno, Atlas y capas de producto v1.3–v1.8.

## OWNERSHIP

Sólo 6 de 18 contratos tienen propietario único sin otro escritor cargado conocido: contenido, scheduler, calendario, storage, navegación y analytics. `ownership_ratio = 33.3%`. La deuda dominante es ownership múltiple, no cantidad bruta de archivos.

## GLOBAL COLLISIONS

Se confirman colisiones de alto impacto en `refreshHeader`, `renderCover`, `answerDeltaCopy`, `temporalScale`, `renderGame`, `renderSummary`, `summarySignature`, `commitAnswer`, `setYear`, `showView`, `setView` y funciones del timer. El scanner v1.8.3 genera el inventario completo de declaraciones/asignaciones y distingue owner efectivo por orden de carga.

## CSS CASCADE

Cinco hojas activas participan en la salida final. `runtime-layer-audit-v183.mjs` cuantifica selectores repetidos e `!important`; esos indicadores señalan deuda, no reglas eliminables.

## CONTRACTS

`docs/contracts/CONTRACT_REGISTRY.md` contiene 18/18 contratos con owner observado, competidores/dependencias, estado de ownership, protección de test, evidencia y siguiente paso seguro.

## TECH DEBT

P0: Learning Feedback contradice el contrato narrativo vigente. P1: render, timer/scoring, media, CSS, QA visual, reviewer y trazabilidad PR. P2: audio e identidad de navegación. Ver `TECH_DEBT_MAP.md`.

## QA

La auditoría prohíbe regenerar snapshots. El workflow v1.8.3 ejecuta unit/contract, content audit, reports, auditoría runtime/traceability/completion, accessibility, regression contra baselines congeladas y visual QA. `fetch-depth: 0` permite verificar ancestría. No se usa `--update-snapshots`.

## CLAUDE FINDINGS

Los hallazgos externos están clasificados en `CLAUDE_FINDINGS_VERIFICATION.md` como CONFIRMADO, PARCIAL, REFUTADO o REQUIRES_BROWSER. No se adopta un hallazgo por autoridad nominal; se conserva sólo si existe evidencia del repo.

## METRICS

- `traceability_coverage = 23/23 = 100%`
- `runtime_file_classification_coverage = 29/29 = 100%`
- `contract_coverage = 18/18 = 100%`
- `ownership_ratio = 6/18 = 33.3%`
- `test_protection_ratio = 14/18 = 77.8%`
- `audit_completeness_score = 100/100`

## AUDIT COMPLETENESS

La completitud mide cobertura del trabajo de auditoría, no salud arquitectónica. Pesos: Traceability 20%, File classification 20%, Runtime ownership 20%, Contracts 15%, Tech debt 10%, CSS/global analysis 10%, Test mapping 5%. `tools/audit-completion-v183.mjs` reproduce el cálculo en `reports/audit-baseline-v183.json`. Un `UNKNOWN` o `REQUIRES_BROWSER` explícito puede coexistir con 100% de completitud porque el límite de evidencia está documentado.

## UNRESOLVED / REQUIRES_BROWSER

- `MEDIA_ASYNC_PRECEDENCE`: v1.4 consulta Commons de forma asíncrona y v1.8 instala media curada. El orden de `<script>` no prueba por sí solo cuál queda finalmente en DOM bajo latencia real.
- Cualquier colisión dependiente de interacción/estado que no pueda resolverse por estática debe permanecer aquí en vez de convertirse en una conclusión inventada.

## OBSOLETE CANDIDATES

Los símbolos shadowed detectados son candidatos de retirada, no archivos eliminables. Se requiere owner sustituto + paridad + QA sin actualización de baseline.

## NEXT MIGRATION CANDIDATES

1. Alinear Learning Feedback con la narración natural vigente.
2. Unificar timer/scoring bajo un owner contractual.
3. Resolver precedencia de media con test browser.
4. Consolidar renderer mediante migraciones pequeñas con paridad.
5. Reducir cascade CSS después de congelar baselines.
6. Unificar reviewer stores/decisiones.

## Límites de evidencia

Git demuestra ancestría; GitHub aporta estado de PR al corte; estática demuestra carga, declaraciones y patches, pero no toda precedencia asíncrona. La auditoría no usa nombres de ramas como sustituto de evidencia runtime y no modifica `main`.
