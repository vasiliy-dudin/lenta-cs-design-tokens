import { Color } from 'culori';
import { ModeName, OklchRule } from './configSchema';
import { clampToSrgb, hexToOklch, oklchToHex } from './oklchColor';
import { compileRules, CompiledRule, findUnmatchedPatterns, PostProcessRules, rulesFor } from './ruleMatching';
import { GeneratedScheme } from './schemeFactory';
import { paletteTokenName } from './serializeTokens';

const FULL_TURN_DEGREES = 360;
const MIN_LIGHTNESS = 0;
const MAX_LIGHTNESS = 1;

function normalizeHue(hue: number): number {
	return ((hue % FULL_TURN_DEGREES) + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;
}

function clampLightness(lightness: number): number {
	return Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, lightness));
}

// An achromatic color has no hue to shift, so hueShift leaves it as is
function applyHue(color: Color, rule: OklchRule): Color {
	if (rule.hue !== undefined) return { ...color, h: rule.hue };
	if (rule.hueShift !== undefined && color.h !== undefined) return { ...color, h: normalizeHue(color.h + rule.hueShift) };
	return color;
}

function applyChroma(color: Color, rule: OklchRule): Color {
	if (rule.chroma !== undefined) return { ...color, c: rule.chroma };
	if (rule.chromaScale !== undefined) return { ...color, c: (color.c ?? 0) * rule.chromaScale };
	return color;
}

function applyLightness(color: Color, rule: OklchRule): Color {
	const lightness = color.l ?? MIN_LIGHTNESS;
	if (rule.lightness !== undefined) return { ...color, l: clampLightness(rule.lightness) };
	if (rule.lightnessScale !== undefined) return { ...color, l: clampLightness(lightness * rule.lightnessScale) };
	if (rule.lightnessShift !== undefined) return { ...color, l: clampLightness(lightness + rule.lightnessShift) };
	return color;
}

// Rules run one after another on unclamped OKLCH; the gamut is only enforced once at the end
function transformHex(hex: string, rules: OklchRule[]): string {
	if (rules.length === 0) return hex;
	const transformed = rules.reduce((color, rule) => applyLightness(applyChroma(applyHue(color, rule), rule), rule), hexToOklch(hex));
	return oklchToHex(clampToSrgb(transformed));
}

function transformPalettes(palettes: GeneratedScheme['palettes'], compiled: CompiledRule[]): GeneratedScheme['palettes'] {
	return new Map([...palettes].map(([paletteName, tones]) => [
		paletteName,
		new Map([...tones].map(([tone, hex]) => [tone, transformHex(hex, rulesFor(paletteTokenName(paletteName, tone), null, compiled))])),
	]));
}

function transformRoles(roles: Map<string, string>, mode: ModeName, compiled: CompiledRule[]): Map<string, string> {
	return new Map([...roles].map(([role, hex]) => [role, transformHex(hex, rulesFor(role, mode, compiled))]));
}

function warnAboutUnmatchedPatterns(scheme: GeneratedScheme, compiled: CompiledRule[]): void {
	const paletteNames = [...scheme.palettes].flatMap(([name, tones]) => [...tones.keys()].map(tone => paletteTokenName(name, tone)));
	const tokenNames = [...scheme.roles.Light.keys(), ...paletteNames];
	for (const pattern of findUnmatchedPatterns(compiled, tokenNames)) {
		console.warn(`OKLCH rules: ${pattern} matches no token`);
	}
}

/**
 * Applies the config's OKLCH group and color rules to every palette tone and role; returns a new scheme.
 */
export function applyOklchRules(scheme: GeneratedScheme, rules: PostProcessRules): GeneratedScheme {
	const compiled = compileRules(rules);
	warnAboutUnmatchedPatterns(scheme, compiled);
	return {
		...scheme,
		palettes: transformPalettes(scheme.palettes, compiled),
		roles: {
			Light: transformRoles(scheme.roles.Light, 'Light', compiled),
			Dark: transformRoles(scheme.roles.Dark, 'Dark', compiled),
		},
	};
}
