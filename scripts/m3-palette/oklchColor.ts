import { clampChroma, Color, converter, formatHex, parse } from 'culori';

export const OKLCH_MODE = 'oklch';
const RGB_MODE = 'rgb';
const SRGB_CHANNEL_MIN = 0;
const SRGB_CHANNEL_MAX = 1;
// Absorbs float noise from OKLCH ↔ RGB round trips (~1e-15), so colors on the sRGB boundary such as
// #ffffff count as in gamut; far below one 8-bit step (1/255), so it never lets a visibly clipped color through
const SRGB_GAMUT_TOLERANCE = 1e-9;

const toOklch = converter(OKLCH_MODE);
const toRgb = converter(RGB_MODE);

function isChannelInRange(value: number | undefined): boolean {
	return value !== undefined
		&& value >= SRGB_CHANNEL_MIN - SRGB_GAMUT_TOLERANCE
		&& value <= SRGB_CHANNEL_MAX + SRGB_GAMUT_TOLERANCE;
}

/**
 * Checks whether a color fits the sRGB cube, allowing for float rounding noise at its edges.
 */
export function isInSrgb(color: Color): boolean {
	const { r, g, b } = toRgb(color);
	return isChannelInRange(r) && isChannelInRange(g) && isChannelInRange(b);
}

/**
 * Parses a hex color into OKLCH; throws if it cannot be parsed.
 */
export function hexToOklch(hex: string): Color {
	const color = parse(hex);
	if (!color) throw new Error(`hexToOklch: cannot parse color "${hex}"`);
	return toOklch(color);
}

/**
 * Reduces chroma until the color fits sRGB, keeping lightness and hue; returns the color unchanged if it already fits.
 */
export function clampToSrgb(color: Color): Color {
	return isInSrgb(color) ? color : clampChroma(color, OKLCH_MODE);
}

/**
 * Formats an in-gamut color as a lowercase 6-digit hex; throws if culori cannot format it.
 */
export function oklchToHex(color: Color): string {
	const hex = formatHex(color);
	if (!hex) throw new Error(`oklchToHex: cannot format color ${JSON.stringify(color)}`);
	return hex;
}
