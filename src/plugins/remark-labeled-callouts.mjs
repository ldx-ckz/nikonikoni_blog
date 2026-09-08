const calloutLabels = new Map([
	["提示", "note"],
	["说明", "note"],
	["信息", "note"],
	["建议", "tip"],
	["最佳实践", "tip"],
	["实践建议", "tip"],
	["重要", "important"],
	["警告", "warning"],
	["注意", "caution"],
	["危险", "caution"],
	["TIP", "note"],
	["NOTE", "note"],
	["BEST PRACTICE", "tip"],
	["IMPORTANT", "important"],
	["WARNING", "warning"],
	["CAUTION", "caution"],
]);

function getCalloutLabel(node) {
	if (node?.type !== "paragraph" || node.children?.length !== 1) return null;

	const strong = node.children[0];
	if (strong?.type !== "strong" || strong.children?.length !== 1) return null;

	const text = strong.children[0];
	if (text?.type !== "text") return null;

	const label = text.value.trim();
	const type =
		calloutLabels.get(label) || calloutLabels.get(label.toUpperCase());
	return type ? { label, type } : null;
}

function transformChildren(parent) {
	if (!Array.isArray(parent?.children)) return;

	for (let index = 0; index < parent.children.length; index += 1) {
		const callout = getCalloutLabel(parent.children[index]);
		const content = parent.children[index + 1];

		if (callout && content && content.type !== "heading") {
			parent.children.splice(index, 2, {
				type: "containerDirective",
				name: callout.type,
				children: [
					{
						type: "paragraph",
						data: { directiveLabel: true },
						children: [{ type: "text", value: callout.label }],
					},
					content,
				],
			});
		}

		transformChildren(parent.children[index]);
	}
}

export function remarkLabeledCallouts() {
	return (tree) => transformChildren(tree);
}
