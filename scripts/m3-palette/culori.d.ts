// Adds the culori functions used by m3-palette. The base declarations live in
// vuetify-theme/core/culori.d.ts, a copy from the Computed Variables plugin that is not edited locally.
declare module 'culori' {
	export function inGamut(mode?: string): (color: Color) => boolean;
	export function clampChroma(color: Color, mode?: string): Color;
}
