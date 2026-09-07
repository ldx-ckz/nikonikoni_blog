import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getUmamiStats } from "../src/utils/umami-stats.server.ts";

const config = {
	enabled: true,
	scripts: '<script data-website-id="example-site"></script>',
	baseUrl: "https://api.umami.is/",
	apiKey: "test-only-secret",
};

test("Umami returns only public counts and sends credentials in a header", async (t) => {
	t.mock.method(globalThis, "fetch", async (endpoint, options) => {
		assert.equal(endpoint.pathname, "/v1/websites/example-site/stats");
		assert.equal(endpoint.searchParams.get("url"), "/posts/中文/");
		assert.equal(options.headers["x-umami-api-key"], config.apiKey);
		assert.ok(!endpoint.toString().includes(config.apiKey));
		return Response.json({
			pageviews: 12,
			visitors: 3,
			visits: 5,
			privateField: "omit",
		});
	});
	assert.deepEqual(await getUmamiStats(config, "/posts/中文/"), {
		pageviews: 12,
		visitors: 3,
		visits: 5,
	});
});

test("disabled or incomplete Umami configuration makes no requests", async (t) => {
	const request = t.mock.method(globalThis, "fetch", () =>
		assert.fail("unexpected network request"),
	);
	assert.equal(await getUmamiStats({ ...config, enabled: false }), null);
	assert.equal(await getUmamiStats({ ...config, apiKey: "" }), null);
	assert.equal(request.mock.callCount(), 0);
});

test("Umami failures do not expose credentials or fabricate zero counts", async (t) => {
	const warnings = [];
	t.mock.method(console, "warn", (message) => warnings.push(message));
	t.mock.method(globalThis, "fetch", async () => {
		throw new Error(config.apiKey);
	});
	assert.equal(await getUmamiStats(config), null);
	assert.ok(!JSON.stringify(warnings).includes(config.apiKey));
	t.mock.method(globalThis, "fetch", async () =>
		Response.json({ pageviews: "invalid" }),
	);
	assert.equal(await getUmamiStats(config), null);
});

test("statistics components do not serialize the Umami configuration", () => {
	for (const file of [
		"../src/components/PostMeta.astro",
		"../src/components/widget/Profile.astro",
	]) {
		const source = readFileSync(new URL(file, import.meta.url), "utf8");
		assert.doesNotMatch(
			source,
			/define:vars[\s\S]*?(?:umamiApiKey|umamiConfig)/,
		);
	}
});

test("explicitly disabled sync overrides an enabled .env without touching content", () => {
	const fixture = mkdtempSync(join(tmpdir(), "blog-sync-test-"));
	try {
		mkdirSync(join(fixture, "scripts"));
		copyFileSync(
			new URL("./sync-content.js", import.meta.url),
			join(fixture, "scripts/sync-content.mjs"),
		);
		writeFileSync(
			join(fixture, ".env"),
			"ENABLE_CONTENT_SYNC=true\nCONTENT_REPO_URL=invalid-test-url\n",
		);
		mkdirSync(join(fixture, "src/content/posts"), { recursive: true });
		const sentinel = join(fixture, "src/content/posts/sentinel.md");
		writeFileSync(sentinel, "keep local content");
		const result = spawnSync(
			process.execPath,
			[join(fixture, "scripts/sync-content.mjs")],
			{
				env: { ...process.env, ENABLE_CONTENT_SYNC: "false" },
				encoding: "utf8",
			},
		);
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /Content separation is disabled/);
		assert.equal(readFileSync(sentinel, "utf8"), "keep local content");
	} finally {
		rmSync(fixture, { recursive: true, force: true });
	}
});
