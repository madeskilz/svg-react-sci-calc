# svg-react-sci-calc

A Casio-style scientific calculator built with React and SVG. The UI follows an advanced Casio scientific layout (right-aligned display, grouped scientific keys, exponent and function entry) while keeping rendering in SVG for crisp vector visuals.

## Features

- Casio-like advanced scientific layout and behavior
- SVG-rendered display and buttons (scales cleanly and supports clipping)
- Standard and scientific functions: sin, cos, tan, sqrt, log, exponentiation, parentheses
- Right-aligned display that floats (not stretched) and clips overflow without spilling
- Simple, self-contained evaluator mapping common tokens to JavaScript Math functions

## Files of interest

- `src/App.js` — main React + SVG calculator component and safe evaluator
- `public/index.html` — app entry template (required for CRA)
- `package.json` — scripts and dependencies

## Quick start (Create React App)

1. Ensure Node.js and yarn/npm are installed.
2. From project root:
   - Install deps: `yarn install` (or `npm install`)
   - Start dev server: `yarn start` (or `npm start`)
   - Build for production: `yarn build` (or `npm run build`)

If you prefer Vite, adapt `src/App.js` and add a Vite config instead of CRA.

## UX notes

- The display text is right-aligned and will "float right" (use natural width) when content is short.
- When content grows, font size is reduced and the display is clipped so digits never spill outside the visual screen.
- Scientific functions insert a trailing `(` to help with nested expression entry (e.g. pressing `sin` produces `sin(`).

## Development tips

- Add more function mappings in `safeEval` inside `src/App.js`.
- Keep UI inside the SVG to preserve pixel-perfect Casio styling.
- Add unit tests for `safeEval` to ensure correct mapping and safety.

## Contributing

Open a PR with a focused change (UI, new functions, evaluator improvements). Keep changes small and testable.

## License

MIT