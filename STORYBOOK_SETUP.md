# Storybook v1.1 — Game Loop

Esta rama introduce el scaffold de Storybook para explorar y validar el rediseño del loop Pregunta → Feedback sin modificar todavía la lógica productiva de v1.0.

## Componentes iniciales

- RoundProgress
- YearAdjustButton
- YearSelector
- PrimaryAction
- AnswerResult
- TemporalScale

## Estados cubiertos

- progreso 3/5
- selector temporal desktop
- respuesta exacta
- respuesta cercana
- error grande
- escala temporal exacta
- escala a 1 año
- escala con error grande
- feedback compuesto

## Ejecutar

```bash
npm install
npm run storybook
```

La instalación de dependencias requiere acceso a npm. El entorno de generación no tuvo salida de red, por lo que no se incluye `node_modules` ni lockfile generado.

## Criterio de diseño

La v1.1 mantiene la lógica de v1.0. Antes de responder, el protagonista es la estimación del jugador. Después de responder, el protagonista es comprender visualmente dónde quedó en el tiempo.
