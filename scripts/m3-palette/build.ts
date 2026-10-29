import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { ValidationError } from '../vuetify-theme/core/types';
import { validate } from '../vuetify-theme/core/validator';
import { generateScheme } from './generateScheme';
import { loadConfig } from './loadConfig';
import { applyOklchRules } from './oklchRules';
import { preserveHue } from './preserveHue';
import { serializeTokens } from './serializeTokens';

const CONFIG_PATH = fileURLToPath(new URL('../../m3-palette.config.yaml', import.meta.url));
// Matches the indentation of the hand-written src/*.json files
const JSON_INDENT = '\t';

function formatValidationErrors(errors: ValidationError[]): string {
	return errors
		.map(e => `  [${e.errorType}] ${e.collection}.${e.token}${e.mode ? ` (${e.mode})` : ''}: ${e.message}`)
		.join('\n');
}

function main(): void {
	try {
		const config = loadConfig(CONFIG_PATH);
		const { preserveHue: shouldPreserveHue, neutralHueFromPrimary } = config.postProcess;
		const generated = generateScheme(config);
		const hueLocked = shouldPreserveHue ? preserveHue(generated, { neutralHueFromPrimary }) : generated;
		const tokens = serializeTokens(applyOklchRules(hueLocked, config.postProcess));

		const validation = validate(tokens);
		if (!validation.valid) {
			throw new Error(`Generated tokens failed validation:\n${formatValidationErrors(validation.errors)}`);
		}

		writeFileSync(config.output, JSON.stringify(tokens, null, JSON_INDENT));
		console.log(`Wrote M3 palette tokens to ${config.output}`);
	} catch (err) {
		console.error(`M3 palette generation failed: ${err instanceof Error ? err.message : String(err)}`);
		process.exit(1);
	}
}

main();
