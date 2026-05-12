# 赛务通 · 文档中心

本目录使用 [Docsify](https://docsify.js.org/) 生成说明站点，并与 **静态 HTML 原型** 放在同一可发布根目录，便于一次启动同时浏览文档与点击打开原型页面。

## 快速启动

在 **`ui` 仓库根目录** 下执行（需已安装 Node.js）：

```bash
npx docsify-cli serve docs
```

浏览器默认打开 `http://localhost:3000`：

- **侧边栏「文档首页」**：当前页（本说明）。
- **侧边栏「交互原型」**：在新文档规则下以**忽略路由**方式打开 `saiwu/index.html`，进入多页 App 原型。
- 也可直接在地址栏访问：`http://localhost:3000/saiwu/index.html`

## 目录说明

| 路径 | 作用 |
|------|------|
| `docs/index.html` | Docsify 入口 |
| `docs/README.md` | 文档首页（本文件） |
| `docs/_sidebar.md` | 侧栏导航 |
| `docs/saiwu/` | 与仓库 `saiwu/` 对齐的原型静态文件（见下文维护说明） |

## 与源码目录 `saiwu/` 的关系

原型源文件默认仍在上一级 **`saiwu/`**。为让 Docsify 静态服务能访问到原型，已将一份副本置于 **`docs/saiwu/`**。

若你只在 `saiwu/` 下改代码，请同步到 `docs/saiwu/`（例如手动复制或使用脚本），或改为「以 `docs/` 为唯一发布根」并调整你的目录习惯。

## 部署到线上

将整个 **`docs`** 文件夹内容部署到静态托管（GitHub Pages、Nginx、OSS 等），确保：

- 入口为 `index.html`（Docsify）；
- `saiwu/` 下所有 `.html`、`css/`、`js/` 一并上传，相对路径不变。

GitHub Pages 若遇到 404，可在 `docs` 根目录保留空文件 `.nojekyll`（本仓库已含）。
