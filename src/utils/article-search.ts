/** Literal, case-insensitive matches; offsets refer to the original DOM text. */
export function findTextMatches(text: string, query: string) {
	const keyword = query.trim();
	if (!keyword) return [];
	const pattern = new RegExp(
		keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
		"giu",
	);
	return Array.from(text.matchAll(pattern), (match) => ({
		start: match.index,
		end: match.index + match[0].length,
	}));
}
