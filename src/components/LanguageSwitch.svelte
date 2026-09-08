<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type UiLanguage = "zh" | "en";
let language: UiLanguage = "zh";

function updateDocumentTitle(nextLanguage: UiLanguage) {
	const titleSource =
		document.querySelector<HTMLElement>(
			"#swup-container[data-ui-title-zh][data-ui-title-en]",
		) ||
		document.querySelector<HTMLTitleElement>(
			"title[data-ui-title-zh][data-ui-title-en]",
		);
	if (!titleSource) return;
	const nextTitle =
		nextLanguage === "en"
			? titleSource.dataset.uiTitleEn
			: titleSource.dataset.uiTitleZh;
	if (nextTitle && document.title !== nextTitle) {
		document.title = nextTitle;
	}
}

function updateLocalizedAttributes(nextLanguage: UiLanguage) {
	document
		.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
			"[data-ui-placeholder-zh][data-ui-placeholder-en]",
		)
		.forEach((element) => {
			element.placeholder =
				nextLanguage === "en"
					? element.dataset.uiPlaceholderEn || ""
					: element.dataset.uiPlaceholderZh || "";
		});

	document
		.querySelectorAll<HTMLElement>("[data-ui-tooltip-zh][data-ui-tooltip-en]")
		.forEach((element) => {
			element.title =
				nextLanguage === "en"
					? element.dataset.uiTooltipEn || ""
					: element.dataset.uiTooltipZh || "";
		});
}

function applyLanguage(nextLanguage: UiLanguage) {
	language = nextLanguage;
	document.documentElement.dataset.uiLang = nextLanguage;
	document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
	localStorage.setItem("uiLanguage", nextLanguage);
	updateDocumentTitle(nextLanguage);
	updateLocalizedAttributes(nextLanguage);
}

function toggleLanguage() {
	applyLanguage(language === "zh" ? "en" : "zh");
}

onMount(() => {
	const savedLanguage = localStorage.getItem("uiLanguage");
	applyLanguage(savedLanguage === "en" ? "en" : "zh");
	const languageWindow = window as typeof window & {
		applyUiLanguage?: () => void;
	};
	languageWindow.applyUiLanguage = () => applyLanguage(language);

	return () => {
		delete languageWindow.applyUiLanguage;
	};
});
</script>

<button
	aria-label={language === "zh" ? "Switch interface to English" : "将界面切换为中文"}
	title={language === "zh" ? "English" : "中文"}
	class="btn-plain scale-animation rounded-lg h-11 px-3 active:scale-90"
	onclick={toggleLanguage}
>
	<Icon icon="material-symbols:translate-rounded" class="text-[1.25rem]" />
	<span class="ml-1 text-sm font-semibold">{language === "zh" ? "EN" : "中文"}</span>
</button>
