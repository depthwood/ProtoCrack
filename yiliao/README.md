# 医路伴行 · 医疗场景 HTML5 原型

> 本目录是 **[UI 原型收集](../README.md)** 仓库中的子项目之一：**患者端 + 科室端**双视角、**适老化（长辈模式）**、**AI 辅助（演示）**与就诊流程示意。无需构建，静态文件即可预览。

## 技术栈

| 类别 | 说明 |
|------|------|
| 标记 | HTML5（语义化、`aria-*`、中文 `lang`） |
| 样式 | CSS3（设计令牌、`data-theme` 明暗色、`data-elderly` 大字版） |
| 脚本 | 原生 JavaScript（IIFE）：主题、长辈模式、`localStorage` 持久化、AI 输入演示 |
| 字体 | Google Fonts：`Noto Sans SC`（失败则系统字体回退） |

## 目录结构

```
yiliao/
├── index.html          # 患者首页：下一步、今日流程、快捷入口
├── journey.html        # 就诊行程时间线
├── queue.html          # 候诊 / 检查排队
├── reports.html        # 报告列表与摘要
├── ai-assist.html      # 智能助理（免责说明 + 演示对话）
├── dept.html           # 科室工作台：队列与待办
├── dept-patient.html   # 科室：患者详情、时间轴、AI 摘要（演示）
├── dept-action.html    # 科室：医嘱/病程/交接等操作占位（由患者详情进入）
├── settings.html       # 我的 / 设置（`?role=dept` 为科室底栏）
├── css/app.css
├── js/app.js
└── README.md           # 本说明
```

## 本地预览

1. **直接打开**：双击 `index.html`（部分环境对 `file://` 限制较严时建议用下面方式）。
2. **本地静态服务**（推荐）：在 `yiliao` 目录执行其一：
   - `npx --yes serve .`
   - `python -m http.server 8080`

## 存储键（演示）

| 键名 | 含义 |
|------|------|
| `yiliao-theme` | `light` / `dark` |
| `yiliao-elderly` | `1` 开启长辈模式，`0` 关闭 |

## 说明与边界

- 页面中文案、检验数值、队列为 **虚构演示数据**，不作为医学依据。
- 「智能助理」「AI 摘要」为 **交互占位**；正式产品需单独做合规、免责与模型审核。
- 与合集其他子项目一致：**无后端、无真实联网**（字体 CDN 除外）。

## 许可证

与仓库根目录保持一致。
