# 部署说明

## 固定环境

- Node.js：24 LTS 或更高版本
- pnpm：10.22.0（以 `package.json#packageManager` 为准）
- 构建命令：`pnpm build`
- 输出目录：`dist/`

## 本地验证

首次配置环境或依赖变化时安装依赖：

```bash
corepack enable
pnpm install --frozen-lockfile
```

站点代码、文章或页面数据变化后运行一次完整构建：

```bash
pnpm build
```

需要检查页面布局和交互时再运行 `pnpm preview`，检查受影响页面；涉及响应式时覆盖桌面和移动端。
纯 README、AGENTS 或其他非站点文档修改只检查差异、受影响链接及说明一致性，不要求构建。
同一版本已有有效验证结果时直接复用；代码、依赖或合并结果变化后重验受影响部分。

`pnpm check`、`pnpm type-check` 和全仓库 Biome 存在已记录的历史检查债务。
按改动需要运行这些诊断，区分本次引入的失败与既有失败，不要求每次提交清空全部历史问题。
失败和跳过的检查不能报告为通过。当前任务导致的回归需要修复；既有构建失败若阻碍验证，应说明证据与限制。

若不使用外部内容仓库，无需设置内容同步变量；默认就会使用仓库内内容。需要在 `.env` 中显式说明时可写：

```dotenv
ENABLE_CONTENT_SYNC=false
```

## 环境变量

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `ENABLE_CONTENT_SYNC` | 否 | 默认 `false`，使用仓库内内容；仅设为 `true` 时启用外部内容同步 |
| `CONTENT_REPO_URL` | 条件必需 | 启用内容同步时的 Git 仓库地址 |
| `CONTENT_DIR` | 否 | 外部内容本地目录，默认 `./content` |
| `UMAMI_API_KEY` | 否 | 构建首页统计时使用的 Umami API 密钥 |
| `GITHUB_TOKEN` / `GH_TOKEN` | 否 | 提高 GitHub 活动数据请求额度 |
| `POST_PASSWORDS_JSON` | 条件必需 | 构建加密文章时提供密码映射 |
| `BCRYPT_SALT_ROUNDS` | 否 | 文章密码哈希轮数，默认 12 |

密钥只放在本地 `.env` 或托管平台的 Secret/Environment Variables 中。不要把真实值提交到仓库。

## Vercel

仓库根目录的 `vercel.json` 已声明 Astro、构建命令、输出目录和响应头。连接仓库后只需配置环境变量；生产域名应与 `src/config.ts` 中的 `siteURL` 一致。

## GitHub Actions

- `build.yml`：在 `master` 推送和 Pull Request 上运行 Astro 检查与构建。Astro 检查为非阻断诊断；构建执行 `pnpm astro build`，不包含完整 `pnpm build` 的搜索索引和字体压缩步骤。
- `biome.yml`：以非阻断诊断方式检查 `src/` 的代码格式和质量。
- `deploy.yml`：在推送到 `master` 或手动触发时运行完整构建，把 `dist/` 发布到 `pages` 分支。

当前 `deploy.yml` 包含自动推送触发器，并非仅手动备用。连接 Vercel 等托管服务后，也可能由托管端触发部署；实际连接和生产分支以平台配置为准。需要改为手动部署或调整生产入口时，作为独立部署配置变更处理。

## 提交、上传与上线验证

日常使用直接 `master` 工作流，具体授权与分支处理见 [AGENTS.md](../AGENTS.md)。仅要求提交时创建本地提交；要求上传或推送时发布指定改动，确认目标提交已到达远端。

提交前只暂存授权范围内的内容，检查暂存差异，避免包含 `.env`、本地密码文件或临时构建产物。推送 `master` 会触发现有自动化；自动检查成功、推送成功和生产站点已经更新是不同状态。

当任务包含上线验收时，再核对部署记录与目标版本，并访问正式地址验证本次受影响的路径。域名或站点地址变化时检查 `siteURL`、订阅源、sitemap 和 robots.txt；首页、搜索、导航等只在受本次改动影响时纳入验收。
