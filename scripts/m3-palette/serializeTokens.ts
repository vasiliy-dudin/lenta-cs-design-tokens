import { ALL_SCOPE_ALIAS } from '../vuetify-theme/core/constants';
import { Token, TokenGroup, TokenJSON } from '../vuetify-theme/core/types';
import { TONES } from './materialConstants';
import { orderRoleNames } from './roleOrder';
import { GeneratedScheme } from './schemeFactory';

const ROLES_COLLECTION = 'Theme';
const ROLES_GROUP = 'schemes';
const PALETTES_COLLECTION = 'Basic';
const PALETTES_GROUP = 'colors-m3';
const COLOR_TOKEN_TYPE = 'color';

// Lightest first, matching the hand-written Basic.colors-m3 order
const TONES_LIGHT_TO_DARK = [...TONES].reverse();

/**
 * Returns the token name of a palette tone, e.g. "neutral-variant-40".
 */
export function paletteTokenName(paletteName: string, tone: number): string {
	return `${paletteName}-${tone}`;
}

function colorToken(value: Token['$value']): Token {
	return { $type: COLOR_TOKEN_TYPE, $value: value, $scope: [ALL_SCOPE_ALIAS] };
}

function serializeRoles(scheme: GeneratedScheme): TokenGroup {
	const group: TokenGroup = {};
	for (const role of orderRoleNames([...scheme.roles.Light.keys()], scheme.extendedColorNames)) {
		const lightHex = scheme.roles.Light.get(role);
		const darkHex = scheme.roles.Dark.get(role);
		if (lightHex === undefined || darkHex === undefined) {
			throw new Error(`serializeRoles: role "${role}" needs both a Light and a Dark value`);
		}
		group[role] = colorToken({ Light: lightHex, Dark: darkHex });
	}
	return group;
}

function serializePalettes(scheme: GeneratedScheme): TokenGroup {
	const group: TokenGroup = {};
	for (const [paletteName, tones] of scheme.palettes) {
		for (const tone of TONES_LIGHT_TO_DARK) {
			const hex = tones.get(tone);
			if (hex === undefined) {
				throw new Error(`serializePalettes: palette "${paletteName}" has no tone ${tone}`);
			}
			group[paletteTokenName(paletteName, tone)] = colorToken(hex);
		}
	}
	return group;
}

// Roles and palettes go to separate source files so their merge position can be set by file numbering
export interface GeneratedTokenFiles {
	schemes: TokenJSON;
	palettes: TokenJSON;
}

/**
 * Converts the generated scheme into token JSON: roles under Theme.schemes, palettes under Basic.colors-m3.
 */
export function serializeTokens(scheme: GeneratedScheme): GeneratedTokenFiles {
	return {
		schemes: { [ROLES_COLLECTION]: { [ROLES_GROUP]: serializeRoles(scheme) } },
		palettes: { [PALETTES_COLLECTION]: { [PALETTES_GROUP]: serializePalettes(scheme) } },
	};
}
