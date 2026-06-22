import { TokenJSON } from './core/types';
import { flattenTokenGroup, isExcluded } from './core/tokenUtils';

export interface SelectedToken {
	tokenPath: string;
	outputName: string;
	target: string;
}

export interface SelectionRule {
	prefix: string;
	target: string;
}

export interface SelectionConfig {
	rules: SelectionRule[];
	rename: Record<string, string>;
	exclude: string[];
}

function isHiddenPath(fullPath: string): boolean {
	return fullPath.split('.').some(segment => isExcluded(segment));
}

function matchesPrefix(fullPath: string, prefix: string): boolean {
	return fullPath === prefix || fullPath.startsWith(`${prefix}.`);
}

// Picks the longest matching prefix rather than the first one in declaration
// order, so a broad rule (e.g. "Semantic") can't silently shadow a more
// specific one (e.g. "Semantic.schemes") depending on which was listed first.
function matchRule(fullPath: string, rules: SelectionRule[]): SelectionRule | undefined {
	const matches = rules.filter(rule => matchesPrefix(fullPath, rule.prefix));
	return matches.sort((a, b) => b.prefix.length - a.prefix.length)[0];
}

function isExcludedPath(fullPath: string, exclude: string[]): boolean {
	return exclude.some(prefix => matchesPrefix(fullPath, prefix));
}

function deriveOutputName(fullPath: string, prefix: string): string {
	const name = fullPath.slice(prefix.length + 1);
	if (!name) {
		throw new Error(`Rule prefix "${prefix}" matches "${fullPath}" exactly, leaving an empty output name. Point the prefix at a group, not a single token.`);
	}
	return name;
}

/**
 * Select tokens to include in the generated theme: walks every collection in
 * `tokenJson`, keeps paths that match a rule's prefix, and assigns each an
 * output name and target (e.g. "colors" or "variables"). Resolution of the
 * actual value happens later, per selected entry and per mode.
 */
export function selectTokens(tokenJson: TokenJSON, config: SelectionConfig): SelectedToken[] {
	const selected: SelectedToken[] = [];
	const seen = new Map<string, string>();

	for (const [collectionName, group] of Object.entries(tokenJson)) {
		for (const relativePath of flattenTokenGroup(group).keys()) {
			const fullPath = `${collectionName}.${relativePath}`;
			if (isHiddenPath(fullPath) || isExcludedPath(fullPath, config.exclude)) continue;

			const rule = matchRule(fullPath, config.rules);
			if (!rule) continue;

			const outputName = config.rename[fullPath] ?? deriveOutputName(fullPath, rule.prefix);
			const collisionKey = `${rule.target}::${outputName}`;
			const existingPath = seen.get(collisionKey);
			if (existingPath) {
				throw new Error(
					`Naming collision: both "${existingPath}" and "${fullPath}" map to target "${rule.target}" with output name "${outputName}". Add an entry to "rename" to disambiguate.`
				);
			}
			seen.set(collisionKey, fullPath);

			selected.push({ tokenPath: fullPath, outputName, target: rule.target });
		}
	}

	return selected;
}
