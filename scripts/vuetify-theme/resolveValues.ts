import { TokenJSON, TokenMap, RGBA } from './core/types';
import { createTokenMap } from './core/tokenUtils';
import { resolveToken, rgbaToHex } from './core/resolver';
import type { SelectedToken } from './selectTokens';

export type ResolvedThemeValues = Record<string, string | number>;
export type ResolvedTheme = Record<string, ResolvedThemeValues>;
export type ResolvedThemes = Record<string, ResolvedTheme>;

/**
 * Follows alias chains to a concrete value using only resolveToken's public API.
 * Mirrors core/resolver.ts's private resolveToConcreteValue — duplicated here
 * rather than exported from core/, which stays an unmodified upstream mirror.
 */
function resolveConcrete(
	tokenPath: string,
	mode: string,
	tokenMap: TokenMap,
	visited: Set<string> = new Set()
): string | number | RGBA {
	const result = resolveToken(tokenPath, mode, tokenMap, visited);
	if (!result.isAlias) return result.value;
	return resolveConcrete(result.targetPath, mode, tokenMap, visited);
}

function formatValue(value: string | number | RGBA): string | number {
	return typeof value === 'object' ? rgbaToHex(value) : value;
}

export function resolveValues(
	tokenJson: TokenJSON,
	selected: SelectedToken[],
	modes: Record<string, string>
): ResolvedThemes {
	const tokenMap = createTokenMap(tokenJson);
	const themes: ResolvedThemes = {};

	for (const [themeName, modeKey] of Object.entries(modes)) {
		const theme: ResolvedTheme = {};
		for (const entry of selected) {
			const concrete = resolveConcrete(entry.tokenPath, modeKey, tokenMap);
			theme[entry.target] ??= {};
			theme[entry.target][entry.outputName] = formatValue(concrete);
		}
		themes[themeName] = theme;
	}

	return themes;
}
