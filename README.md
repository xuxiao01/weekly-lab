<p align="center">
  <img src="https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260603103934962.jpg" alt="项目预览图" width="800" />
</p>

<h1 align="center">Weekly Lab</h1>
<p align="center">
  个人周报展示与发布：类 PPT 翻页浏览，Markdown 导入，登录后在工作台发布。
</p>

## 项目简介

Weekly Lab（仓库名 `weekly-showcase`）是一个基于 Vue 3 的前端单页应用，用于把周报内容以演示文稿的方式展示，并在工作台通过 Markdown 发布新周报。

展示页每一页对应一个业务模块（如「小程序开发」「小墨作文小游戏开发」），支持多周次切换与 GSAP 翻页动效。未登录访客浏览内置静态演示数据；登录用户可在工作台发布周报，数据保存在浏览器 `localStorage`，开发环境下还可同步写入 `src/data/` 源码。认证已对接 **xuxiao-api**（登录 / 注册）；周报后端 CRUD 接口文档见 [`docs/api/api.md`](docs/api/api.md)，前端持久化仍以本地存储为主。

适合个人周报归档、组内周会演示等场景。

## 功能特性

### 展示页（`/`）

- 全屏单页展示，类 PPT / Keynote 翻页体验
- GSAP 页面切换动效，支持 `prefers-reduced-motion`
- 多周次管理：顶部周次选择器切换历史周报
- 支持 URL 查询参数 `?week=` 定位到指定周次
- 列表项支持 Markdown 图片，点击可全屏预览
- 条目标题支持行内 Markdown 超链接 `[文字](url)`
- 顶部 Header：未登录显示「登录」，已登录显示「工作台」

### 工作台（`/workbench`）

- Markdown 发布工具入口
- 发布页（`/workbench/publish`）：粘贴或上传 `.md` 文件，配置年份、周数、日期范围后发布
- 发布成功后跳转展示页并定位到新周次

### 认证（`/login`）

- 登录 / 注册表单（Naive UI），同一页面切换
- 对接 xuxiao-api，Token 存储在 `localStorage`（`xuxiao_token`）
- 开发环境通过 Vite 代理 `/api` → `http://localhost:3000`

### 数据与解析

- Markdown 按 `# 一级标题` 自动分页，解析「本周完成」「未来展望」列表
- 支持标题写法 `第一部分｜模块名`，或仅写模块名（自动补全部分序号）
- 数据持久化：`localStorage` 保存多周周报；`sessionStorage` 保存粘贴草稿
- 内置静态演示数据：`src/data/reports/`（第 23、24、26、27 周）
- 开发模式：发布时通过 Vite 中间件回写 `weeklyReports.ts` 与 `reports/*.ts` 源码

### 响应式

- 窄屏下工具栏、周次选择与发布页布局适配移动端

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- TypeScript
- Vite 8
- Vue Router 5
- GSAP 3
- Naive UI（认证表单）
- Axios（HTTP 请求封装）
- 普通 CSS（展示页、工作台、认证页分模块样式）

## 目录结构

```text
weekly-showcase/
├── .github/workflows/       # GitHub Actions 部署
├── docs/
│   ├── api/                 # xuxiao-api 接口文档
│   ├── backend-pending/     # 后端待办与第二期规划
│   └── engineering-notes/   # 工程复盘笔记
├── public/
├── src/
│   ├── assets/              # 图片、SVG 图标
│   ├── components/          # 展示、认证、工作台、布局组件
│   ├── composables/         # 翻页动效、周报导入、媒体查询等
│   ├── data/
│   │   ├── reports/         # 各周静态周报（如 2026-W27.ts）
│   │   └── weeklyReports.ts # 默认周报聚合入口
│   ├── router/
│   ├── services/            # 认证相关 API
│   ├── styles/              # auth.css、workbench.css
│   ├── types/
│   ├── utils/               # Markdown 解析、HTTP、本地存储
│   ├── views/               # ShowcaseView、AuthView、WorkbenchView 等
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── .env.example
├── index.html
├── package.json
├── vite.config.ts           # base、代理、开发环境数据回写插件
└── README.md
```

## 本地运行

项目使用 **npm** 作为包管理器（存在 `package-lock.json`）。

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产包：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

### 与后端联调

认证接口依赖 **xuxiao-api** 在本地 `3000` 端口运行。开发环境下前端请求 `/api/*` 会由 Vite 代理到 `http://localhost:3000`，一般无需配置 `VITE_API_BASE_URL`。

生产构建 `base` 为 `/weekly/`，部署到子路径时需与 `vite.config.ts` 保持一致。

## Markdown 格式说明

每个 `# 一级标题` 对应展示页中的一页，常用结构如下：

```md
# 第一部分｜小程序开发

2026 年第 23 周 · 06.01 - 06.05

## 本周完成
- 优化了识字量小程序的主包大小
- 首页分享功能已上线

## 未来展望
- 给小程序做分包

# 游戏试玩平台开发

## 本周完成
- 条目一

## 未来展望
- 计划一
```

说明：

- `## 本周完成`、`## 未来展望`（兼容 `下周计划`）下的 `-`、`*` 或数字列表会被解析为条目
- 标题可写 `第一部分｜模块名`，也可只写模块名并由解析器自动补「第一部分」「第二部分」等
- 列表项后可直接跟 Markdown 图片：`![说明](图片地址)`
- 条目标题内可写超链接：`[链接文字](https://example.com)`
- 页面内可写日期行，如 `2026 年第 23 周 · 06.01 - 06.05`（可选）

在工作台发布页填写年份、周数与日期后点击 **确认导入**，即可更新对应周次内容。

## 环境变量

复制 `.env.example` 为 `.env` 后按需配置：

| 变量名 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 后端 API 基础地址。开发环境留空，走 Vite `/api` 代理；**生产环境构建时必填**（写入 `.env` 或由 CI 注入），例如 `https://api.example.com` |

开发环境未设置时使用相对路径 `/api`，由 Vite 代理到本地后端。生产环境未设置时，应用不会发起 API 请求（控制台会输出配置提示）。

本地生产构建示例：

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

## 部署说明

### 构建产物

```bash
npm run build
```

构建结果输出到 `dist/` 目录。

### GitHub Actions

仓库已配置 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：推送到 `main` 分支后自动执行 `npm install`、`npm run build`，并通过 SCP 将 `dist/` 部署到服务器。

需在 GitHub Secrets 中配置：

| Secret | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 生产 API 基础地址（构建时注入，例如 `http://your-api-host`） |
| `SERVER_HOST` | 服务器地址 |
| `SERVER_USER` | SSH 用户名 |
| `SERVER_SSH_KEY` | SSH 私钥 |
| `SERVER_PORT` | SSH 端口 |

具体部署路径以工作流文件为准。

### 静态资源托管

也可将 `dist/` 部署到任意静态服务器（Nginx、对象存储等）。注意 `vite.config.ts` 中 `base: '/weekly/'`，若部署在站点根路径需相应调整。

## 后续计划

- 周报数据全面接入 xuxiao-api 后端 CRUD（当前以 localStorage + 静态数据为主，见 [`docs/backend-pending/`](docs/backend-pending/pending-updates.md)）
- 工作台路由登录守卫
- 公开分享 URL 与复制链接
- 导出当前周次为 `.md` 文件
- 补充单元测试（Markdown 解析器、存储逻辑）

## License

待补充
