import { readFileSync, writeFileSync } from 'fs';
import { validate } from './core/validator';
import { ValidationError } from './core/types';
import { selectTokens } from './selectTokens';
import { resolveValues, ResolvedThemes } from './resolveValues';
import config from '../../vuetify-theme.config.js';

function readTokenJson(): unknown {
	return JSON.parse(readFileSync(config.inputFile, 'utf-8'));
}

function formatValidationErrors(errors: ValidationError[]): string {
	return errors
		.map(e => `  [${e.errorType}] ${e.collection}.${e.token}${e.mode ? ` (${e.mode})` : ''}: ${e.message}`)
		.join('\n');
}

function buildThemes(resolved: ResolvedThemes): Record<string, unknown> {
	const themes: Record<string, unknown> = {};
	for (const [themeName, theme] of Object.entries(resolved)) {
		themes[themeName] = { dark: themeName === 'dark', ...theme };
	}
	return themes;
}

function main(): void {
	if (Object.keys(config.modes).length === 0) {
		console.error('Theme generation failed: config.modes is empty — no themes to generate.');
		process.exit(1);
	}

	const tokenJson = readTokenJson();

	const validation = validate(tokenJson);
	if (!validation.valid) {
		console.error(`Token validation failed:\n${formatValidationErrors(validation.errors)}`);
		process.exit(1);
	}

	try {
		const selected = selectTokens(validation.data, config);
		const resolved = resolveValues(validation.data, selected, config.modes);
		const output = { themes: buildThemes(resolved) };

		writeFileSync(config.outputFile, JSON.stringify(output, null, 2));
		console.log(`Wrote ${Object.keys(output.themes).length} theme(s) to ${config.outputFile}`);
	} catch (err) {
		console.error(`Theme generation failed: ${err instanceof Error ? err.message : String(err)}`);
		process.exit(1);
	}
}

main();
