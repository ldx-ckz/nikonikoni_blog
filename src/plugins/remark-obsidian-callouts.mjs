import { visit } from "unist-util-visit";

const calloutMarker = /^\s*\[!(note|tip|important|warning|caution)\]\s*$/i;

export function remarkObsidianCallouts() {
	return (tree) => {
		visit(tree, "blockquote", (node, index, parent) => {
			const [firstChild, ...remainingChildren] = node.children;
			const [marker, ...remainingParagraphChildren] =
				firstChild?.children || [];
			if (firstChild?.type !== "paragraph" || marker?.type !== "text") return;

			const [declaration, ...remainingText] = marker.value.split("\n");
			const match = declaration.match(calloutMarker);
			if (!match || index === undefined || !parent) return;

			const paragraphChildren = [
				...(remainingText.length > 0
					? [{ type: "text", value: remainingText.join("\n") }]
					: []),
				...remainingParagraphChildren,
			];
			const children = [
				...(paragraphChildren.length > 0
					? [{ type: "paragraph", children: paragraphChildren }]
					: []),
				...remainingChildren,
			];

			parent.children[index] = {
				type: "containerDirective",
				name: match[1].toLowerCase(),
				children,
			};
		});
	};
}
