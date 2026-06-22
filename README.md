# Lenta OSA Design Tokens

Design tokens for the Lenta Omni Support Admin design system, shared between Figma and the frontend.

## Structure

- `src/` — hand-edited token source files, merged in numeric-prefix order
- `dist/` — generated, committed output: `tokens.json` (source of truth) and `vuetify-theme.js` (Vuetify 3 theme)
- `scripts/` — the build scripts that produce `dist/`

## Usage

```bash
pnpm install
npm run tokens:merge   # src/*.json → dist/tokens.json
npm run theme:build    # dist/tokens.json → dist/vuetify-theme.js
```

Don't edit files in `dist/` directly — edit the matching file in `src/` and re-run `tokens:merge`.

## Token format

Tokens mix Material Design 3 and Vuetify conventions, with a small expression language (aliases, math, color functions) resolved by the [Computed Variables](https://github.com/vasiliy-dudin/figma-computed-variables) Figma plugin.