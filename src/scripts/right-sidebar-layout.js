// 右侧边栏布局管理器
// 用于在网格模式下隐藏右侧边栏

/**
 * 初始化页面布局
 * @param {string} pageType - 页面类型（projects, skills等）
 */
function initPageLayout(pageType) {
	// 获取布局配置
	const defaultPostListLayout =
		localStorage.getItem("postListLayout") || "list";

	// 如果默认布局是网格模式，则隐藏右侧边栏
	if (defaultPostListLayout === "grid") {
		hideRightSidebar();
	}

	// 监听布局切换事件
	window.addEventListener("layoutChange", (event) => {
		const layout = event.detail.layout;
		if (layout === "grid") {
			hideRightSidebar();
		} else {
			showRightSidebar();
		}
	});

	// 监听页面导航事件
	document.addEventListener("astro:page-load", () => {
		setTimeout(() => {
			const currentLayout = localStorage.getItem("postListLayout") || "list";
			if (currentLayout === "grid") {
				hideRightSidebar();
			} else {
				showRightSidebar();
			}
		}, 100);
	});

	// 监听SWUP导航事件
	document.addEventListener("swup:contentReplaced", () => {
		setTimeout(() => {
			const currentLayout = localStorage.getItem("postListLayout") || "list";
			if (currentLayout === "grid") {
				hideRightSidebar();
			} else {
				showRightSidebar();
			}
		}, 100);
	});
}

/**
 * 隐藏右侧边栏
 */
function hideRightSidebar() {
	const rightSidebar = document.querySelector(".right-sidebar-container");
	if (rightSidebar) {
		// 添加隐藏类
		rightSidebar.classList.add("hidden-in-grid-mode");

		// 设置显示为none以完全隐藏
		rightSidebar.style.display = "none";

		// 调整主网格布局
		const mainGrid = document.getElementById("main-grid");
		if (mainGrid) {
			mainGrid.style.gridTemplateColumns = "17.5rem 1fr";
			mainGrid.setAttribute("data-layout-mode", "grid");
		}
	}
}

/**
 * 显示右侧边栏
 */
function showRightSidebar() {
	const rightSidebar = document.querySelector(".right-sidebar-container");
	if (rightSidebar) {
		// 移除隐藏类
		rightSidebar.classList.remove("hidden-in-grid-mode");

		// 恢复显示
		rightSidebar.style.display = "";

		// 恢复主网格布局
		const mainGrid = document.getElementById("main-grid");
		if (mainGrid) {
			mainGrid.style.gridTemplateColumns = "";
			mainGrid.setAttribute("data-layout-mode", "list");
		}
	}
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		// 从data-page-type属性获取页面类型
		const pageType =
			document.documentElement.getAttribute("data-page-type") || "projects";
		initPageLayout(pageType);
	});
} else {
	// 如果文档已经加载完成，直接初始化
	const pageType =
		document.documentElement.getAttribute("data-page-type") || "projects";
	initPageLayout(pageType);
}

// 导出函数供其他脚本使用
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		initPageLayout,
		hideRightSidebar,
		showRightSidebar,
	};
}
