import { argbFromHex, Hct } from '@materialx/material-color-utilities';
import { clampChroma, Color } from 'culori';
import { PALETTE } from './materialConstants';
import { hexToOklch, isInSrgb, OKLCH_MODE, oklchToHex } from './oklchColor';
import { GeneratedScheme } from './schemeFactory';

// Mid tones are the most visible, so they get a stricter hue tolerance (values from better-material-theme-builder)
const MID_TONE_MIN = 40;
const MID_TONE_MAX = 60;
const MID_TONE_MAX_HUE_DEVIATION = 5;
const OTHER_TONE_MAX_HUE_DEVIATION = 8;
const HUE_SEARCH_DIRECTIONS = [-1, 1] as const;
const NEUTRAL_PALETTES: readonly string[] = [PALETTE.neutral, PALETTE.neutralVariant];

export interface PreserveHueOptions {
	neutralHueFromPrimary: boolean;
}

function maxHueDeviation(tone: number): number {
	return tone >= MID_TONE_MIN && tone <= MID_TONE_MAX ? MID_TONE_MAX_HUE_DEVIATION : OTHER_TONE_MAX_HUE_DEVIATION;
}

function oklchAtHue(color: Color, hue: number): Color {
	return { mode: OKLCH_MODE, l: color.l, c: color.c, h: hue };
}

// Exact hue if it fits sRGB; otherwise the nearby hue (within maxDeviation) that keeps the most chroma
function findBestGamutColor(color: Color, referenceHue: number, maxDeviation: number): Color {
	const exact = oklchAtHue(color, referenceHue);
	if (isInSrgb(exact)) return exact;

	let best = clampChroma(exact, OKLCH_MODE);
	for (let deviation = 1; deviation <= maxDeviation; deviation++) {
		for (const direction of HUE_SEARCH_DIRECTIONS) {
			const candidate = oklchAtHue(color, referenceHue + deviation * direction);
			if (isInSrgb(candidate)) return candidate;
			const clamped = clampChroma(candidate, OKLCH_MODE);
			if ((clamped.c ?? 0) > (best.c ?? 0)) best = clamped;
		}
	}
	return best;
}

// tone is the HCT tone (0-100) that sets how far the hue may drift to stay in gamut
function lockHue(hex: string, referenceHue: number, tone: number): string {
	return oklchToHex(findBestGamutColor(hexToOklch(hex), referenceHue, maxHueDeviation(tone)));
}

function collectReferenceHues(scheme: GeneratedScheme, options: PreserveHueOptions): Map<string, number> {
	const hues = new Map<string, number>();
	const primarySource = scheme.sourceColors.get(PALETTE.primary);
	for (const [palette, sourceHex] of scheme.sourceColors) {
		const useColor = options.neutralHueFromPrimary && NEUTRAL_PALETTES.includes(palette) ? primarySource ?? sourceHex : sourceHex;
		const hue = hexToOklch(useColor).h;
		if (hue === undefined || Number.isNaN(hue)) {
			console.warn(`preserveHue: source ${useColor} of palette "${palette}" is achromatic; its hue is left as generated`);
			continue;
		}
		hues.set(palette, hue);
	}
	return hues;
}

function lockPaletteHues(palettes: GeneratedScheme['palettes'], hues: Map<string, number>): GeneratedScheme['palettes'] {
	return new Map([...palettes].map(([name, tones]) => {
		const hue = hues.get(name);
		if (hue === undefined) return [name, tones];
		return [name, new Map([...tones].map(([tone, hex]) => [tone, lockHue(hex, hue, tone)]))];
	}));
}

function lockRoleHues(roles: Map<string, string>, rolePalettes: Map<string, string>, hues: Map<string, number>): Map<string, string> {
	return new Map([...roles].map(([role, hex]) => {
		const palette = rolePalettes.get(role);
		const hue = palette === undefined ? undefined : hues.get(palette);
		if (hue === undefined) return [role, hex];
		return [role, lockHue(hex, hue, Hct.fromInt(argbFromHex(hex)).tone)];
	}));
}

/**
 * Locks every palette tone and palette-based role to its palette's source OKLCH hue; returns a new scheme.
 */
export function preserveHue(scheme: GeneratedScheme, options: PreserveHueOptions): GeneratedScheme {
	const hues = collectReferenceHues(scheme, options);
	return {
		...scheme,
		palettes: lockPaletteHues(scheme.palettes, hues),
		roles: {
			Light: lockRoleHues(scheme.roles.Light, scheme.rolePalettes, hues),
			Dark: lockRoleHues(scheme.roles.Dark, scheme.rolePalettes, hues),
		},
	};
}
