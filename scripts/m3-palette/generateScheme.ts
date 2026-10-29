import { DynamicScheme, hexFromArgb } from '@materialx/material-color-utilities';
import { M3PaletteConfig } from './configSchema';
import { generateExtendedColors } from './extendedColors';
import { CORE_PALETTES, SCHEME_ROLES, TONES } from './materialConstants';
import { createSchemeOptions, GeneratedScheme } from './schemeFactory';

// Mid tone of a generated palette; its hue stands in for the source of palettes derived from the seed
const SOURCE_REFERENCE_TONE = 50;

function extractPalettes(scheme: DynamicScheme): Map<string, Map<number, string>> {
	const palettes = new Map<string, Map<number, string>>();
	for (const palette of CORE_PALETTES) {
		const tonalPalette = scheme[palette.schemeField];
		palettes.set(palette.name, new Map(TONES.map(tone => [tone, hexFromArgb(tonalPalette.tone(tone))])));
	}
	return palettes;
}

function extractRoles(scheme: DynamicScheme): Map<string, string> {
	return new Map(SCHEME_ROLES.map(([name, dynamicColor]) => [name, hexFromArgb(dynamicColor.getArgb(scheme))]));
}

function collectRolePalettes(): Map<string, string> {
	const rolePalettes = new Map<string, string>();
	for (const [name, , paletteName] of SCHEME_ROLES) {
		if (paletteName !== null) rolePalettes.set(name, paletteName);
	}
	return rolePalettes;
}

// An explicit core color override is the palette's source; otherwise the palette was derived from the seed
function collectSourceColors(config: M3PaletteConfig, scheme: DynamicScheme): Map<string, string> {
	return new Map(CORE_PALETTES.map(palette => [
		palette.name,
		config.coreColors[palette.name] ?? hexFromArgb(scheme[palette.schemeField].tone(SOURCE_REFERENCE_TONE)),
	]));
}

/**
 * Generates core and extended tonal palettes and Light/Dark scheme roles from the config.
 */
export function generateScheme(config: M3PaletteConfig): GeneratedScheme {
	const lightScheme = DynamicScheme.from(createSchemeOptions(config, false));
	const darkScheme = DynamicScheme.from(createSchemeOptions(config, true));
	const extended = generateExtendedColors(config);

	return {
		palettes: new Map([...extractPalettes(lightScheme), ...extended.palettes]),
		roles: {
			Light: new Map([...extractRoles(lightScheme), ...extended.roles.Light]),
			Dark: new Map([...extractRoles(darkScheme), ...extended.roles.Dark]),
		},
		rolePalettes: new Map([...collectRolePalettes(), ...extended.rolePalettes]),
		sourceColors: new Map([...collectSourceColors(config, lightScheme), ...extended.sourceColors]),
	};
}
