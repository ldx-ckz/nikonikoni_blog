# nikonikoni blog

我的个人博客，用来记录技术学习、项目实践与日常随笔。

[访问博客](https://miku.nikonikoni.blog/) · [English](./README.en.md) · [问题反馈](https://github.com/ldx-ckz/NiKoNiKoNi_blog/issues)

![nikonikoni blog 首页](./docs/images/nikonikoni-home.png)

![nikonikoni blog 首页内容区](./docs/images/nikonikoni-home-content.png)

> [!NOTE]
> 这是个人网站源码，而不是通用博客模板。仓库会随着我的学习、写作和站点需求持续演进。

## 这个仓库是什么

`nikonikoni blog` 是一个基于 [Astro](https://astro.build/) 的静态个人网站。它同时承担两种用途：

- 发布技术文章、课程笔记和生活记录；
- 展示项目内容。

## 主要改造

这个项目最初从 Mizuki 演化而来，目前包含一系列面向个人使用的改造：

- 首页仪表盘与文章活动视图；
- Notes、Technical、Daily Life 内容分区；
- 自定义文章卡片、分类、标签、归档与站点地图；
- 项目、设备、相册、日记和追番等结构化页面；
- Pagefind 搜索、RSS/Atom、评论、访问统计与文章加密；
- 可选的代码—内容仓库分离工作流。

## 技术栈

- [Astro](https://astro.build/) + TypeScript
- Svelte + Tailwind CSS
- Pagefind
- Expressive Code、KaTeX、Mermaid
- pnpm

## 本地开发

要求：Node.js 24 LTS 或更高版本、pnpm 10。

```bash
corepack enable
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://localhost:4321`。

常用命令：

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm check` | 运行 Astro 检查 |
| `pnpm type-check` | 运行 TypeScript 检查 |
| `pnpm build` | 构建站点并生成搜索索引 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm new-post -- <name>` | 创建文章 |

## 项目结构

```text
src/components/   页面与交互组件
src/content/      文章和介绍内容
src/data/         项目、设备、相册等结构化数据
src/pages/        Astro 页面与路由
public/           图片、字体、音乐和其他静态资源
scripts/          内容同步、文章创建和字体压缩脚本
docs/             架构、部署与维护文档
```

站点基础信息和功能开关位于 [`src/config.ts`](./src/config.ts)。文章保存在 `src/content/posts/`，结构化页面数据保存在 `src/data/`。

## 部署

生产站点部署在 <https://miku.nikonikoni.blog/>。构建命令为 `pnpm build`，输出目录为 `dist/`。

部署前需要：

1. 默认使用本仓库内容，无需设置同步变量；只有需要外部内容仓库时才配置地址并设置 `ENABLE_CONTENT_SYNC=true`；
2. 在托管平台中配置所需密钥，不要提交 `.env`；
3. 确认 `src/config.ts` 中的 `siteURL` 与正式域名一致。

详细说明见 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。

## 来源与致谢

本项目最初基于 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki) 构建，之后针对个人内容组织、首页体验、站点功能和维护流程进行了持续修改。Mizuki 又基于 [Fuwari](https://github.com/saicaca/fuwari) 演化而来。

完整的第三方来源和许可证信息见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

## 许可证

- 网站代码遵循 [`LICENSE`](./LICENSE) 中的 Apache License 2.0，并保留上游 MIT 许可证 [`LICENSE.MIT`](./LICENSE.MIT)；
- 原创文章默认采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)，文章另有声明时以文章声明为准；
- 图片、字体、音乐和其他第三方素材分别遵循其权利人的许可，不因代码许可证而自动获得再授权。

## 维护记录

仓库从 Mizuki 身份迁移为 nikonikoni 个人项目的过程与验证记录见 [`docs/REPOSITORY_IDENTITY_MIGRATION.md`](./docs/REPOSITORY_IDENTITY_MIGRATION.md)。
