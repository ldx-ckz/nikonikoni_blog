import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		cardImagePosition: z.string().optional().default("center"),
		tags: z.array(z.string()).optional().default([]),
		category: z
			.union([z.string(), z.array(z.string()), z.null()])
			.optional()
			.transform((value) => {
				const categories = Array.isArray(value) ? value : value ? [value] : [];
				return categories.map((category) => category.trim()).filter(Boolean);
			}),
		section: z
			.enum(["notes", "technical", "daily-life"])
			.optional()
			.default("technical"),
		lang: z.string().optional().default(""),
		pinned: z.boolean().optional().default(false),
		author: z.string().optional().default(""),
		sourceLink: z.string().optional().default(""),
		licenseName: z.string().optional().default(""),
		licenseUrl: z.string().optional().default(""),

		/* Page encryption field (passwords live in post-passwords.local.json) */
		passwordRequired: z.boolean().optional().default(false),

		/* Custom permalink */
		permalink: z.string().optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/spec" }),
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
