This is a place for storing and refining design tokens in JSON format. 
The `dist/tokens.json` file serves as the single source of truth for the entire Lenta Omni Support Admin — covering both Figma and the frontend.

- The term "collections" here refers to top-level JSON entities, e.g. `"Semantic/Colors"`. They are called collections in Figma Variables.
- These tokens will be exported to Figma Variables and then passed to the frontend via the Vuetify framework. All collections and modes are stored in a single file.
- The Computed Variables plugin will be used for export to Figma, transforming JSON into Figma Variables.
- The value format used in this JSON is non-standard — it contains color/value modifiers that the plugin is expected to process.
- Token values may use aliases, which are references to other tokens. When naming an alias, the path is specified without the collection name — e.g. `{input.filled.bg-default}` rather than `{Components/Colors.input.filled.bg-default}`.
- The JSON is a mix of Material Design 3 tokens (August 2025 version) and Vuetify tokens. These will be unified in future iterations.
- The `Components` variable collections will primarily use aliases from Material Design 3 variables (located in other collections).
- A multi-tier design token system is used, comprising `Base`, `Semantic`, and `Components` collections. However, due to the constraints of Figma Variables, instead of a single `"Components"` collection, multiple collections are required:
  - `"Components/Colors"`
  - `"Components/Size"`