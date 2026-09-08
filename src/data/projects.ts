// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string; // 添加前往项目链接字段
}

export const projectsData: Project[] = [
	{
		id: "copy-as-markdown",
		title: "Copy as Markdown",
		description: "一个可以将网页中的文本复制为markdown格式的Edge插件",
		image: "",
		category: "web",
		techStack: ["JavaScript", "HTML"],
		status: "completed",
		sourceCode: "https://github.com/ldx-ckz/copy-as-markdown", // 更改为GitHub链接
		startDate: "2025-11-29",
		endDate: "2025-11-30",
		tags: ["Extensions Documentation", "Open Source"],
	},
	{
		id: "nikonikoni-blog",
		title: "nikonikoni_blog",
		description:
			"基于 Astro 构建的个人博客，用于记录学习笔记、技术实践与日常生活。",
		image: "",
		category: "web",
		techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
		status: "in-progress",
		sourceCode: "https://github.com/ldx-ckz/NiKoNiKoNi_blog",
		startDate: "2025-11-22",
		visitUrl: "https://miku.nikonikoni.blog",
		featured: true,
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
