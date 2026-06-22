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
				'error-text': '#FFFFFF',
				'alert-warning': '#663C00',
				'secondary-darken-2': '#5B5E72',
				'table-surface': '#0F0E0D',
				defaultLayout: '#212121',
				baseLayout: '#212121',
				actionLayout: '#424242',
				defaultIcon: '#FFFFFF',
				menuIcon: '#ffffffff',
				darken: '#ffffff',
			},
		},
		light: {
			colors: {
				background: '#FFFFFF',
				'primary-darken-1': '#5E43A3',
				'secondary-darken-1': '#57516A',
				'secondary-darken-2': '#5B5E72',
				'error-text': '#FFFFFF',
				'error-darken-1': '#A31212',
				'table-surface': '#FBF9F9',
				'alert-warning': '#FFE2B7',
				defaultIcon: '#212121',
				menuIcon: '#757575',
				defaultLayout: '#FFFFFF',
				baseLayout: '#F5F5F5',
				actionLayout: '#E3F2FD',
				darken: '#000000',
			},
		},
	},
};
