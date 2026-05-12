# UI 原型收集（开源）

本仓库用于**集中归档**可运行、可演示的 **HTML / CSS / JavaScript** 界面原型与小型产品稿，便于学习、复用与对内展示。每个子目录通常对应**一个独立主题或场景**，彼此无运行时依赖。

---

## 收录一览

| 项目 | 场景简述 | 源码目录 | 在线说明 |
|------|----------|----------|----------|
| **赛务通** | 体育赛事现场运营（赛程、检录、播报、设置等） | [`saiwu/`](saiwu/) | [`saiwu/README.md`](saiwu/README.md) |
| **医路伴行** | 医疗场景：患者端 + 科室端、适老化、AI 演示、就诊流程 | [`yiliao/`](yiliao/) | [`yiliao/README.md`](yiliao/README.md) |

> 欢迎通过 Issue / PR **投稿新原型**：见下文「如何新增子项目」。

---

## 仓库结构

```
ui/                          # 本仓库根目录
├── README.md               # 本文件 · 合集总览
├── docs/                   # Docsify 文档站（可与各原型一并部署）
│   ├── index.html
│   ├── README.md           # 站点首页（合集视角）
│   ├── _sidebar.md         # 侧栏 · 按子项目分组
│   ├── .nojekyll           # GitHub Pages 等场景可选
│   └── <子项目>/           # 各原型的**静态副本**（便于与 Docsify 同根发布）
├── saiwu/                  # 赛务通 · 主副本（建议在此维护源码）
├── yiliao/                 # 医路伴行 · 医疗场景原型
└── …                       # 未来更多子项目目录
```

**说明：** `docs/<子项目>/` 往往与根下 `<子项目>/` **内容同构**，用于 `docsify serve` 或 Pages 时同一站点内既能读文档又能打开 `*.html` 原型。若你只在根目录 `saiwu/` 开发，发布前请将变更同步到 `docs/saiwu/`（或将来用脚本自动化）。

---

## 快速开始

### 只预览某一个原型

进入对应目录，用任意静态服务器打开（避免部分浏览器对 `file://` 的限制）：

```bash
cd saiwu
npx --yes serve .
```

浏览器打开终端提示的地址，默认进入 `index.html`。

### 文档站 + 多原型导航（Docsify）

在**仓库根** `ui/` 下执行：

```bash
npx docsify-cli serve docs
```

浏览器访问终端输出的地址（多为 `http://localhost:3000`），在侧栏按子项目进入**说明**或**交互原型**（HTML）。

---

## 如何新增子项目

1. 在仓库根目录新建文件夹，命名简短、小写或中划线，例如 `booking-kiosk/`。
2. 在子目录内提供 **`README.md`**：项目名、截图（可选）、技术栈、如何本地运行、许可证等。
3. 将静态文件同步一份到 **`docs/<子项目>/`**（与现有 `docs/saiwu/` 方式一致），保证相对路径中的 `css/`、`js/` 仍可访问。
4. 编辑 **`docs/_sidebar.md`**：增加该子项目分组与链接（原型 HTML 链接需加 `':ignore'`，避免被 Docsify 劫持路由）。
5. 在本文件 **「收录一览」** 表格中追加一行。

子项目之间**不要互相引用路径**；共用资源请放在该子项目目录内部，或单独抽成 `packages/`（若未来需要再约定）。

---

## 技术共性（非强制）

当前收录以 **无构建、标准 Web** 为主，便于 fork 即用。子项目可自行选用框架，但请在各自 README 中写清安装与构建命令。

---

## 许可证

若根目录未放置 `LICENSE` 文件，默认**未声明许可证**；建议在根目录与各子项目 **任选其一** 补充（例如 MIT），并在本 README 或子 README 中写明版权声明。

---

## English (brief)

This repo is an **open collection of UI prototypes**—mostly static HTML/CSS/JS demos you can run locally or serve with Docsify under `docs/`. Each folder (e.g. `saiwu/`) is independent. See the table above and per-project READMEs for details.
