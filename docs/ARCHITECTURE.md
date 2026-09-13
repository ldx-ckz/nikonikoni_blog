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

首页由 `HomeDashboard.astro` 汇总内容统计和文章活动。`/blog/[section]/` 根据文章分类提供 Notes、Technical、Daily Life 分区；分类、标签、归档和站点地图提供横向浏览入口。

## 文章内搜索

每篇文章左侧固定的搜索图标由 `src/components/ArticleSearch.astro` 提供（手机端位于左下角），只搜索当前已渲染正文，不搜索目录、评论或其他文章。输入关键词后高亮匹配内容，使用上一处／下一处（Enter 下一处，Shift+Enter 上一处）定位，Escape 关闭并清除高亮。加密文章解锁后才能搜索；搜索在本地浏览器完成，不发送关键词，也不修改 Markdown 文件。数学公式的辅助渲染内容不参与文本搜索。

`src/components/ArticleReadingTools.astro` 将阅读工具置于浏览器顶层，避免页面切换动画影响固定定位。桌面端搜索图标的顶部取视口中线与文章标题顶部的较低位置，确保不高于标题、不会提前浮在横幅上；向下阅读时固定在视口中部。桌面端在正文右边缘提供可拖动、支持方向键/PageUp/PageDown/Home/End 的滚动条，与页面滚动同步，不创建独立滚动容器，因此目录和搜索定位沿用原有逻辑。手机端保留原生页面滚动。

## 配置边界

对站点名称、导航、功能开关和服务地址的修改应优先进入 `src/config.ts`。页面数据进入 `src/data/`，文章进入 `src/content/`。只有显示或交互行为发生变化时才修改组件。

## 上游关系

项目最初基于 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki)。上游链接只保留在 README、页脚、架构/迁移记录和许可证/第三方声明中。内部兼容标识不因品牌迁移而强制改名，除非有独立的重构和回归测试任务。
