import type { SeriesDefinition } from "../data/series";

type SeriesPost = {
	id: string;
	data: {
		title: string;
		draft?: boolean;
		series?: string;
		seriesOrder?: number;
	};
};

/** 专栏只收录已发布文章；不依赖分类、文件名、发布日期或置顶顺序。 */
export function collectSeries<T extends SeriesPost>(
	posts: T[],
	definitions: SeriesDefinition[],
) {
	const groups = definitions.map((definition) => ({
		...definition,
		posts: [] as T[],
	}));
	for (const post of posts) {
		if (post.data.draft) continue;
		const { series, seriesOrder } = post.data;
		if (!series && seriesOrder === undefined) continue;
		const group = groups.find((item) => item.id === series);
		if (!group || !Number.isInteger(seriesOrder) || (seriesOrder ?? 0) <= 0) {
			throw new Error(
				`文章「${post.data.title}」的 series 必须对应 src/data/series.ts，且需填写正整数 seriesOrder。`,
			);
		}
		if (group.posts.some((item) => item.data.seriesOrder === seriesOrder)) {
			throw new Error(
				`专栏「${group.title}」存在重复的 seriesOrder: ${seriesOrder}。`,
			);
		}
		group.posts.push(post);
	}
	for (const group of groups) {
		group.posts.sort(
			(a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0),
		);
	}
	return groups.filter((group) => group.posts.length > 0);
}

export function getSeriesChapter<T extends SeriesPost>(
	groups: ReturnType<typeof collectSeries<T>>,
	postId: string,
) {
	const series = groups.find((group) =>
		group.posts.some((post) => post.id === postId),
	);
	if (!series) return undefined;
	const index = series.posts.findIndex((post) => post.id === postId);
	return {
		series,
		index,
		previous: series.posts[index - 1],
		next: series.posts[index + 1],
	};
}
