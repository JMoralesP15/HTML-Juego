# QUÉ AÑO v1.6 — Auditoría senior, ejecución y metacorrección

Fecha: 2026-09-12  
Rama: `feature/learning-result-ux-v1.6`  
PR: #7 (draft)

## 1. Prompt A — consultoría senior y ejecución

> Actúa como consultor senior de producto digital, UX/UI, game design, front-end y QA. Audita la rama v1.6 usando como evidencia prioritaria el código vigente, el flujo real del producto y CI. Distingue siempre entre OBSERVADO, INFERIDO y NO EVALUABLE. Clasifica cada fallo como BUG DE PRODUCTO, CONTRATO DE PRESENTACIÓN OBSOLETO, FIXTURE/PRUEBA DEFECTUOSA o REGRESIÓN REAL. Prioriza como invariantes la integridad histórica, jugabilidad, accesibilidad, funcionamiento offline, persistencia local y valor de aprendizaje. Corrige primero los bugs del producto. No debilites invariantes conductuales para obtener CI verde. Cuando una decisión v1.6 cambie deliberadamente la presentación, migra los tests desde selectores/copy heredados hacia contratos semánticos visibles para el usuario. Ejecuta QA completo, genera screenshots desktop/móvil y no hagas merge ni publiques sin validación humana.

## 2. Diagnóstico observado

### Invariantes comprobadas en CI intermedio

- 28/28 tests funcionales y de contrato.
- Banco: 300 preguntas, 300 IDs únicos, sin años inválidos ni faltantes de calendario.
- Calendario: 1096 días, 0 discrepancias.
- Programación: 365 días, `minGap=52`, 0 repeticiones bajo 30 días, especiales válidos.
- Regresión canónica: 2/2.
- Accesibilidad: 4/4.
- Dependencias: 0 vulnerabilidades reportadas por npm.
- Visual/browser QA tras la primera ronda de correcciones: 73/74. El único fallo restante fue un test acoplado a un selector de encabezado inexistente, pese a que el resumen visible y el resto de su contrato sí funcionaban.

### Problemas reales encontrados y corregidos

1. `rebuildDeepContext()` contenía `if(fig) img.remove()` en vez de `fig.remove()`. Era un bug real de runtime y podía provocar fallos en cascada al reconstruir contexto.
2. El aprendizaje tenía un fallback generado del tipo “X corresponde a YEAR”. Era información derivada pero editorialmente pobre y contradecía el principio de no rellenar contenido educativo sólo por completar una tarjeta.
3. La capa v1.6 podía volver a revelar `.v13-context-extra`, reintroduciendo contenido heredado y residuos editoriales que la propia v1.6 pretende retirar.

### Deuda real que no bloquea esta release

- La auditoría mantiene una advertencia amplia de `genericSources`. Es deuda editorial, no una regresión funcional v1.6.
- El banco sigue concentrado geográficamente: Estados Unidos 96/300; las cuatro regiones principales suman 191/300 = 63,7%. Esto describe la colección, no demuestra por sí solo una cuota geográfica incorrecta.
- GitHub Actions advierte que `checkout@v4`, `setup-node@v4` y `upload-artifact@v4` apuntan a Node 20 aunque el runner los fuerza sobre Node 24. Es deuda de infraestructura no bloqueante.

## 3. Ejecución del Prompt A

Se corrigieron los tres problemas reales anteriores y se migraron los tests heredados de v1.2–v1.5 sólo cuando estaban acoplados a una presentación que v1.6 reemplazó deliberadamente.

Se conservaron sin debilitar los contratos de timer absoluto y timeout, `No lo sé`, bonus y scoring, teclado y targets táctiles, ausencia de overflow, reduced motion, persistencia e historial legacy, Sets, Repaso, Learning Gain, Commons con licencia abierta, funcionamiento offline, integridad de 300 IDs/años/calendario, accesibilidad axe y una única acción primaria de cierre.

Los tests de contexto pasaron a validar la conducta v1.6: aprendizaje esencial visible, `Profundizar` opcional, documento inicialmente cerrado, ubicación temporal secundaria y ausencia de estados editoriales internos.

Los tests del resumen pasaron a usar un flujo real de cinco preguntas en vez de fixtures sintéticos que no reproducían correctamente el ciclo de vida de la aplicación.

## 4. Metaanálisis: contradicciones detectadas

### A. “Todos los tests previos verdes” vs cambio deliberado de interfaz

El prompt original de v1.6 exigía simultáneamente reemplazar controles/copy de v1.5 y mantener literalmente verdes tests que buscaban esos controles/copy. Eso es imposible si “compatibilidad” significa conservar selectores antiguos.

**Corrección:** compatibilidad significa contrato semántico y conductual. Un test puede migrar si la presentación fue reemplazada intencionalmente; no puede migrar si protege una regla real del juego, integridad, accesibilidad o persistencia.

### B. Aprendizaje real vs cobertura editorial artificial

El objetivo es aprender algo significativo, pero la ejecución inicial generaba una frase fallback para evitar una tarjeta vacía.

**Corrección:** es preferible omitir un bloque que inventar o rellenar contenido pobre. La cobertura debe crecer mediante curaduría verificable.

### C. Relevancia visual vs cobertura de imágenes

Un test heredado premiaba conservar placas generadas aun cuando v1.6 define: imagen documental relevante > Commons relevante > ilustración útil > sin imagen > placa genérica.

**Corrección:** offline significa que el aprendizaje y el flujo permanecen utilizables sin red, no que toda pregunta deba conservar una ilustración decorativa.

### D. QA sintético vs experiencia real

El primer test del resumen intentó simular estado final artificialmente. El producto real construye el resumen a través de `round`, persistencia y navegación.

**Corrección:** los flujos críticos deben probarse terminando una partida real. Los fixtures quedan para unidades puras, no para sustituir el lifecycle completo.

### E. Exactitud de copy/DOM vs intención de producto

Algunos tests exigían textos exactos como “15 segundos” o la presencia del CTA dentro de `.summary-footer`.

**Corrección:** validar estado de timeout neutral y existencia de una única acción primaria. El lugar exacto y el copy pueden evolucionar mientras no se rompa el contrato de usuario.

## 5. Prompt B — doctrina correctiva aplicada

> Reevalúa el Prompt A contra su ejecución y contra la necesidad real del producto. Conserva contratos semánticos, no selectores o copy obsoletos. Modela los flujos críticos con interacción real. No generes contenido educativo de relleno: si no existe evidencia editorial suficiente, omite el bloque. Prioriza imágenes documentales o Commons útiles y acepta ausencia de imagen antes que una placa genérica. Mantén como invariantes duras los 300 IDs/años, calendario, scheduler, timer, scoring, persistencia, offline, teclado, accesibilidad, Repaso, Sets y Learning Gain. Corrige bugs del producto antes de adaptar pruebas. Adapta tests heredados únicamente cuando la decisión de producto cambió deliberadamente la presentación; nunca debilites una prueba que protege comportamiento, integridad o accesibilidad. Exige CI completo verde y screenshots desktop/móvil revisables antes de declarar la release lista. Separa deuda editorial e infraestructura no bloqueante de defectos de release. No hagas merge ni publiques sin aprobación humana.

## 6. Decisión operativa resultante

La v1.6 no se juzga por cuántas capas históricas logra mantener visibles. Se juzga por si preserva el juego mientras simplifica la experiencia y aumenta el valor de aprendizaje.

Secuencia de decisión fijada para cualquier fallo futuro:

`reproducir → clasificar → proteger invariante → corregir producto si está roto → migrar test sólo si la presentación cambió intencionalmente → ejecutar flujo real → CI → screenshot → revisión humana`.

No se considera criterio válido “hacer pasar el test” si para ello se restaura una interfaz deliberadamente retirada, se introduce contenido educativo artificial o se debilita una regla real del juego.
