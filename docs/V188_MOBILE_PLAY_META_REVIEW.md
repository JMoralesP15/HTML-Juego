# Revisión metaanalítica — prompt v1.8.8

## Evaluación
Puntaje: **9,4/10**.

| Criterio | Nota | Observación |
|---|---:|---|
| Anclaje en evidencia | 10/10 | Parte de capturas reales a 390 × 844 y del código activo. |
| Alcance | 9/10 | Se concentra en móvil y evita mezclar la corrección de imágenes. |
| Protección de contratos | 10/10 | Excluye banco, calendario, scoring, almacenamiento y selección diaria. |
| Compatibilidad arquitectónica | 9/10 | Usa el contrato de render; añade otra hoja temporal al cascade. |
| Verificabilidad | 9/10 | Define tamaños y recorridos, aunque la auditoría visual no prueba por sí sola lectores de pantalla. |
| Reversibilidad | 10/10 | Dos archivos nuevos y dos referencias en `index.html`. |
| Riesgo de regresión | 9/10 | Bajo en escritorio; medio en móviles bajos y orientación horizontal. |

## Decisiones confirmadas
- Priorizar ritmo, posición de acciones y uso del viewport sobre una renovación estética.
- Conservar la identidad nocturna, tipografía, paleta y lenguaje editorial.
- Integrarse mediante `__QYA_RUNTIME__.onRender`.
- Aplicar CSS únicamente hasta 760 px.
- Mantener contenido largo desplazable; no usar pies fijos que oculten aprendizaje.

## Riesgos y mitigaciones
1. **Más deuda de cascade.** La nueva hoja se limita a móvil y queda marcada como capa de transición.
2. **Barra inferior y safe area.** Se reserva espacio en `main` y se oculta durante las rondas.
3. **Teclado virtual.** La acción permanece en el flujo; no se posiciona con `fixed` dentro del juego.
4. **Altura baja horizontal.** Un breakpoint específico compacta cabecera y controles.
5. **Estado de vista desactualizado.** El módulo escucha el contrato oficial de render y también ejecuta una sincronización inicial.

## Fuera de alcance
- Reemplazo o búsqueda de fotografías.
- Consolidación total de las hojas históricas.
- Cambios al algoritmo de selección, puntaje o dificultad.
- Declaración de conformidad WCAG completa.
