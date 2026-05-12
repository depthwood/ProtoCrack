# UI 原型收集（开源）

**中文版说明**：面向 **GitHub / GitHub Pages** 场景整理的 **开源 UI 原型合集**，主打 **零构建（No-build）**、可直接 **`fork`** 的 **静态网页演示**：**HTML5 / CSS3 / 原生 JavaScript**，涵盖 **体育赛事运营 / 现场调度**、**医疗健康 / 智慧医疗 / 门诊流程 / 适老化界面**、**Web3 / OTC / 托管与申诉流程（IndexedDB）**、**借贷 / 消费金融线框** 等方向的 **产品稿 · 交互原型 · 界面模板**。亦集成 **Docsify** 文档站骨架，便于 **静态托管** 与 **站内导航**。

**English**: Open-source **UI prototype gallery** for GitHub—static **HTML/CSS/JS** demos (**sports event ops**, **healthcare / patient & clinic UX**, **Web3 OTC trading flows**, **lending / fintech wireframes**), **Docsify**-ready, clone-and-run with **`npx serve`** / **`npx docsify-cli serve`**.

常见检索词：**开源前端原型** · **静态网站 Demo** · **产品原型仓库** · **界面模板合集** · **GitHub Pages 示例** · **Docsify 站点** · **IndexedDB 演示** · **赛事管理系统界面** · **医院挂号问诊 UI** · **OTC 交易系统原型**

---

便于 **学习 / Fork / 二次开发 / 对内演示**；每个子目录彼此**独立**、**无运行时依赖**。收录清单与运行方式见 **「收录一览」** 与 **「快速开始」**。

---

## 收录一览

| 项目 | 场景简述 | 源码目录 | 打开原型 | 在线说明 |
|------|----------|----------|----------|----------|
| **赛务通** | 体育赛事现场运营（赛程、检录、播报、设置等） | [`saiwu/`](saiwu/) | [浏览器打开](prototype-launcher.html?goto=saiwu) | [`README.md`](saiwu/README.md) |
| **医路伴行** | 医疗场景：患者端 + 科室端、适老化、AI 演示、就诊流程 | [`yiliao/`](yiliao/) | [浏览器打开](prototype-launcher.html?goto=yiliao) | [`README.md`](yiliao/README.md) |
| **NX OTC（Web3）** | OTC 询价、大厅、下单、托管、付款、申诉与 AI 引导；数据在 IndexedDB | [`web3-otc-prototype/`](web3-otc-prototype/) | [浏览器打开](prototype-launcher.html?goto=web3-otc) | [`README.md`](web3-otc-prototype/README.md) |
| **智借** | 借贷服务体验原型（明暗主题、流程线框） | [`lending-ai-prototype/`](lending-ai-prototype/) | [浏览器打开](prototype-launcher.html?goto=lending) | （暂无 README） |

> 欢迎通过 Issue / PR **投稿新原型**：见下文「如何新增子项目」。  
> **打开原型**：链接指向根目录 **[`prototype-launcher.html`](prototype-launcher.html)**（带动参数时在浏览器内跳转到对应 `index.html`）。Markdown 在 IDE 里预览时，点击链接多半仍在编辑器内；若要**系统浏览器**打开，请任选：**资源管理器中双击** `prototype-launcher.html`，或在仓库根执行 `npx --yes serve .` 后用浏览器访问终端给出的地址并打开 `prototype-launcher.html`，再点表格同款的「浏览器打开」或页面上的列表。Web3 等依赖 IndexedDB 的原型建议始终通过 **HTTP**（`serve`）访问。


---

## 仓库结构

```
ui/                          # 本仓库根目录
├── README.md               # 本文件 · 合集总览
├── prototype-launcher.html # 在系统浏览器中打开各原型（表格「打开原型」入口）
├── docs/                   # Docsify 文档站（可与各原型一并部署）
│   ├── index.html
│   ├── README.md           # 站点首页（合集视角）
│   ├── _sidebar.md         # 侧栏 · 按子项目分组
│   ├── .nojekyll           # GitHub Pages 等场景可选
│   └── <子项目>/           # 各原型的**静态副本**（便于与 Docsify 同根发布）
├── saiwu/                  # 赛务通 · 主副本（建议在此维护源码）
├── yiliao/                 # 医路伴行 · 医疗场景原型
├── web3-otc-prototype/     # Web3 OTC 交易流程原型（IndexedDB）
├── lending-ai-prototype/   # 智借 · 借贷服务原型
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

### 从仓库根目录浏览全部原型（推荐）

在**仓库根** `ui/` 下执行：

```bash
npx --yes serve .
```

浏览器访问终端给出的地址，打开 **`/prototype-launcher.html`**，即可在系统浏览器中点击列表进入各项目（与「收录一览」中「浏览器打开」等价）；也可直接访问 **`/prototype-launcher.html?goto=saiwu`** 等直达某一原型。

### 文档站 + 多原型导航（Docsify）

在**仓库根** `ui/` 下执行：

```bash
npx docsify-cli serve docs
```

浏览器访问终端输出的地址（多为 `http://localhost:3000`），在侧栏按子项目进入**说明**或**交互原型**（HTML）。

当前 **`docs/_sidebar.md` 仅挂载赛务通与医路伴行**；`web3-otc-prototype`、`lending-ai-prototype` 等请在仓库根目录进入对应文件夹，用静态服务器打开（见上文「只预览某一个原型」）。

---

## 如何新增子项目

1. 在仓库根目录新建文件夹，命名简短、小写或中划线，例如 `booking-kiosk/`。
2. 在子目录内提供 **`README.md`**：项目名、截图（可选）、技术栈、如何本地运行、许可证等。
3. **若要将原型纳入 Docsify 侧栏**：将静态文件同步一份到 **`docs/<子项目>/`**（与现有 `docs/saiwu/` 方式一致），保证相对路径中的 `css/`、`js/` 仍可访问。仅根目录托管、不走上文文档站时，可跳过此步。
4. **若已纳入 Docsify**：编辑 **`docs/_sidebar.md`**，增加该子项目分组与链接（原型 HTML 链接需加 `':ignore'`，避免被 Docsify 劫持路由）。
5. 在本文件 **「收录一览」** 表格中追加一行：**打开原型** 使用 `[浏览器打开](prototype-launcher.html?goto=<键>)`，并在 **`prototype-launcher.html`** 的跳转表与列表里补上同名条目（`goto` 键建议与小写目录名一致）；**在线说明** 指向子目录 `README.md`（若有）。

子项目之间**不要互相引用路径**；共用资源请放在该子项目目录内部，或单独抽成 `packages/`（若未来需要再约定）。

---

## 技术共性（非强制）

当前收录以 **无构建、标准 Web** 为主，便于 fork 即用。子项目可自行选用框架，但请在各自 README 中写清安装与构建命令。

---

## 许可证

若根目录未放置 `LICENSE` 文件，默认**未声明许可证**；建议在根目录与各子项目 **任选其一** 补充（例如 MIT），并在本 README 或子 README 中写明版权声明。

---

## English (brief)

This repo is an **open collection of UI prototypes**—mostly static HTML/CSS/JS demos you can run locally. Use **`prototype-launcher.html`** at the repo root in a real browser (optionally with `?goto=…`) to jump to each project's `index.html`. Docsify under `docs/` currently indexes **saiwu** and **yiliao** only; other folders are opened via the launcher or a static server. Each project folder is independent.

**SEO-style keywords / GitHub search hints**: `open-source UI prototypes`, `static HTML demos`, `Docsify documentation site`, `GitHub Pages friendly`, `vanilla JavaScript`, `IndexedDB offline demo`, `healthcare patient portal mockup`, `sports event operations dashboard`, `Web3 OTC trading UX`, `lending app wireframe`, `Chinese UI templates`.
