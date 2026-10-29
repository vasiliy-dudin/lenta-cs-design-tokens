import { PALETTE } from './materialConstants';

const ACCENT_PALETTES_BEFORE_EXTENDED = [PALETTE.primary, PALETTE.secondary, PALETTE.tertiary];
const ACCENT_PALETTES_AFTER_EXTENDED = [PALETTE.error];
const FIXED_PALETTES = [PALETTE.primary, PALETTE.secondary, PALETTE.tertiary];
const SURFACE_PAIR = ['surface', 'on-surface'];
const OUTLINE_SHADOW_INVERSE = [
	'outline', 'outline-variant', 'shadow', 'scrim', 'inverse-surface', 'inverse-on-surface', 'inverse-primary',
];
const SURFACE_LEVELS = [
	'surface-dim', 'surface-bright', 'surface-container-lowest', 'surface-container-low',
	'surface-container', 'surface-container-high', 'surface-container-highest',
];

const colorPair = (palette: string): string[] => [palette, `on-${palette}`];
const containerPair = (palette: string): string[] => [`${palette}-container`, `on-${palette}-container`];
const fixedGroup = (palette: string): string[] => [
	`${palette}-fixed`, `on-${palette}-fixed`, `${palette}-fixed-dim`, `on-${palette}-fixed-variant`,
];

// Mirrors the grouping of the hand-maintained Theme.schemes: color pairs, containers, outlines, fixed, surface levels
function buildRoleOrder(extendedNames: string[]): string[] {
	const accents = [...ACCENT_PALETTES_BEFORE_EXTENDED, ...extendedNames, ...ACCENT_PALETTES_AFTER_EXTENDED];
	return [
		...accents.flatMap(colorPair),
		...SURFACE_PAIR,
		...accents.flatMap(containerPair),
		...OUTLINE_SHADOW_INVERSE,
		...FIXED_PALETTES.flatMap(fixedGroup),
		...SURFACE_LEVELS,
	];
}

/**
 * Returns the role names in token output order; throws if the generated roles and the order template diverge.
 */
export function orderRoleNames(roleNames: string[], extendedNames: string[]): string[] {
	const ordered = buildRoleOrder(extendedNames);
	const generated = new Set(roleNames);
	const missingFromOrder = roleNames.filter(role => !ordered.includes(role));
	const missingFromRoles = ordered.filter(role => !generated.has(role));

	if (missingFromOrder.length > 0 || missingFromRoles.length > 0) {
		throw new Error(
			`orderRoleNames: role order template is out of sync — not in template: [${missingFromOrder.join(', ')}], ` +
			`not generated: [${missingFromRoles.join(', ')}]`,
		);
	}
	return ordered;
}
