import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { load } from 'js-yaml';
import { z } from 'zod';
import { M3PaletteConfig, M3PaletteConfigSchema } from './configSchema';

const ROOT_PATH_LABEL = '(root)';
const PLAIN_IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;

function formatIssuePath(path: PropertyKey[]): string {
	if (path.length === 0) return ROOT_PATH_LABEL;
	return path
		.map((segment, index) => {
			if (typeof segment === 'number') return `[${segment}]`;
			const name = String(segment);
			// Rule keys are patterns like "neutral-" or "primary, secondary"; quote them so they read as one segment
			if (!PLAIN_IDENTIFIER_PATTERN.test(name)) return `["${name}"]`;
			return index === 0 ? name : `.${name}`;
		})
		.join('');
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
	return issues.map(issue => `  ${formatIssuePath(issue.path)}: ${issue.message}`).join('\n');
}

/**
 * Reads and validates the YAML palette config; returns it with `output` resolved against the config's directory.
 */
export function loadConfig(configPath: string): M3PaletteConfig {
	const raw = load(readFileSync(configPath, 'utf-8'));
	const result = M3PaletteConfigSchema.safeParse(raw);

	if (!result.success) {
		throw new Error(`Invalid config ${configPath}:\n${formatIssues(result.error.issues)}`);
	}

	return { ...result.data, output: resolve(dirname(configPath), result.data.output) };
}
