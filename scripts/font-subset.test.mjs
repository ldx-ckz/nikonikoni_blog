import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createFont } from "fonteditor-core";
import { subsetFont } from "./font-subset.mjs";

test("font subset preserves supported text and produces readable WOFF2", async () => {
	const source = readFileSync(
		new URL("../public/assets/font/ZenMaruGothic-Medium.ttf", import.meta.url),
	);
	const text = "ABC 你好日本語";
	const original = createFont(source, { type: "ttf" }).get();
	const output = await subsetFont(source, "ttf", text);
	assert.equal(output.toString("ascii", 0, 4), "wOF2");
	assert.ok(output.length < source.length);
	const result = createFont(output, { type: "woff2" }).get();
	for (const char of text) {
		const code = char.codePointAt(0);
		if (original.cmap[code] !== undefined) {
			assert.notEqual(result.cmap[code], undefined, `Missing glyph: ${char}`);
		}
	}
	assert.ok(result.glyf.length < original.glyf.length);
});
