(function () {
  "use strict";

  function norm(s) {
    return (s || "").trim().toLowerCase();
  }

  function pickActiveOrder(orders) {
    var pri = ["paying", "locked", "paid_pending", "releasing"];
    for (var i = 0; i < pri.length; i++) {
      var st = pri[i];
      var f = orders.filter(function (o) {
        return o.status === st;
      });
      if (f.length) {
        f.sort(function (a, b) {
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        return f[0];
      }
    }
    return null;
  }

  function extractMoney(text) {
    var m = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(万)?/);
    if (!m) return null;
    var n = parseFloat(String(m[1]).replace(/,/g, ""));
    if (m[2] === "万") n *= 10000;
    if (!isFinite(n)) return null;
    return Math.round(n);
  }

  /** @returns {{ reply: string, actions: Array<{label:string,href?:string}>, slots: object, riskTip?: string }} */
  function reply(userText, ctx) {
    var t = norm(userText);
    var slots = {};
    var amt = extractMoney(userText);
    if (amt) slots.fiatHint = amt;

    var actions = [];
    var riskTip;

    if (/询价|rfq|做市|聚合|多档|比价|quote\s*ref|拉取报价|报价响应|做市方/.test(t)) {
      actions.push({ label: "发起询价（RFQ）", href: "rfq.html" });
      actions.push({ label: "打开交易大厅", href: "quotes.html" });
      return {
        reply:
          "理解为：**询价 / 多档报价（RFQ）**。" +
          (amt ? " 我会把名义额度 **¥" + amt + "** 记在草稿里（仍以询价页与锁单页为准）。" : "") +
          " 演示里会生成 RFQ 编号、TTL 与多条 QuoteRef；比完价后可「带上结果」进大厅选商家。",
        actions: actions,
        slots: slots,
        riskTip: "报价有时效；过期或市场波动时需重新询价，并以锁单瞬间公示为准。",
      };
    }

    if (/全流程|从头到尾|完整流程|一笔做完|自然语言.*交易|从零|步骤链|otc\s*流程/.test(t)) {
      actions.push({ label: "① 询价拿报价", href: "rfq.html" });
      actions.push({ label: "② 大厅锁单", href: "quotes.html" });
      actions.push({ label: "③ 订单列表跟进", href: "orders.html" });
      return {
        reply:
          "**自然语言驱动的 OTC 全流程（本原型）**：先用一句话或额度发起 **RFQ 看多档报价** → 进 **大厅** 选商家并下订单 → 在订单里完成 **托管签名、法币付款、链上放币**。助手只通过链接把你带到站内页面；转账与申诉等敏感操作在页面里 **二次确认** 后再执行。",
        actions: actions,
        slots: slots,
        riskTip: "任何要求你跳过订单页、私下换卡/换 U 的指引，都应拒绝并走申诉。",
      };
    }

    if (/买|买入|收购|充值|usdt|换u|提u/.test(t)) {
      actions.push({ label: "去填写金额（买入）", href: "rfq.html" });
      actions.push({ label: "直接逛商家报价", href: "quotes.html" });
      return {
        reply:
          "理解为：**买入 USDT**。" +
          (amt ? " 我会优先按你说的 **¥" + amt + "** 作为目标额度（仍需你在下单页确认）。" : "") +
          " 建议先选付款方式与额度，再去大厅对比商家时效。",
        actions: actions,
        slots: slots,
        riskTip: "任何私聊发来的收款信息都不要轻信，以订单页展示为准。",
      };
    }

    if (/卖|卖出|变现|cny|人民币/.test(t)) {
      actions.push({ label: "卖出询价（RFQ）", href: "rfq.html" });
      actions.push({ label: "去卖出（大厅）", href: "quotes.html" });
      return {
        reply:
          "理解为：**卖出 USDT 换人民币**。" +
          (amt ? " 名义约 **¥" + amt + "** 可作询价参考。" : "") +
          " 可先 **RFQ 看多档收购价**，再进大厅锁单；收购价越高通常到手人民币越多（演示）。",
        actions: actions,
        slots: slots,
        riskTip: "资金离开链上前，优先确认对方信誉与成交记录。",
      };
    }

    if (/订单|进度|查单|在哪|怎么样了/.test(t)) {
      actions.push({ label: "打开订单列表", href: "orders.html" });
      if (ctx.activeOrderId) {
        actions.push({ label: "查看进行中的订单", href: "order-detail.html?id=" + encodeURIComponent(ctx.activeOrderId) });
      }
      return {
        reply:
          ctx.activeOrderId
            ? "检测到你有一笔进行中的订单，我可以带你直达详情；也可以先看全量列表。"
            : "当前没有进行中的演示订单。你可以从「订单」里看历史记录，或先去发起一笔交易。",
        actions: actions,
        slots: slots,
      };
    }

    if (/付|转账|凭证|怎么转|卡号/.test(t)) {
      if (ctx.activeOrderId) {
        actions.push({ label: "打开付款页", href: "pay.html?id=" + encodeURIComponent(ctx.activeOrderId) });
        return {
          reply: "付款请务必核对**本应用订单页**展示的收款账户。需要的话我现在带你去付款页。",
          actions: actions,
          slots: slots,
          riskTip: "平台不会通过私信让你换卡；如遇请直接申诉。",
        };
      }
      actions.push({ label: "先看帮助", href: "safety.html" });
      return {
        reply: "没有找到可关联的进行中订单。你先完成下单与托管，再在订单里进入付款。",
        actions: actions,
        slots: slots,
        riskTip: "付款前反复确认金额备注与对方账户是否来自官方页面。",
      };
    }

    if (/骗|安全|诈骗|风险|假冒|钓鱼/.test(t)) {
      actions.push({ label: "查看安全指南", href: "safety.html" });
      return {
        reply: "我建议你按「只信订单页 + 官方入口」原则处理。需要我展开常见骗局与应对吗？",
        actions: actions,
        slots: slots,
        riskTip: "对方催你快点转账、用聊天发银行卡，一律先停。",
      };
    }

    if (/申诉|客服|工单|争议|仲裁/.test(t)) {
      var disHref = "dispute.html";
      if (ctx.activeOrderId) disHref = "dispute.html?orderId=" + encodeURIComponent(ctx.activeOrderId);
      actions.push({ label: "进入申诉向导", href: disHref });
      if (ctx.activeOrderId) {
        actions.push({
          label: "先看订单详情",
          href: "order-detail.html?id=" + encodeURIComponent(ctx.activeOrderId),
        });
      }
      return {
        reply:
          (ctx.activeOrderId
            ? "检测到有进行中订单，申诉向导可 **预填订单号**；请按步骤选类型、写说明，最后在弹窗里 **勾选确认** 再提交（演示）。"
            : "请先准备 **订单号与付款凭证**。进入申诉向导后：选订单 → 填类型与说明 → **最终确认** 提交平台工单（演示）。") +
          " 请勿向站外透露验证码。",
        actions: actions,
        slots: slots,
      };
    }

    if (/取消|超时|多久|时间/.test(t)) {
      actions.push({ label: "取消/超时说明", href: "cancel.html" });
      return {
        reply: "不同环节有不同的倒计时（锁价/付款/放币）。我先带你到说明页，避免误操作。",
        actions: actions,
        slots: slots,
      };
    }

    if (/快|急|多久到账|分钟|对比|便宜|汇率|滑点|哪家|费率/.test(t)) {
      actions.push({ label: "对比商家（大厅）", href: "quotes.html" });
      if (amt) actions.push({ label: "按目标额度买入", href: "rfq.html" });
      return {
        reply:
          "这类需求建议用**大厅字段**做横向对比：单价、限额区间、平均用时（演示数据）。你也可以先说额度，我再带你走下一步。",
        actions: actions,
        slots: slots,
        riskTip: "单一维度「最便宜」不一定是综合最优，注意撮合约束与到账 SLA。",
      };
    }

    if (/重置|清空|清除对话/.test(t)) {
      return {
        reply: "你可以在对话区右上角使用「清空」按钮（若提供）。我也可以帮你跳转首页重新开始。",
        actions: [
          { label: "回首页", href: "index.html" },
          { label: "交易大厅", href: "quotes.html" },
        ],
        slots: slots,
      };
    }

    actions.push({ label: "交易大厅", href: "quotes.html" });
    actions.push({ label: "我的订单", href: "orders.html" });
    return {
      reply:
        "我没法 100% 确定你的意图。" +
        (amt ? " 如果涉及金额 **¥" + amt + "**，更像是在询价/买入。" : "") +
        " 你可以先用快捷入口，或换一种说法（例如：买入、查订单、付款）。",
      actions: actions,
      slots: slots,
    };
  }

  window.NxOtcAI = {
    reply: reply,
    pickActiveOrder: pickActiveOrder,
    extractMoney: extractMoney,
  };
})();
