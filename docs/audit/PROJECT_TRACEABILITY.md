# QUÉ AÑO — Project Traceability Audit v1.8.3

Fecha de corte: 2026-09-13. Base auditada: `feature/audit-contracts-editorial-batch02-v1.8.2` (`aaf5bd146c572fee1c600c4c0764a0f82bf0548e`).

## Alcance

Esta iteración reconstruye la genealogía real del repositorio y deja una línea base auditable. No modifica runtime, gameplay, scoring, timer, scheduler, banco de 300 IDs/años, calendario, persistencia, Repaso, Sets, Learning Gain ni contenido editorial.

## Genealogía observada

La secuencia de producto es lineal por ancestría Git. Cada head listado contiene al anterior; no se detectó bifurcación entre las versiones auditadas.

| Etapa | Ref principal | Head auditado | Relación |
|---|---|---|---|
| v1.0 baseline | `main` | `9bff1d909bf9b6a87175c2999e566d5e45231677` | raíz |
| v1.1 | `feature/ui-game-loop-v1.1` | `a917a19c5d9d1920b3a56221fea0df00022739ab` | descendiente de v1.0 |
| Archivo Nocturno RC.2 | `feature/archive-night-rc2` | `7c8b00f3b99d13806d8830d7dbd96c9fb209e87f` | descendiente de v1.1 |
| v1.2 | `feature/visual-identity-timer-context-v1.2` | `89736c97a02b7329cec783500ee7315657629c22` | descendiente de RC.2 |
| v1.2.1 | `feature/instrumentation-consolidation-v1.2.1` | `2fbb6117e35577448242953d069ec23406c83a06` | descendiente de v1.2 |
| v1.3 | `feature/product-loop-v1.3` | `c1ae4e1a85a6276c4883d0082433551909d36de5` | descendiente de v1.2.1 |
| v1.4 | `feature/curation-atmosphere-v1.4` | `c170eaf8762828842d74548f5694c2a26d4e80c8` | descendiente de v1.3 |
| v1.5 | `feature/simplification-game-clarity-v1.5` | `7721f44dbb6f8593fe8fb4aebfdab9c48a694784` | descendiente de v1.4 |
| v1.6 | `feature/learning-result-ux-v1.6` | `53676ba16cea7ff66576a74ded00b5a88cf850ca` | descendiente de v1.5 |
| v1.7 | `feature/architecture-editorial-consolidation-v1.7` | `1033aeb7d318b9f8dcc15acf430df3297c22fbfd` | descendiente de v1.6 |
| v1.8 | `feature/factual-editorial-verification-v1.8` | `782ed5f67e599810cac9cc33dafe8400072f048d` | descendiente de v1.7 |
| v1.8.1 | `feature/editorial-assist-v1.8.1` | `232d1c457a1ca9fb26913768e6a50865a478f060` | descendiente de v1.8 |
| v1.8.2 | `feature/audit-contracts-editorial-batch02-v1.8.2` | `aaf5bd146c572fee1c600c4c0764a0f82bf0548e` | descendiente de v1.8.1 |

`main..v1.8.2` contiene 218 commits. `infra/pages-setup` existe como carril de integración/publicación y, al corte, apunta a `232d1c457a1ca9fb26913768e6a50865a478f060`.

## Pull requests observados

| PR | Head | Estado al corte | Merge | Lectura de trazabilidad |
|---:|---|---|---|---|
| #1 | v1.1 | closed / draft | no | el commit sobrevivió y es ancestro de todo lo posterior; el estado del PR no representa la integración real |
| #2 | Archivo Nocturno RC.2 | closed | sí | coherente con historia |
| #3 | v1.2 | closed | sí | coherente con historia |
| #4 | v1.3 | open / draft | no | superado por ramas posteriores |
| #5 | v1.4 | open / draft | no | superado por ramas posteriores |
| #6 | v1.5 | open / draft | no | superado por ramas posteriores |
| #7 | v1.6 | open / draft | no | superado por ramas posteriores |
| #8 | v1.7 | open / draft | no | superado por ramas posteriores |
| #9 | v1.8 | open / draft | no | superado por ramas posteriores |

No se observó PR propio para v1.2.1, v1.8.1 ni v1.8.2. Esto no rompe la genealogía, pero sí reduce la capacidad de reconstruir decisiones usando sólo la pestaña de Pull Requests.

## Métrica de trazabilidad

Se clasificaron 14/14 refs relevantes y 9/9 PR existentes en la línea auditada: `traceability_coverage = 23 / 23 = 1.00`.

La métrica expresa cobertura del inventario, no calidad del proceso de integración.

## Evidencia y límites

- La ancestría y el conteo de commits son verificables con Git.
- Los estados de PR son una fotografía de GitHub al 2026-09-13 y no pueden reconstruirse sólo desde un checkout sin API.
- Los nombres de ramas no se usaron para inferir arquitectura runtime.
- La arquitectura observada se audita por separado desde el orden real de carga de `index.html`.
- `main` no se modifica ni se propone merge en esta iteración.
