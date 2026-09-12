export interface SeriesDefinition {
	id: string;
	title: string;
	description: string;
	audience: string;
	prerequisites: string;
}

// 顺序同时决定专栏总览和首页入口的展示顺序。正文介绍保留作者编辑的语言。
export const seriesDefinitions: SeriesDefinition[] = [
	{
		id: "learncpp",
		title: "LearnCpp",
		description:
			"按课程章节整理的 C++ 学习笔记，涵盖作用域、控制流、类型转换、模板、指针与类等主题。这里收录已发布的笔记，不代表完整课程。",
		audience: "正在学习 C++、希望按章节复习语言基础的读者。",
		prerequisites:
			"了解变量、基本数据类型与函数，能够编译和运行简单的 C++ 程序。",
	},
	{
		id: "mit-missing-semester-2026",
		title: "MIT Missing Semester 2026",
		description:
			"围绕 Shell、命令行环境与 Git 整理的课程笔记，按原课程顺序串联已发布文章。",
		audience: "希望熟悉命令行工具、改善日常开发流程的读者。",
		prerequisites: "具备基本的计算机操作经验，并准备可使用 Shell 的终端环境。",
	},
];
