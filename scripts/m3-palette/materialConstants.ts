import { DynamicColor, MaterialDynamicColors } from '@materialx/material-color-utilities';
import { CoreColors } from './configSchema';

// Same tone set as better-material-theme-builder and the current Basic.colors-m3
export const TONES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100] as const;

export const PALETTE = {
	primary: 'primary',
	secondary: 'secondary',
	tertiary: 'tertiary',
	error: 'error',
	neutral: 'neutral',
	neutralVariant: 'neutral-variant',
} as const satisfies Record<string, keyof CoreColors>;

export type SchemePaletteField =
	| 'primaryPalette'
	| 'secondaryPalette'
	| 'tertiaryPalette'
	| 'errorPalette'
	| 'neutralPalette'
	| 'neutralVariantPalette';

export interface CorePaletteDefinition {
	name: keyof CoreColors;
	schemeField: SchemePaletteField;
}

export const CORE_PALETTES: readonly CorePaletteDefinition[] = [
	{ name: PALETTE.primary, schemeField: 'primaryPalette' },
	{ name: PALETTE.secondary, schemeField: 'secondaryPalette' },
	{ name: PALETTE.tertiary, schemeField: 'tertiaryPalette' },
	{ name: PALETTE.error, schemeField: 'errorPalette' },
	{ name: PALETTE.neutral, schemeField: 'neutralPalette' },
	{ name: PALETTE.neutralVariant, schemeField: 'neutralVariantPalette' },
];

// Role name, its dynamic color, and the palette it is drawn from (null: not palette-based, always black).
// Order follows generateSchemeColors in better-material-theme-builder.
export const SCHEME_ROLES: ReadonlyArray<readonly [string, DynamicColor, string | null]> = [
	['primary', MaterialDynamicColors.primary, PALETTE.primary],
	['on-primary', MaterialDynamicColors.onPrimary, PALETTE.primary],
	['primary-container', MaterialDynamicColors.primaryContainer, PALETTE.primary],
	['on-primary-container', MaterialDynamicColors.onPrimaryContainer, PALETTE.primary],
	['secondary', MaterialDynamicColors.secondary, PALETTE.secondary],
	['on-secondary', MaterialDynamicColors.onSecondary, PALETTE.secondary],
	['secondary-container', MaterialDynamicColors.secondaryContainer, PALETTE.secondary],
	['on-secondary-container', MaterialDynamicColors.onSecondaryContainer, PALETTE.secondary],
	['tertiary', MaterialDynamicColors.tertiary, PALETTE.tertiary],
	['on-tertiary', MaterialDynamicColors.onTertiary, PALETTE.tertiary],
	['tertiary-container', MaterialDynamicColors.tertiaryContainer, PALETTE.tertiary],
	['on-tertiary-container', MaterialDynamicColors.onTertiaryContainer, PALETTE.tertiary],
	['error', MaterialDynamicColors.error, PALETTE.error],
	['on-error', MaterialDynamicColors.onError, PALETTE.error],
	['error-container', MaterialDynamicColors.errorContainer, PALETTE.error],
	['on-error-container', MaterialDynamicColors.onErrorContainer, PALETTE.error],
	['surface', MaterialDynamicColors.surface, PALETTE.neutral],
	['on-surface', MaterialDynamicColors.onSurface, PALETTE.neutral],
	['surface-dim', MaterialDynamicColors.surfaceDim, PALETTE.neutral],
	['surface-bright', MaterialDynamicColors.surfaceBright, PALETTE.neutral],
	['surface-container-lowest', MaterialDynamicColors.surfaceContainerLowest, PALETTE.neutral],
	['surface-container-low', MaterialDynamicColors.surfaceContainerLow, PALETTE.neutral],
	['surface-container', MaterialDynamicColors.surfaceContainer, PALETTE.neutral],
	['surface-container-high', MaterialDynamicColors.surfaceContainerHigh, PALETTE.neutral],
	['surface-container-highest', MaterialDynamicColors.surfaceContainerHighest, PALETTE.neutral],
	['outline', MaterialDynamicColors.outline, PALETTE.neutralVariant],
	['outline-variant', MaterialDynamicColors.outlineVariant, PALETTE.neutralVariant],
	['primary-fixed', MaterialDynamicColors.primaryFixed, PALETTE.primary],
	['primary-fixed-dim', MaterialDynamicColors.primaryFixedDim, PALETTE.primary],
	['on-primary-fixed', MaterialDynamicColors.onPrimaryFixed, PALETTE.primary],
	['on-primary-fixed-variant', MaterialDynamicColors.onPrimaryFixedVariant, PALETTE.primary],
	['secondary-fixed', MaterialDynamicColors.secondaryFixed, PALETTE.secondary],
	['secondary-fixed-dim', MaterialDynamicColors.secondaryFixedDim, PALETTE.secondary],
	['on-secondary-fixed', MaterialDynamicColors.onSecondaryFixed, PALETTE.secondary],
	['on-secondary-fixed-variant', MaterialDynamicColors.onSecondaryFixedVariant, PALETTE.secondary],
	['tertiary-fixed', MaterialDynamicColors.tertiaryFixed, PALETTE.tertiary],
	['tertiary-fixed-dim', MaterialDynamicColors.tertiaryFixedDim, PALETTE.tertiary],
	['on-tertiary-fixed', MaterialDynamicColors.onTertiaryFixed, PALETTE.tertiary],
	['on-tertiary-fixed-variant', MaterialDynamicColors.onTertiaryFixedVariant, PALETTE.tertiary],
	['scrim', MaterialDynamicColors.scrim, null],
	['shadow', MaterialDynamicColors.shadow, null],
	['inverse-surface', MaterialDynamicColors.inverseSurface, PALETTE.neutral],
	['inverse-on-surface', MaterialDynamicColors.inverseOnSurface, PALETTE.neutral],
	['inverse-primary', MaterialDynamicColors.inversePrimary, PALETTE.primary],
];
