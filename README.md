# Lenta CS Admin Design Tokens

Design tokens for the Lenta Omni Support Admin design system, shared between Figma and the frontend.

## Structure

- `src/` — token source files, merged in numeric-prefix order:
  - `1-schemes-m3.generated.json` — M3 roles of `Theme.schemes` (generated)
  - `2-schemes-custom.json` — hand-written roles that the generator doesn't produce (`background`, `on-background`)
  - `3-semantic.json` — the rest of `Theme`
  - `4-basic.json` — `Basic`: spacing, breakpoints, typography
  - `5-colors-m3.generated.json` — M3 tonal palettes `Basic.colors-m3` (generated)
  - `6-colors-m2.json` — Material 2 palettes `Basic.colors-m2`
- `m3-palette.config.yaml` — settings of the Material 3 palette generator (see below)
- `dist/` — generated, committed output: `tokens.json` (source of truth) and `vuetify-theme.js` (Vuetify 3 theme)
- `scripts/` — the build scripts: `m3-palette/` (generator), `merge-tokens.js`, `vuetify-theme/`

The numeric prefixes also set the order of groups in `dist/tokens.json` and in Figma: a group appears where the earliest file first defines it.

## Usage

```bash
pnpm install
npm run build
```

`build` runs three steps, also available on their own:

```bash
npm run _build-m3       # m3-palette.config.yaml → src/1-schemes-m3.generated.json, src/5-colors-m3.generated.json
npm run _merge-tokens   # src/*.json → dist/tokens.json
npm run _build-theme    # dist/tokens.json → dist/vuetify-theme.js
```

Don't edit files in `dist/` directly — edit the matching file in `src/` and run `npm run build`.
Don't edit the generated `src/1-schemes-m3.generated.json` and `src/5-colors-m3.generated.json` either — change `m3-palette.config.yaml`.

## M3 palette generator

Generates the Material 3 tonal palettes (`Basic.colors-m3`, 18 tones each) and the Light/Dark M3 roles in `Theme.schemes` (primary, surface-container-*, and the extended `default`, `info`, `success`, `warning`). Only roles the generator can't express, `background` and `on-background`, are hand-written in `src/2-schemes-custom.json` and reference the palettes by alias.

The pipeline, all configured in `m3-palette.config.yaml`:

1. Scheme from a seed color, variant and spec (via `@materialx/material-color-utilities`), with optional core color overrides and extended colors (warning, success).
2. `preserveHue` — locks each palette to its source color's OKLCH hue (no hue drift between tones); optionally gives the neutrals primary's hue.
3. OKLCH rules — per-name adjustments of hue, chroma and lightness, optionally limited to Light or Dark.
4. Every color is brought back into sRGB and written as hex.

Every config parameter is described in the comments of `m3-palette.config.yaml`.

## Token format

Tokens mix Material Design 3 and Vuetify conventions, with a small expression language (aliases, math, color functions) resolved by the [Computed Variables](https://github.com/vasiliy-dudin/figma-computed-variables) Figma plugin.
