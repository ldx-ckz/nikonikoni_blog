# 内容仓库同步

默认情况下，文章和页面数据直接保存在本仓库，`ENABLE_CONTENT_SYNC` 未设置时也会使用本地内容。只有需要独立权限、独立版本历史或私有内容源时，才启用外部内容仓库。

## 本地内容模式

无需设置环境变量。也可以在 `.env` 中明确写入：

```dotenv
ENABLE_CONTENT_SYNC=false
```

此时直接维护：

```text
src/content/posts/
src/content/spec/
src/data/
public/images/
```

正常执行 `pnpm dev`、`pnpm check` 或 `pnpm build` 不会同步、替换或链接外部内容。

已设置的进程环境变量优先于 `.env`。验证命令显式设置 `ENABLE_CONTENT_SYNC=false` 时，即使 `.env` 中启用了同步，也会保留本地内容。

## 外部内容模式

外部仓库使用以下结构：

```text
nikonikoni-content/
├── posts/
├── spec/
├── data/
└── images/
```

配置：

```dotenv
ENABLE_CONTENT_SYNC=true
CONTENT_REPO_URL=https://github.com/ldx-ckz/nikonikoni-content.git
CONTENT_DIR=./content
```

然后执行：

```bash
pnpm sync-content
```

也可以运行 `pnpm init-content` 交互式写入配置。

## 安全边界

- 外部同步只会在 `ENABLE_CONTENT_SYNC=true` 时运行。`sync-content.js` 会更新外部仓库并替换对应的运行时内容目录；执行前先提交或备份本地内容。
- 私有仓库凭据应由 SSH Agent 或托管平台 Secret 提供，不要把 Token 写入仓库 URL。
- 部署平台必须能够访问内容仓库，否则应使用本地内容模式。
- 内容仓库更新不会天然触发代码仓库构建；需要在托管平台配置构建 Hook，或从内容仓库发送 `repository_dispatch`。
