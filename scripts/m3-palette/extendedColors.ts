import {
	argbFromHex,
	Blend,
	DynamicColor,
	DynamicScheme,
	Hct,
	hexFromArgb,
	MaterialDynamicColors,
	TonalPalette,
} from '@materialx/material-color-utilities';
import { ExtendedColor, M3PaletteConfig } from './configSchema';
import { TONES } from './materialConstants';
import { createSchemeOptions, GeneratedScheme } from './schemeFactory';

// Extended roles reuse the primary role rules; the name builders map them to <name>-based keys
const EXTENDED_ROLE_SOURCES: ReadonlyArray<readonly [(name: string) => string, DynamicColor]> = [
	[name => name, MaterialDynamicColors.primary],
	[name => `on-${name}`, MaterialDynamicColors.onPrimary],
	[name => `${name}-container`, MaterialDynamicColors.primaryContainer],
	[name => `on-${name}-container`, MaterialDynamicColors.onPrimaryContainer],
];

function toSourceArgb(color: ExtendedColor, seedArgb: number): number {
	const colorArgb = argbFromHex(color.color);
	return color.harmonize ? Blend.harmonize(colorArgb, seedArgb) : colorArgb;
}

// Keeps the color's own chroma (not the variant's) so status colors stay as saturated as configured
function createExtendedPalette(sourceArgb: number): TonalPalette {
	const hct = Hct.fromInt(sourceArgb);
	return TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);
}

// Swapping the palette into the main scheme gives the roles the primary role rules of extendedRoleSpec;
// the whole scheme uses that spec so the roles and the surfaces they contrast with follow the same rules
function extractExtendedRoles(name: string, palette: TonalPalette, config: M3PaletteConfig, isDark: boolean): Array<[string, string]> {
	const roleConfig = { ...config, spec: config.extendedRoleSpec };
	const scheme = DynamicScheme.from({ ...createSchemeOptions(roleConfig, isDark), primaryPalette: palette });
	return EXTENDED_ROLE_SOURCES.map(([toRoleName, dynamicColor]) => [toRoleName(name), hexFromArgb(dynamicColor.getArgb(scheme))]);
}

/**
 * Generates a tonal palette and four Light/Dark roles per extended color, both from the same palette.
 */
export function generateExtendedColors(config: M3PaletteConfig): GeneratedScheme {
	const seedArgb = argbFromHex(config.seed);
	const result: GeneratedScheme = {
		palettes: new Map(),
		roles: { Light: new Map(), Dark: new Map() },
		rolePalettes: new Map(),
		sourceColors: new Map(),
	};

	for (const color of config.extendedColors) {
		const sourceArgb = toSourceArgb(color, seedArgb);
		const palette = createExtendedPalette(sourceArgb);
		result.palettes.set(color.name, new Map(TONES.map(tone => [tone, hexFromArgb(palette.tone(tone))])));
		result.sourceColors.set(color.name, hexFromArgb(sourceArgb));
		extractExtendedRoles(color.name, palette, config, false).forEach(([role, hex]) => result.roles.Light.set(role, hex));
		extractExtendedRoles(color.name, palette, config, true).forEach(([role, hex]) => result.roles.Dark.set(role, hex));
		EXTENDED_ROLE_SOURCES.forEach(([toRoleName]) => result.rolePalettes.set(toRoleName(color.name), color.name));
	}

	return result;
}
