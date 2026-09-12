# QUÉ AÑO — Roadmap v1.0 → v2.2

Este roadmap separa **historia observada del repositorio** de **objetivos futuros**. Las versiones v1.0–v1.7 describen la trayectoria del producto; v1.8–v2.2 son propuestas y no deben interpretarse como funcionalidades comprometidas ni resultados de usuarios.

## Trayectoria v1.0 → v1.7

| Versión | Problema que resolvió | Aporte principal | Deuda que dejó o reveló | Estado |
|---|---|---|---|---|
| **v1.0 — núcleo jugable** | Convertir la idea “adivina el año” en un producto local completo. | Banco de 300 hitos, desafío diario de 5, estimación temporal, persistencia local, Repaso/práctica, Línea temporal, Colección, Estadísticas, editor/auditoría, backup y funcionamiento estático/offline. | Arquitectura global clásica y responsabilidades mezcladas; fuentes e imágenes con esquema editorial todavía rudimentario. | Histórico funcional. |
| **v1.1 — Archivo Nocturno** | Dar identidad y game feel a una interfaz todavía utilitaria. | Lenguaje visual de archivo, progreso de ronda, feedback temporal, resumen más editorial y mejoras de navegación/teclado. | La evolución se implementó como capa sobre el renderer anterior, iniciando la lógica aditiva por versiones. | Histórico/transicional. |
| **v1.2 — Atlas Temporal** | Hacer del tiempo una mecánica perceptible y aumentar feedback/aprendizaje. | Timer de 15 s, scoring temporal, instrumento/atlas, contexto ampliado y nueva identidad de feedback. | Para elevar “cobertura” introdujo generación de láminas/contexto, confundiendo cantidad con procedencia editorial. | Histórico, contratos aún usados. |
| **v1.2.1 — Instrumentación y consolidación** | Poder evaluar el producto sin depender de impresiones. | Dependencias fijadas, CI, axe-core, regresión visual, PostHog no bloqueante, reportes editoriales/geográficos y criterios explícitos de baseline. | La infraestructura quedó más madura que la evidencia conductual, porque todavía faltaba tráfico real suficiente. | Base de QA/observabilidad. |
| **v1.3 — Product loop** | Evitar que una partida terminara sin continuidad de aprendizaje. | Sets de colección, Repaso inteligente, Learning Gain entre días, feedback progresivo y mejor jerarquía mobile. | Otra capa JS/CSS sobre v1.2; más valor de producto, pero también más cascade y hooks de presentación. | Contratos vigentes. |
| **v1.4 — Curaduría y atmósfera** | Mejorar relevancia cultural y riqueza contextual. | Heurística de cultura general, contexto de conexión/memoria, Wikimedia Commons como progressive enhancement y ambiente opcional. | El score cultural podía confundirse con validación factual; fallback automático aumentó deuda editorial si se usaba como cobertura. | Contratos parciales vigentes. |
| **v1.5 — Simplificación y claridad** | Reducir densidad cognitiva acumulada. | Una pregunta/una acción dominante, selector más claro, timer absoluto, CTA sincronizado, feedback progresivo, mobile 375–412 px y reducción fuerte de metadatos visibles. | Conservó capas anteriores ocultándolas/reescribiéndolas en vez de retirarlas. | **Versión pública actual** en GitHub Pages. |
| **v1.6 — Aprendizaje y cierre** | Hacer que acertar el año no fuera el único valor de la partida. | Micro-lección “qué fue / por qué importa / dato para recordar”, contexto profundo, ficha, resumen “qué aprendiste” y siguiente repaso. | El lifecycle por decoradores mostró fragilidad: un contrato visual obsoleto y un bug de ciclo de render expusieron deuda acumulativa. | Draft/base de v1.7. |
| **v1.7 — Consolidación arquitectónica/editorial** | Impedir que cada mejora futura agregue otra capa y que la cobertura editorial oculte incertidumbre. | CSS v1.3–v1.6 consolidado, contrato explícito de render, analítica fuera de MutationObserver, retiro de compat/fix/polish activos, lockfile reproducible, cero filler editorial automático, procedencia factual/media separada, backlog editorial 300/300 y gates de deuda. | Mantiene algunos overrides de comportamiento por compatibilidad deliberada y deja visible la revisión factual pendiente. | Draft PR #8; objetivo: `READY_FOR_HUMAN_REVIEW`. |

## Lectura de madurez

La evolución se puede resumir como cuatro etapas:

1. **v1.0–v1.2: capacidad de producto**. Se construye juego, identidad y mecánica.
2. **v1.2.1–v1.4: observabilidad y profundidad**. Se añade QA, medición, aprendizaje y curaduría.
3. **v1.5–v1.6: reducción de fricción y mejor cierre cognitivo**. Se mejora la experiencia real de una sesión.
4. **v1.7: gobernanza**. Se convierte deuda implícita en contratos, presupuestos y estados editoriales explícitos.

El cambio importante de v1.7 no es una nueva pantalla. Es cambiar la función objetivo:

`más capas + más cobertura` → `menos ambigüedad + más procedencia + cambios medibles`.

---

# Camino propuesto hacia una v2.2 sólida

## v1.8 — Programa de verificación editorial

**Objetivo:** convertir el backlog de procedencia en mejora factual real, por lotes revisables.

Trabajo propuesto:

- revisar primero P0/P1 y luego P2 del backlog;
- reemplazar referencias generales por fuentes específicas;
- registrar por hito qué evidencia respalda año, `fact`, `context` y `significance`;
- añadir un esquema explícito de revisión (`verifiedAt`, alcance, fuente primaria/secundaria, observación editorial) sin exponer datos personales;
- revisar los 3 documentales locales y estructurar rights/licencia;
- revisar las 42 ilustraciones propias y decidir conservar/reemplazar/retirar según utilidad;
- mantener `editorialVerified` como acción humana explícita.

**Criterio de salida recomendado:** 100% de las 300 preguntas con fuente específica para el **año preguntado** o con una excepción editorial documentada. Esto es una meta futura, no el estado actual. Las afirmaciones contextuales pueden llevar su propio estado de revisión.

## v1.9 — Banco cultural y documental balanceado

**Objetivo:** mejorar la calidad del banco, no sólo verificar lo heredado.

Trabajo propuesto:

- revisar concentración por región, década, categoría y tipo de actor;
- definir una política editorial de diversidad antes de imponer cuotas;
- incorporar/reemplazar hitos cuando exista una justificación de cultura general/aprendizaje;
- construir un manifest de imágenes con `asset → fuente → autor → licencia → derechos → hito`;
- usar Wikimedia Commons, Smithsonian Open Access, Library of Congress, Europeana y archivos institucionales como fuentes de candidatos;
- permitir “sin imagen” como decisión editorial de primera clase;
- estudiar dificultad con resultados de jugadores, separando dificultad editorial estimada de dificultad observada.

**Criterio de salida recomendado:** cada cambio del banco tiene rationale, procedencia y test de integridad; toda imagen distribuida con el juego tiene derechos conocidos y trazables.

## v2.0 — Arquitectura canónica

**Objetivo:** que el runtime deje de pensar en versiones históricas.

La versión 2.0 no debería ser una reescritura cosmética ni un framework por aburrimiento. Debe migrar gradualmente, respaldada por tests de paridad, hacia propietarios estables como:

- `content` / schema editorial;
- `schedule`;
- `session/game-engine`;
- `timer/scoring`;
- `renderer/views`;
- `learning/review`;
- `media`;
- `storage/migrations`;
- `analytics`;
- `ui/accessibility`.

Trabajo propuesto:

- retirar nombres runtime `v12/v13/v14/v15/v16` cuando su responsabilidad ya tenga módulo canónico;
- eliminar monkey patches de comportamiento de forma incremental con tests A/B de paridad interna;
- hacer que `setView`/renderer emita lifecycle desde el propietario canónico;
- tipar/validar el esquema de preguntas y estado, aunque el producto siga siendo JS estático;
- establecer migraciones de persistencia explícitas y reversibles;
- conservar modo estático/offline como restricción de arquitectura.

**Criterio de salida:** cero coordinación mediante observers de DOM, cero patch layers históricos activos y APIs internas estables. Los overrides conductuales desaparecen porque sus reglas tienen propietario, no porque un contador obligue a borrarlos.

## v2.1 — Evidencia de comportamiento y experimentación

**Objetivo:** dejar de optimizar sólo por heurística y QA.

Medir en tráfico real:

- `session_started → completed`;
- abandono por pregunta;
- timeout y “No lo sé”;
- MAE/mediana del error;
- tiempo de respuesta;
- dwell de feedback;
- expansión de contexto/fuente;
- entrada a Repaso/Sets;
- repetición entre días;
- Learning Gain;
- D1/D7 cuando el volumen permita una lectura responsable.

No inferir causalidad de una simple comparación antes/después. Para experimentos con conversión base cercana a 70%, como referencia de planificación con α=.05 y potencia=.80, detectar aproximadamente +5 pp requiere ~1.250 sesiones por variante, +8 pp ~470, +10 pp ~300 y +15 pp ~120. Recalcular siempre con el baseline realmente observado antes de lanzar una prueba.

**Criterio de salida:** baseline estable con intervalos de confianza y al menos una decisión de producto basada en evidencia suficientemente potente, no sólo en preferencia visual.

## v2.2 — Release sólido / producto gobernado

**Objetivo:** combinar madurez técnica, editorial y de producto en una versión que pueda evolucionar sin volver al patrón acumulativo.

### Gates propuestos

**Técnicos**

- CI 100% verde en el SHA de release;
- `npm ci` reproducible y `npm audit` sin vulnerabilidades conocidas de severidad relevante;
- 0 `MutationObserver` como mecanismo de coordinación;
- 0 capas `compat/fix/polish` activas;
- 0 desalineación de schema/lock/version;
- rollback/publicación documentados;
- calendario y scheduler deterministas.

**UX/accesibilidad**

- 0 issues axe serious/critical en flujos canónicos;
- teclado completo y focus visible;
- reduced motion respetado;
- 375×667, 390×844, 412×915 y desktop sin overflow/regresiones críticas;
- objetivos de performance de referencia: LCP <1,8 s, CLS <0,05, INP <100 ms en condiciones de medición definidas.

**Editoriales**

- 300/300 hitos con procedencia factual específica o excepción explícita;
- 0 falsos positivos de verificación;
- 100% de assets documentales distribuidos con procedencia y rights/licencia estructurados;
- 0 contenido generado presentado como documento histórico;
- informe de concentración/diversidad acompañado de política editorial, no de cuotas improvisadas.

**Producto/evidencia**

- baseline real de finalización, timeout, skip, MAE, respuesta y engagement de aprendizaje;
- métricas etiquetadas como descriptivas o experimentales;
- experimentos sólo cuando exista muestra suficiente;
- decisiones posteriores documentan hipótesis, tamaño de efecto y resultado.

## Secuencia recomendada

La prioridad no es correr de `1.7` a `2.2` cambiando el número cada dos tardes. El orden lógico es:

**v1.7 estabilidad → v1.8 verdad factual → v1.9 calidad/diversidad del banco → v2.0 arquitectura canónica → v2.1 evidencia de usuarios → v2.2 consolidación de release.**

Ese orden reduce un riesgo frecuente: construir una arquitectura impecable alrededor de contenido mediocre, o curar 300 preguntas dentro de un runtime que todavía necesita cirugía. La versión 2.2 debe ser la intersección de ambas madureces.