# 架构说明

## 定位

nikonikoni blog 是个人网站，而不是可直接发布的通用主题。代码、个人内容和静态资源目前位于同一仓库；内容同步功能是可选能力。

## 请求与构建流程

```text
src/config.ts
      │
      ├── 页面和组件配置
      │
src/content/ + src/data/ + public/
      │
      ▼
 Astro 构建（src/pages/）
      │
      ├── RSS / Atom / sitemap / robots.txt
      ├── 静态 HTML、CSS、JS
      ▼
 Pagefind 搜索索引
      │
      ▼
 dist/
```

## 目录职责

- `src/config.ts`：站点身份、导航、功能开关和第三方服务配置。
- `src/pages/`：路由入口，不用于存放大段个人数据。
- `src/components/`：页面和交互组件。
- `src/content/posts/`：Markdown 文章。
- `src/content/spec/`：关于页、友链等 Markdown 内容。
- `src/data/`：项目、设备、日记等结构化个人数据。
- `public/`：无需 Astro 转换的公开资源。
- `scripts/`：内容同步、文章创建和字体处理工具。

## 首页与内容分区

首页由 `HomeDashboard.astro` 汇总内容统计、文章活动和专栏入口。`/blog/[section]/` 根据文章 `section` 字段提供 Notes、Technical、Daily Life 分区；分类、标签、归档和站点地图提供横向浏览入口。

## 系列专栏与章节导航

`/series/` 展示非空专栏，`/series/[id]/` 展示介绍、适合人群、前置知识和章节列表。
专栏定义位于 `src/data/series.ts`，首页展示定义顺序中的前两个非空专栏，其余通过“查看全部”进入。
添加专栏时在该文件中提供唯一的英文小写连字符 `id`、标题、介绍、适合人群和前置知识；不要把模板内容当成个人经历。

文章 frontmatter 示例：

```yaml
section: notes
category: [MIT Missing Semester, Tutorial]
tags: [Shell]
series: mit-missing-semester-2026
seriesOrder: 1
```

- `series` 必须匹配专栏定义的 `id`；`seriesOrder` 为专栏内唯一的正整数，越小越靠前。两项一起填写或一起省略。
- 顺序号可以不连续（例如原课程第 1、2、5 课），列表中的“第几篇”是已发布文章的位置，不代表原课程课号。
- 分类、标签、分区和专栏互相独立。改变分类或发布日期不会改变专栏阅读顺序。
- 草稿不进入专栏。加密文章仅展示原本公开的标题和描述，并标注需密码；点击仍进入原密码页面。
- 专栏文章使用同专栏上一章、下一章，首尾不循环；没有专栏的文章保留全站前后篇导航。
- 专栏页和导航复用现有文章 URL，不移动文章或修改固定链接。新增章节只需添加文章及上述字段，无需修改路由代码。
- `src/utils/series-utils.ts` 统一处理排序与导航；未知专栏、缺少顺序或重复顺序会使构建失败并提示对应文章。
- 界面标签支持中英文切换，专栏标题与介绍等编辑内容保持 `src/data/series.ts` 中的原文。

## 配置边界

对站点名称、导航、功能开关和服务地址的修改应优先进入 `src/config.ts`。页面数据进入 `src/data/`，文章进入 `src/content/`。只有显示或交互行为发生变化时才修改组件。

## 上游关系

项目最初基于 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki)。上游链接只保留在 README、页脚、架构/迁移记录和许可证/第三方声明中。内部兼容标识不因品牌迁移而强制改名，除非有独立的重构和回归测试任务。
