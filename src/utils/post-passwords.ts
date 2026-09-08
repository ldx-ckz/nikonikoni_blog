import fs from "node:fs";
import path from "node:path";

type PostPasswordMap = Record<string, string>;

const localPasswordFile = path.join(process.cwd(), "post-passwords.local.json");

function normalizePostId(postId: string) {
	return postId
		.replace(/\\/g, "/")
		.replace(/\.md$/i, "")
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\p{Letter}\p{Number}/_-]/gu, "");
}

function parsePasswordMap(raw: string, source: string): PostPasswordMap {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		throw new Error(`${source} 不是有效的 JSON`, { cause: error });
	}

	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(`${source} 必须是“文章文件名: 密码”的 JSON 对象`);
	}

	const passwords: PostPasswordMap = {};
	for (const [postId, password] of Object.entries(parsed)) {
		if (typeof password !== "string" || password.trim() === "") {
			throw new Error(`${source} 中文章“${postId}”的密码不能为空`);
		}
		passwords[normalizePostId(postId)] = password;
	}
	return passwords;
}

function loadPostPasswords(): PostPasswordMap {
	const environmentPasswords = import.meta.env.POST_PASSWORDS_JSON
		? parsePasswordMap(
				import.meta.env.POST_PASSWORDS_JSON,
				"POST_PASSWORDS_JSON",
			)
		: {};
	const localPasswords = fs.existsSync(localPasswordFile)
		? parsePasswordMap(
				fs.readFileSync(localPasswordFile, "utf8"),
				"post-passwords.local.json",
			)
		: {};

	return { ...environmentPasswords, ...localPasswords };
}

const postPasswords = loadPostPasswords();

export function getPostPassword(postId: string): string | undefined {
	const normalizedId = normalizePostId(postId);
	const fileName = normalizedId.split("/").at(-1) || normalizedId;
	return postPasswords[normalizedId] || postPasswords[fileName];
}
