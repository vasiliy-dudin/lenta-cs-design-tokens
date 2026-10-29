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
import { CORE_PALETTES, TONES } from './materialConstants';
import { createSchemeOptions, GeneratedScheme } from './schemeFactory';

type ColorSourcedExtended = Extract<ExtendedColor, { source: 'color' }>;
type PaletteSourcedExtended = Extract<ExtendedColor, { source: 'palette' }>;

// Extended roles reuse the primary role rules; the name builders map them to <name>-based keys
const EXTENDED_ROLE_SOURCES: ReadonlyArray<readonly [(name: string) => string, DynamicColor]> = [
	[name => name, MaterialDynamicColors.primary],
	[name => `on-${name}`, MaterialDynamicColors.onPrimary],
	[name => `${name}-container`, MaterialDynamicColors.primaryContainer],
	[name => `on-${name}-container`, MaterialDynamicColors.onPrimaryContainer],
];

function toSourceArgb(color: ColorSourcedExtended, seedArgb: number): number {
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

// paletteName is the palette preserveHue locks these roles to: the color's own or the core one it borrows
function addRoles(result: GeneratedScheme, name: string, palette: TonalPalette, paletteName: string, config: M3PaletteConfig): void {
	extractExtendedRoles(name, palette, config, false).forEach(([role, hex]) => result.roles.Light.set(role, hex));
	extractExtendedRoles(name, palette, config, true).forEach(([role, hex]) => result.roles.Dark.set(role, hex));
	EXTENDED_ROLE_SOURCES.forEach(([toRoleName]) => result.rolePalettes.set(toRoleName(name), paletteName));
}

function addColorSourced(result: GeneratedScheme, color: ColorSourcedExtended, config: M3PaletteConfig, seedArgb: number): void {
	const sourceArgb = toSourceArgb(color, seedArgb);
	const palette = createExtendedPalette(sourceArgb);
	result.palettes.set(color.name, new Map(TONES.map(tone => [tone, hexFromArgb(palette.tone(tone))])));
	result.sourceColors.set(color.name, hexFromArgb(sourceArgb));
	addRoles(result, color.name, palette, color.name, config);
}

// Borrows the exported core palette, so the roles are tones of colors-m3 and no new palette is emitted
function addPaletteSourced(result: GeneratedScheme, color: PaletteSourcedExtended, config: M3PaletteConfig, mainScheme: DynamicScheme): void {
	const corePalette = CORE_PALETTES.find(palette => palette.name === color.palette);
	if (!corePalette) {
		throw new Error(`generateExtendedColors: "${color.name}" refers to unknown core palette "${color.palette}"`);
	}
	addRoles(result, color.name, mainScheme[corePalette.schemeField], color.palette, config);
}

/**
 * Generates the four Light/Dark roles per extended color, plus a tonal palette for colors given by `color`.
 */
export function generateExtendedColors(config: M3PaletteConfig, mainScheme: DynamicScheme): GeneratedScheme {
	const seedArgb = argbFromHex(config.seed);
	const result: GeneratedScheme = {
		palettes: new Map(),
		roles: { Light: new Map(), Dark: new Map() },
		rolePalettes: new Map(),
		sourceColors: new Map(),
		extendedColorNames: config.extendedColors.map(color => color.name),
	};

	for (const color of config.extendedColors) {
		if (color.source === 'palette') addPaletteSourced(result, color, config, mainScheme);
		else addColorSourced(result, color, config, seedArgb);
	}

	return result;
}
