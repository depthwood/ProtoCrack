# 赛务通 · 体育赛事现场运营原型

基于标准 **HTML5**、**CSS**、**JavaScript** 的多页面原型，用于赛事日程、检录、现场控制与设置等场景。无需构建工具，静态文件即可预览。

## 技术栈

| 类别 | 说明 |
|------|------|
| 标记 | HTML5（语义化、无障碍相关属性） |
| 样式 | CSS3（自定义属性、`backdrop-filter`、Grid/Flex） |
| 脚本 | 原生 JavaScript（IIFE，无框架、无打包） |
| 字体 | Google Fonts：`Plus Jakarta Sans` + `Noto Sans SC`（`@import`，失败则系统字体回退） |
| 存储 | `localStorage`：`saiwu-theme`（`light` / `dark`） |

## 目录结构

```
saiwu/
├── index.html          # 工作台（轮播、公告、快捷入口）
├── announcements.html  # 公告列表
├── schedule.html       # 赛程与场地
├── participants.html   # 人员与队伍
├── checkin.html        # 检录签到
├── live.html           # 现场控制（计时演示）
├── settings.html       # 赛事设置
├── css/app.css         # 全局样式（明暗主题、组件）
├── js/app.js           # 主题切换、时钟、轮播、计时器
└── README.md           # 本说明
```

## 本地预览

1. **直接打开**：双击 `index.html`（`file://` 一般可用；部分环境对本地脚本限制更严时建议用下面方式）。
2. **本地静态服务**（推荐）：在 `saiwu` 目录执行其一即可：
   - `npx --yes serve .`（默认端口 3000）
   - `python -m http.server 8080`
   - VS Code / Cursor 的 “Live Server” 等插件，根目录指向 `saiwu`  

浏览器访问输出的本地地址，入口仍为 `index.html`。

### 使用 Docsify 与文档一并展示

若要用 [Docsify](https://docsify.js.org/) 拉起**说明文档 + 本原型**（适合对内演示）：

1. 仓库内已提供 `docs/`（入口 `docs/index.html`，侧栏含「交互原型」）。
2. 在 **`ui` 目录**执行：`npx docsify-cli serve docs`
3. 打开终端里提示的地址（多为 `http://localhost:3000`），侧栏点 **「交互原型」**，或直接访问 `/saiwu/index.html`。

`docs/saiwu/` 为便于静态托管的一份副本；若你只在本目录改代码，请同步到 `docs/saiwu/` 后再用 Docsify 预览。

## 部署说明

本仓库为**纯静态资源**，可部署到任意静态托管：

- **Nginx**：`root` 指向 `saiwu` 目录；确保 `index.html` 为默认首页；开启 `try_files $uri $uri/ /index.html;` 仅在同域 SPA 时需要，本站为多页 HTML，通常 `location /` 直接提供文件即可。
- **对象存储 + CDN**（如阿里云 OSS、腾讯云 COS、AWS S3 + CloudFront）：上传整个 `saiwu` 目录的内容（保持 `css/`、`js/` 相对路径），静态网站托管入口设为 `index.html`。
- **GitHub Pages / GitLab Pages**：将站点根目录设为 `saiwu`（或仓库根即 `saiwu` 内容），Pages 构建选 “无构建”，发布静态文件。

部署后请使用 **HTTPS**（符合现代浏览器对部分 API 的预期；当前原型未强制依赖）。

## 功能说明

- **明暗模式**：顶栏按钮切换，偏好保存在 `localStorage`（键名 `saiwu-theme`）。
- **轮播**：首页「赛事聚焦」，支持按钮、指示点、自动播放与简单滑动；尊重 `prefers-reduced-motion`。
- **公告**：首页摘要 + `announcements.html` 全部公告。
- **导航**：底部 Tab 在同级 HTML 页面间跳转（相对路径）。

## 字体与网络

`css/app.css` 通过 Google Fonts 加载远程字体；**内网或境外受限**时可能加载失败，不影响使用（回退系统字体）。如需完全离线，可删除文件首行 `@import`，并保留 `--font` 中的系统字体列表。

## 浏览器支持

现代浏览器（Chrome、Edge、Firefox、Safari 等）。已使用 `viewport-fit=cover` 与安全区变量，便于移动端刘海屏。

---

原型数据仅供演示；接入后端时可保留页面结构，将列表与表单改为接口渲染。

---

# English

**Saiwu** is a static **HTML5 + CSS + JavaScript** multi-page prototype for on-site sports event operations (schedule, check-in, live desk, settings). No build step is required.

## Tech stack

- HTML5, CSS (custom properties, `backdrop-filter`, Grid/Flex), vanilla JS (no frameworks).
- Theme preference: `localStorage` key `saiwu-theme` (`light` | `dark`).
- Optional fonts via Google Fonts (`Plus Jakarta Sans`, `Noto Sans SC`); system fonts are used if loading fails.

## Local preview

- Open `index.html` in a browser, or  
- Serve the `saiwu` folder with any static server (e.g. `npx --yes serve .`, `python -m http.server 8080`).

### Docsify (docs + prototype)

From the `ui` repo root, run `npx docsify-cli serve docs`, then open the printed URL. Use the sidebar link **「交互原型」** or go to `/saiwu/index.html`. Keep `docs/saiwu/` in sync with this folder if you edit here only.

## Deployment

Upload the `saiwu` directory contents to any static host (Nginx, object storage + CDN, GitHub Pages, etc.). Set `index.html` as the default document; keep `css/` and `js/` paths relative to the HTML files.

## Features

- Light/dark theme toggle (persisted).
- Home carousel with dots, arrows, autoplay, basic swipe.
- Announcements on the home page and full list in `announcements.html`.
- Bottom tab bar for navigation between pages.

Demo copy only; replace with API-driven data when integrating a backend.
