# 原型合集 · 文档站

本站由 [Docsify](https://docsify.js.org/) 生成，对应**仓库根目录**下的 [《UI 原型收集》](../README.md)（`README.md`）。此处用于总览、导航与各原型的静态发布副本。

---

## 本仓库收录的原型

| 项目 | 说明 | 打开原型 | 项目文档 |
|------|------|----------|----------|
| **赛务通** | 体育赛事现场运营 | [交互页面](saiwu/index.html)（侧栏「赛务通 · 原型」亦可） | [README](saiwu/README.md) |

后续新增子项目时，请在本表与 **`_sidebar.md`** 同步更新。

---

## 快速启动

在 **`ui`（仓库根目录）** 执行：

```bash
npx docsify-cli serve docs
```

浏览器打开终端提示的地址（多为 `http://localhost:3000`）：

- **侧栏「合集说明」**：返回本文档首页（当前页）。
- **侧栏「赛务通」**：进入该子项目的说明 Markdown 或直接打开 `.html` 原型。

直接访问原型示例：`http://localhost:3000/saiwu/index.html`

---

## `docs/<子项目>/` 与根目录的关系

各子项目在仓库根目录另有 **`saiwu/`、`…/`** 作为**主维护副本**。`docs/saiwu/` 等为便于与 Docsify **同根静态托管**的镜像；修改源码后请同步到 `docs/` 下对应目录，或使用脚本自动化。

---

## 部署到线上

将 **`docs`** 文件夹的**全部内容**上传到静态托管（GitHub Pages、Nginx、对象存储等）：

- 默认首页为 Docsify 的 `index.html`；
- 子目录如 `saiwu/` 中的 `*.html`、`css/`、`js/` 需一并上传，路径保持不变。

已包含 **`.nojekyll`**，便于 GitHub Pages 正确处理静态资源。
