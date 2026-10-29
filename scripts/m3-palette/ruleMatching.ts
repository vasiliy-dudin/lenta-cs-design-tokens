import { M3PaletteConfig, ModeName, OklchRule } from './configSchema';

const PATTERN_SEPARATOR = /[,|]/;
const TONE_PATTERN_SUFFIX = '-';
const TONE_NUMBER = /^\d+$/;

export type PostProcessRules = Pick<M3PaletteConfig['postProcess'], 'groups' | 'colors'>;

export interface CompiledRule {
	// Where the rule came from, for warnings: groups["<key>"] or colors["<key>"]
	origin: string;
	patterns: string[];
	isExact: boolean;
	rule: OklchRule;
}

function splitPatterns(key: string): string[] {
	return key.split(PATTERN_SEPARATOR).map(pattern => pattern.trim()).filter(pattern => pattern.length > 0);
}

/**
 * Checks a token name against a group pattern: "neutral-" matches palette tones (neutral-40) only,
 * "primary" matches primary itself and every primary-* name.
 */
export function matchesPattern(name: string, pattern: string): boolean {
	if (pattern.endsWith(TONE_PATTERN_SUFFIX)) {
		return name.startsWith(pattern) && TONE_NUMBER.test(name.slice(pattern.length));
	}
	return name === pattern || name.startsWith(`${pattern}${TONE_PATTERN_SUFFIX}`);
}

/**
 * Flattens the config rules into application order: groups in declaration order, then exact colors.
 */
export function compileRules(rules: PostProcessRules): CompiledRule[] {
	const groups = Object.entries(rules.groups).map(([key, rule]) => ({
		origin: `groups["${key}"]`, patterns: splitPatterns(key), isExact: false, rule,
	}));
	const colors = Object.entries(rules.colors).map(([key, rule]) => ({
		origin: `colors["${key}"]`, patterns: [key], isExact: true, rule,
	}));
	return [...groups, ...colors];
}

function ruleMatchesName(compiled: CompiledRule, name: string): boolean {
	return compiled.isExact
		? compiled.patterns[0] === name
		: compiled.patterns.some(pattern => matchesPattern(name, pattern));
}

// mode is null for palette tones: they are shared by all modes, so mode-limited rules skip them
function ruleAppliesToMode(rule: OklchRule, mode: ModeName | null): boolean {
	if (rule.modes === undefined) return true;
	return mode !== null && rule.modes.includes(mode);
}

/**
 * Returns the rules that apply to a token name in the given mode (null for palette tones), in application order.
 */
export function rulesFor(name: string, mode: ModeName | null, compiled: CompiledRule[]): OklchRule[] {
	return compiled
		.filter(entry => ruleMatchesName(entry, name) && ruleAppliesToMode(entry.rule, mode))
		.map(entry => entry.rule);
}

/**
 * Lists every pattern (or exact color name) that matches none of the given token names, labelled by origin.
 */
export function findUnmatchedPatterns(compiled: CompiledRule[], tokenNames: string[]): string[] {
	const unmatched: string[] = [];
	for (const entry of compiled) {
		for (const pattern of entry.patterns) {
			const probe: CompiledRule = { ...entry, patterns: [pattern] };
			if (!tokenNames.some(name => ruleMatchesName(probe, name))) unmatched.push(`"${pattern}" in ${entry.origin}`);
		}
	}
	return unmatched;
}
