# NX OTC 原型（web3-otc-prototype）

无构建步骤的静态 **HTML / CSS / JS** 交易流程原型，用于演示 OTC 场景下的询价、大厅、下单、托管、付款、申诉与 AI 引导等交互。**数据保存在浏览器 IndexedDB**，刷新页面后仍会保留（除非清除站点数据）。

---

## 本地预览

1. 直接用浏览器打开根目录下任一 `.html`（如 `index.html`）。
2. 若遇到 **IndexedDB / 本地脚本** 被策略拦截，请用本地静态服务器打开目录，例如：
   - `npx serve .` 或 `python -m http.server 8080`  
   然后访问 `http://127.0.0.1:8080/index.html`。

建议使用 **Chrome / Edge** 等 Chromium 内核浏览器，以便与 IndexedDB、backdrop-filter 表现一致。

---

## 界面设计说明（协调性与扩展）

整体采用 **深色基底 + 青色主操作色 + 紫色辅助**，统一组件层级：

| 层级 | 用途 |
|------|------|
| `--bg-deep` | 全屏背景 |
| `--bg-panel` | 卡片、面板、列表行基底 |
| `--bg-elevated` | 输入框、次级抬升区域 |
| `--shadow-card` | 主卡片阴影（内高光 + 外投影） |
| `--shadow-soft` | 列表行、横幅等次级浮起 |

关键样式集中在 **`assets/css/styles.css`**：圆角（`--radius` / `--radius-sm`）、描边（`--border`）、主按钮与 AI 悬浮钮使用同一套 **青→紫渐变**，买入 / 卖出大卡片用 **左侧色条** 区分方向，底部 Tab 与列表行在支持 `hover` 的设备上强化反馈。

后续换肤时只需 **调整 `:root` 变量**，尽量少改组件 class。

### AI 主动提示（`assets/js/ai-hints.js`）

在每页 **顶栏下方** 展示「NX 助手」条：结合**页面意图**给出「你可能想 / 下一步」类说明，并带 **演示向** 标签（如**历史冰点**、**近7日收购峰值**、**推荐成交**）。主按钮链到 `ai.html?q=…` 预填追问；订单页会按 `status` 切换托管/付款/放币等引导。

---

## 目录结构

```text
web3-otc-prototype/
├── index.html                 # 首页（快速开始、资产条、最近订单）
├── quotes.html                # 交易大厅
├── rfq.html                   # 询价 RFQ
├── orders.html                # 订单列表
├── order-detail.html          # 订单详情
├── order-create.html          # 确认下单
├── escrow.html / pay.html / release.html
├── dispute.html               # 申诉向导
├── ai.html                    # NX 助手
├── profile.html               # 我的（含法币/加密偏好）
├── safety.html / cancel.html
├── assets/
│   ├── css/
│   │   └── styles.css         # 全局样式与设计令牌
│   └── js/
│       ├── currency.js        # 多币种注册表、格式化、演示汇率、偏好
│       ├── ai-hints.js        # 按页意图的 AI 提示条（冰点/推荐/下一步，演示）
│       ├── store.js           # IndexedDB：orders / ai_messages / kv
│       ├── confirm.js         # 关键操作二次确认弹层
│       ├── ai-intent.js       # 助手意图（演示规则）
│       ├── otc-ui.js          # data-boot 页面初始化与列表/详情渲染
│       └── app.js             # Toast、占位按钮、Tab 高亮
└── README.md
```

### 脚本加载顺序（含页面的惯例）

```text
assets/js/currency.js
assets/js/store.js
assets/js/confirm.js      # 若该页需要确认门闩
assets/js/ai-intent.js
assets/js/ai-hints.js
assets/js/otc-ui.js
assets/js/app.js          # defer
```

---

## 页面与数据流（简述）

| 页面 | 作用 |
|------|------|
| `index.html` | 入口、快速开始引导进 AI、展示最近一单 |
| `rfq.html` | 模拟 RFQ 与多档 QuoteRef，`sessionStorage` 可带回大厅 |
| `quotes.html` | 选商 → `order-create.html`（URL 带 `fiatCode` / `coinCode` / `side`） |
| `order-create` → `escrow` → `pay` → `release` | 演示主路径；付款等关键步骤含 **ConfirmGate** |
| `dispute.html` | 三步申诉 + 最终确认 |
| `ai.html` | 助手对话（IndexedDB 持久化） |

**订单模型**（扩展用字段）：`fiat` / `fiatCode`、`coin` / `coinCode`、`price`、`side`、`status` 等。旧数据无币种字段时由 `currency.js` 的 `normalizeOrder` 补默认 **CNY + USDT**。用户偏好存在 **kv** 的 `pref_fiat` / `pref_coin`，在「我的」页修改。

---

## 多币种与报价

- **法币**：`CNY` / `HKD` / `USD`（`currency.js` 内可扩展。）
- **加密**：`USDT` / `USDC`。
- 大厅与询价的 **演示数字** 仍为静态表；接生产时应按 `(fiatCode, coinCode)` 请求后端深度。

---

## 限制与免责

- 所有报价、汇率、商家名均为 **虚构演示**。
- 不涉及真实链上签名或法币通道，仅 UI/流程示意。

---

## 后续迁移建议

- 引入 **Vite + TypeScript** 时：保留 `store` 字段名与 `currency` 语义，将 `otc-ui.js` 按路由/组件拆分。
- 设计令牌可直接映射到 **CSS 变量**或设计系统（如 `--accent` → `theme.colors.primary`）。
