export default {
	// Path to the merged token source of truth, relative to this config file.
	inputFile: new URL('./dist/tokens.json', import.meta.url),

	// Where the generated Vuetify theme JSON gets written, relative to this config file.
	outputFile: new URL('./dist/vuetify-theme.json', import.meta.url),

	// Vuetify theme name → mode key used in each token's $value object.
	modes: {
		light: 'Light',
		dark: 'Dark',
	},

	// Prefix-based mapping: any token whose full path starts with `prefix` is
	// resolved and placed under themes.<mode>.<target>. The output name is the
	// remainder of the path after the prefix (e.g. "Semantic.schemes.primary"
	// with prefix "Semantic.schemes" → output name "primary"), unless overridden
	// in `rename` below.
	rules: [
		{
			prefix: 'Semantic.schemes',
			target: 'colors',
		},
		{
			prefix: 'Semantic.vuetify-variables',
			target: 'variables',
		},
	],

	// Full token path → output name override. Takes priority over the
	// auto-derived name from `rules` above.
	rename: {
		// 'Semantic.schemes.on-default': 'on-background',
	},

	// Token paths to resolve-skip entirely, even if they match a rule above.
	// Matches the same way as a rule's prefix: an exact token path excludes
	// just that token, a group path (e.g. "Semantic.schemes") excludes
	// everything nested under it.
	exclude: [
		// 'Semantic.schemes.default',
	],

	// Static values to add to the generated output, on top of what's resolved
	// from tokens. Keyed by theme name (must match a key in `modes` above),
	// then by target (e.g. "colors", "variables"), then by output key → value.
	// Build fails if a key here collides with one already resolved from tokens.
	extra: {
		dark: {
			colors: {
				darken: '#ffffff',
			},
		},
		light: {
			colors: {
				darken: '#000000',
			},
		},
	},
};
