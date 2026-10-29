import { z } from 'zod';

// Names match the Variant enum keys in @materialx/material-color-utilities
export const VARIANT_NAMES = [
	'TONAL_SPOT', 'VIBRANT', 'EXPRESSIVE', 'NEUTRAL', 'MONOCHROME',
	'FIDELITY', 'CONTENT', 'RAINBOW', 'FRUIT_SALAD',
] as const;

export const SPEC_NAMES = ['SPEC_2021', 'SPEC_2025'] as const;

export const MODE_NAMES = ['Light', 'Dark'] as const;

// 2021 keeps extended containers light in Light mode and dark in Dark mode; 2025 can place a saturated
// color's container on a mid tone, which flips its on-container text between black and white
const DEFAULT_EXTENDED_ROLE_SPEC = 'SPEC_2021';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const MAX_HUE = 360;

const HexColorSchema = z.string().regex(HEX_COLOR_PATTERN, 'expected a 6-digit hex color like "#3545e1"');

const CoreColorsSchema = z.strictObject({
	primary: HexColorSchema.optional(),
	secondary: HexColorSchema.optional(),
	tertiary: HexColorSchema.optional(),
	error: HexColorSchema.optional(),
	neutral: HexColorSchema.optional(),
	'neutral-variant': HexColorSchema.optional(),
});

const EXTENDED_COLOR_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const CORE_PALETTE_NAMES: readonly string[] = Object.keys(CoreColorsSchema.shape);

const ExtendedColorSchema = z.strictObject({
	name: z.string().regex(EXTENDED_COLOR_NAME_PATTERN, 'expected a kebab-case name like "warning"'),
	color: HexColorSchema,
	harmonize: z.boolean().default(true),
});

// Extended names become palette and role keys next to the core ones, so a clash would silently overwrite tokens
const ExtendedColorsSchema = z.array(ExtendedColorSchema).superRefine((colors, ctx) => {
	const seen = new Set<string>();
	colors.forEach((color, index) => {
		if (CORE_PALETTE_NAMES.includes(color.name)) {
			ctx.addIssue({ code: 'custom', path: [index, 'name'], message: `"${color.name}" is a core palette name` });
		} else if (seen.has(color.name)) {
			ctx.addIssue({ code: 'custom', path: [index, 'name'], message: `duplicate name "${color.name}"` });
		}
		seen.add(color.name);
	});
});

// Each group lists parameters that write the same OKLCH channel; combining them is ambiguous
const EXCLUSIVE_RULE_PARAMS = [
	['hue', 'hueShift'],
	['chroma', 'chromaScale'],
	['lightness', 'lightnessScale', 'lightnessShift'],
] as const;

const OklchRuleSchema = z
	.strictObject({
		hue: z.number().min(0).max(MAX_HUE).optional(),
		hueShift: z.number().min(-MAX_HUE).max(MAX_HUE).optional(),
		chroma: z.number().min(0).optional(),
		chromaScale: z.number().min(0).optional(),
		lightness: z.number().min(0).max(1).optional(),
		lightnessScale: z.number().min(0).optional(),
		lightnessShift: z.number().min(-1).max(1).optional(),
		modes: z.array(z.enum(MODE_NAMES)).min(1).optional(),
	})
	.superRefine((rule, ctx) => {
		for (const params of EXCLUSIVE_RULE_PARAMS) {
			const present = params.filter(param => rule[param] !== undefined);
			if (present.length > 1) {
				ctx.addIssue({ code: 'custom', message: `${present.join(' and ')} cannot be combined` });
			}
		}
	});

const PostProcessSchema = z
	.strictObject({
		preserveHue: z.boolean().default(false),
		neutralHueFromPrimary: z.boolean().default(false),
		groups: z.record(z.string(), OklchRuleSchema).default({}),
		colors: z.record(z.string(), OklchRuleSchema).default({}),
	})
	.superRefine((postProcess, ctx) => {
		if (postProcess.neutralHueFromPrimary && !postProcess.preserveHue) {
			ctx.addIssue({
				code: 'custom',
				path: ['neutralHueFromPrimary'],
				message: 'requires preserveHue: true',
			});
		}
	});

export const M3PaletteConfigSchema = z.strictObject({
	output: z.string().min(1),
	seed: HexColorSchema,
	variant: z.enum(VARIANT_NAMES),
	spec: z.enum(SPEC_NAMES),
	coreColors: CoreColorsSchema.default({}),
	extendedColors: ExtendedColorsSchema.default([]),
	extendedRoleSpec: z.enum(SPEC_NAMES).default(DEFAULT_EXTENDED_ROLE_SPEC),
	postProcess: PostProcessSchema.default({
		preserveHue: false,
		neutralHueFromPrimary: false,
		groups: {},
		colors: {},
	}),
});

export type M3PaletteConfig = z.infer<typeof M3PaletteConfigSchema>;
export type CoreColors = z.infer<typeof CoreColorsSchema>;
export type ExtendedColor = z.infer<typeof ExtendedColorSchema>;
export type OklchRule = z.infer<typeof OklchRuleSchema>;
export type ModeName = typeof MODE_NAMES[number];
