const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function formatKey(key: string): string {
	return IDENTIFIER_PATTERN.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;
}

function serializeValue(value: unknown, indent: number): string {
	if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);

	if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) return '{}';

		const pad = '\t'.repeat(indent + 1);
		const closingPad = '\t'.repeat(indent);
		const lines = entries.map(
			([key, entryValue]) => `${pad}${formatKey(key)}: ${serializeValue(entryValue, indent + 1)},`
		);
		return `{\n${lines.join('\n')}\n${closingPad}}`;
	}

	throw new Error(`serializeJsModule: cannot serialize value of type ${typeof value}`);
}

/**
 * Serializes a plain JS value into `export default {...};` module source,
 * using single-quoted strings to match this codebase's style.
 */
export function serializeJsModule(value: unknown): string {
	return `export default ${serializeValue(value, 0)};\n`;
}
