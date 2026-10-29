# Lenta CS Admin Design Tokens

Design tokens for the Lenta Omni Support Admin design system, shared between Figma and the frontend.

## Structure

- `src/` — token source files, merged in numeric-prefix order. All hand-edited except `src/5-m3-generated.json`
- `m3-palette.config.yaml` — settings of the Material 3 palette generator (see below)
- `dist/` — generated, committed output: `tokens.json` (source of truth) and `vuetify-theme.js` (Vuetify 3 theme)
- `scripts/` — the build scripts: `m3-palette/` (generator), `merge-tokens.js`, `vuetify-theme/`

## Usage

```bash
pnpm install
npm run build          # all three steps below, in order
npm run build-m3       # m3-palette.config.yaml → src/5-m3-generated.json
npm run merge-tokens   # src/*.json → dist/tokens.json
npm run build-theme    # dist/tokens.json → dist/vuetify-theme.js
```

Don't edit files in `dist/` directly — edit the matching file in `src/` and re-run `merge-tokens`.
Don't edit `src/5-m3-generated.json` either — change `m3-palette.config.yaml` and run `npm run build`.

## M3 palette generator

Generates the Material 3 tonal palettes (`Basic.colors-m3`, 18 tones each) and the Light/Dark M3 roles in `Theme.schemes` (primary, surface-container-*, warning, …). Custom roles such as `default`, `info` and `background` stay hand-written in `src/1-semantic.json` and reference the palettes by alias.

The pipeline, all configured in `m3-palette.config.yaml`:

1. Scheme from a seed color, variant and spec (via `@materialx/material-color-utilities`), with optional core color overrides and extended colors (warning, success).
2. `preserveHue` — locks each palette to its source color's OKLCH hue (no hue drift between tones); optionally gives the neutrals primary's hue.
3. OKLCH rules — per-name adjustments of hue, chroma and lightness, optionally limited to Light or Dark.
4. Every color is brought back into sRGB and written as hex.

Every config parameter is described in the comments of `m3-palette.config.yaml`.

## Token format

Tokens mix Material Design 3 and Vuetify conventions, with a small expression language (aliases, math, color functions) resolved by the [Computed Variables](https://github.com/vasiliy-dudin/figma-computed-variables) Figma plugin.
