# ¿Qué año fue?

Juego web histórico diario construido en HTML, CSS y JavaScript sin framework.

## Jugar

La versión publicada se sirve mediante GitHub Pages. El archivo de entrada estable es `index.html`.

También funciona offline: clona o descarga el repositorio y abre `index.html` en el navegador.

## Desarrollo y QA

Requiere Node.js para las herramientas de prueba, no para jugar.

```bash
npm install
npm test
npm run audit
npx playwright install chromium
npm run qa:visual
```

## Estructura

- `index.html`: entrada estable del juego.
- `style.css`: interfaz.
- `js/`: lógica, contenido, calendario y almacenamiento.
- `assets/`: imágenes locales.
- `tools/`: auditoría y tests DOM.
- `tests/`: QA visual Playwright.

## Estado

Release candidate pre-v1.2: `v1.1.2-rc.1`.
