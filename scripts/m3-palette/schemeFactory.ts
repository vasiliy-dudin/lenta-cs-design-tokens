import {
	argbFromHex,
	DynamicScheme,
	DynamicSchemeOptions,
	Hct,
	SpecVersion,
	Variant,
} from '@materialx/material-color-utilities';
import { M3PaletteConfig, ModeName } from './configSchema';
import { CORE_PALETTES } from './materialConstants';

const DEFAULT_CONTRAST_LEVEL = 0;

export interface GeneratedScheme {
	palettes: Map<string, Map<number, string>>;
	roles: Record<ModeName, Map<string, string>>;
	// Role → palette it is drawn from; roles that are not palette-based (scrim, shadow) are absent
	rolePalettes: Map<string, string>;
	// Palette → the color it was generated from, used as the hue reference by preserveHue
	sourceColors: Map<string, string>;
	// Extended color names in config order; palette-sourced ones have roles but no palette of their own
	extendedColorNames: string[];
}

interface SchemeSettings {
	variant: Variant;
	specVersion: SpecVersion;
	isDark: boolean;
}

function createBaseScheme(sourceHex: string, settings: SchemeSettings): DynamicScheme {
	return DynamicScheme.from({
		sourceColorHct: Hct.fromInt(argbFromHex(sourceHex)),
		contrastLevel: DEFAULT_CONTRAST_LEVEL,
		...settings,
	});
}

/**
 * Builds the main scheme options for one mode, with core color overrides already applied as palettes.
 */
export function createSchemeOptions(config: M3PaletteConfig, isDark: boolean): DynamicSchemeOptions {
	const settings: SchemeSettings = { variant: Variant[config.variant], specVersion: SpecVersion[config.spec], isDark };
	const options: DynamicSchemeOptions = {
		sourceColorHct: Hct.fromInt(argbFromHex(config.seed)),
		contrastLevel: DEFAULT_CONTRAST_LEVEL,
		...settings,
	};

	// An override color goes through its own scheme so its palette gets the variant's chroma rules,
	// not the raw chroma of the override color (same approach as better-material-theme-builder)
	for (const palette of CORE_PALETTES) {
		const overrideHex = config.coreColors[palette.name];
		if (overrideHex) {
			options[palette.schemeField] = createBaseScheme(overrideHex, settings)[palette.schemeField];
		}
	}

	return options;
}
