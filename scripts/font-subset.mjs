import { createFont, woff2 } from "fonteditor-core";

// Keep the original font's glyphs for the requested text; encode with WASM,
// without the obsolete native node-gyp/tar toolchain used by fontmin.
export async function subsetFont(buffer, type, text) {
	await woff2.init();
	const subset = [...new Set(Array.from(text, (char) => char.codePointAt(0)))];
	const font = createFont(buffer, {
		type,
		subset,
		hinting: false,
		compound2simple: true,
	});
	return Buffer.from(
		font.write({
			type: "woff2",
			hinting: false,
			writeZeroContoursGlyfData: true,
		}),
	);
}
