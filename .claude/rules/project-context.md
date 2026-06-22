---
description: Core project context — what this project is, the token pipeline, and what not to touch
---

# Project Context — Lenta OSA Design Tokens

## What This Project Is

A repository of design tokens stored as JSON. `tokens.json` (repo root) is the single source of truth for the entire **Lenta Omni Support Admin** design system, covering both Figma and the frontend.

This repo holds no application code of its own — it holds token data plus a couple of small Node.js scripts that build/derive files from that data.

## Token Pipeline

```
files-to-merge/<N>-<name>.json   (hand-edited sources, merged in numeric-prefix order)
        │
        ▼  merge-tokens.js (deep merge, plain Node, no deps)
        ▼
tokens.json                       (generated — the single source of truth)
        │
        ▼  Computed Variables Figma plugin (external project, see below)
        ▼
Figma Variables  ──────────────────────────────►  Frontend (Vuetify)
        │
        ▼  scripts/vuetify-theme/ (in progress — see PLANNING.md)
        ▼
Vuetify 3 theme JSON (alternate path: resolves tokens.json directly, without Figma)
```

- `tokens.json` is a **build artifact**. Never hand-edit it without also updating the matching file in `files-to-merge/`, or the next merge run will silently overwrite your change.
- Run `node merge-tokens.js` after editing any `files-to-merge/*.json` file to regenerate `tokens.json`.
- "Collections" = top-level keys in the JSON (e.g. `"Semantic"`, `"Components/Colors"`). They map 1:1 to Figma Variable Collections.

## Token Format

- Multi-tier architecture: `Base` → `Semantic` → `Components`. Because Figma Variable Collections can't nest, `Components` is split into two top-level collections: `Components/Colors` and `Components/Size`.
- Values may use a non-standard expression syntax that the Computed Variables plugin evaluates:
  - Aliases: `{group.key}` — written **without** the collection name (e.g. `{input.filled.bg-default}`, not `{Components/Colors.input.filled.bg-default}`). Aliases resolve by bare path across the whole merged token tree, so a bare key must stay unique across collections or the reference becomes ambiguous.
  - Math: `{spacing.base} * 2`
  - Color modifier functions: `alpha()`, `darken()`, `lighten()`, `saturate()`, `desaturate()`, `hueShift()`
  - Color formats: hex, rgb/rgba, oklch
  - Multi-mode values: `$value` may be a scalar (applies to all modes) or a record keyed by mode name, e.g. `{ "Light": "...", "Dark": "..." }`
  - A token name prefixed with `_` is excluded from Figma Variable creation but stays resolvable as a dependency for other tokens.
- Content is currently a mix of Material Design 3 tokens (August 2025 version) and Vuetify-specific tokens; these will be unified in a future iteration.

## What NOT to Touch Without Asking

- `tokens.json` — it's generated; edit the corresponding `files-to-merge/*.json` instead and re-run `merge-tokens.js`.
- Top-level collection names (e.g. renaming `"Semantic"`) — bare-path aliases resolve across the entire merged tree, so a rename can silently break references in other collections/files.
- `merge-tokens.js` — small and load-bearing; changing its merge semantics changes how every `files-to-merge/*.json` file combines.
- Anything under `scripts/vuetify-theme/core/` — this is a copied snapshot of the resolver logic from the external plugin (see below), kept in sync manually. Don't "fix" it locally without checking the upstream plugin first, or the two will drift apart silently.

## Related External Project

The [Computed Variables](https://github.com/vasiliy-dudin/figma-computed-variables) Figma plugin is the actual consumer of `tokens.json` for the Figma side of the pipeline, and is the origin of the expression language described above (aliases, math, color modifiers, oklch, multi-mode values). Its resolver core (`src/core/`) is Figma-API-independent and was copied (not linked) into `scripts/vuetify-theme/core/` to resolve tokens for the Vuetify-theme generator without going through Figma. Treat the plugin's repo as authoritative for resolution semantics — when in doubt about how an expression should evaluate, check there.
