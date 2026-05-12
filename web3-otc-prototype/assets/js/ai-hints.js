(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  /** 演示用行情快照（非真实） */
  function demoIcePeak(fiat, side) {
    var buyLow = { CNY: "7.2380", HKD: "7.798", USD: "0.9986" };
    var sellHigh = { CNY: "7.2510", HKD: "7.812", USD: "1.0012" };
    var f = fiat || "CNY";
    if (side === "sell") return sellHigh[f] || sellHigh.CNY;
    return buyLow[f] || buyLow.CNY;
  }

  function prefs() {
    return window.NxOtcCurrency ? NxOtcCurrency.getPreference() : { fiat: "CNY", coin: "USDT" };
  }

  function linkAi(q) {
    return "ai.html?q=" + encodeURIComponent(q);
  }

  function pillsRow(iceLabel, iceVal, pickLabel) {
    var p1 =
      '<span class="ai-pill ai-pill--ice" title="演示数据">' +
      esc(iceLabel) +
      " <strong>" +
      esc(iceVal) +
      "</strong></span>";
    var p2 = pickLabel
      ? '<span class="ai-pill ai-pill--pick" title="演示推荐">' + esc(pickLabel) + "</span>"
      : "";
    return '<div class="ai-nudge__insights">' + p1 + p2 + "</div>";
  }

  function actionsRow(primary, secondary) {
    var a1 =
      '<a class="ai-nudge__cta" href="' +
      esc(primary.href) +
      '">' +
      esc(primary.label) +
      "</a>";
    var a2 = secondary
      ? '<a class="ai-nudge__sub" href="' + esc(secondary.href) + '">' + esc(secondary.label) + "</a>"
      : "";
    return '<div class="ai-nudge__actions">' + a1 + a2 + "</div>";
  }

  function buildHtml(ctx) {
    var boot = ctx.boot || document.body.getAttribute("data-boot") || "";
    var order = ctx.order;
    var p = prefs();
    var pair = p.coin + "/" + p.fiat;

    if (boot === "home") {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 主动提示</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(p.fiat, "buy"), "推荐 · 先走一遍 AI OTC 全流程") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>你可能想：</strong>先确认法币偏好与交易对，再用<strong>快速开始</strong>或大厅下一笔；大额建议先询价再锁单。</p>' +
        actionsRow(
          { label: "让助手规划我的第一步", href: linkAi("我是新手，从首页开始下一步该怎么做") },
          { label: "历史波动大概怎样（演示）", href: linkAi(pair + " 最近买卖价波动大吗，演示数据怎么说") }
        ) +
        "</aside>"
      );
    }

    if (boot === "quotes") {
      var side = ctx.quoteSide || document.body.getAttribute("data-quote-side") || "buy";
      var iceL = side === "sell" ? "近7日收购峰值（演）" : "历史冰点（买价·演）";
      var iceV = demoIcePeak(p.fiat, side);
      var pick =
        side === "sell"
          ? "推荐成交 · 承兑商甲 · 企业认证"
          : "推荐成交 · 商家 A · 平均用时更短";
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 大厅</span>' +
        pillsRow(iceL, iceV, pick) +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>对比单价、限额与到账 SLA；选定后进入下单页。若从询价过来，可结合 RFQ 档位再决策。</p>' +
        actionsRow(
          {
            label: side === "sell" ? "问助手：卖单哪家更划算" : "问助手：这三家怎么选",
            href: linkAi(
              (side === "sell" ? "卖出" : "买入") +
                " " +
                p.coin +
                "，大厅当前列表里怎么权衡价格与速度（演示）"
            ),
          },
          { label: "冰点价是什么意思，我要不要等", href: linkAi("OTC 大厅里历史冰点/峰值提示我怎么用") }
        ) +
        "</aside>"
      );
    }

    if (boot === "rfq") {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 询价</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(p.fiat, "buy"), "拉齐多档后再去大厅锁单") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>用名义金额换一批 <strong>QuoteRef</strong>；TTL 内对比最优档，再<strong>带上结果去大厅</strong>选真实商家。</p>' +
        actionsRow(
          { label: "解读这三档报价差异", href: linkAi("RFQ 返回的多档报价我要怎么看，演示") },
          { label: "TTL 快到了怎么办", href: linkAi("询价 TTL 快过期了下一步怎么做") }
        ) +
        "</aside>"
      );
    }

    if (boot === "orders") {
      var snap = ctx.ordersSnapshot;
      var extra = "";
      if (snap && snap.length && window.NxOtcAI) {
        var act = NxOtcAI.pickActiveOrder(snap);
        if (act)
          extra =
            '<p class="ai-nudge__foot">检测到进行中的订单 · <span class="mono">' +
            esc(act.id.slice(-8)) +
            "</span> — 点进详情跟进托管/付款。</p>";
      }
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 订单</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(p.fiat, "buy"), "优先处理「进行中」状态") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>按状态筛选；有倒计时步骤的订单优先打开，避免付款/放币超时。</p>' +
        actionsRow(
          { label: "总结我哪些订单要马上处理", href: linkAi("看我的订单列表，哪些需要马上处理") },
          { label: "付款超时规则（演示）", href: linkAi("订单付款超时了会怎样，演示说明") }
        ) +
        extra +
        "</aside>"
      );
    }

    if (boot === "detail" && order) {
      var next = "";
      var ask = { label: "问助手", href: linkAi("帮我") };
      var sub = null;
      if (order.status === "locked") {
        next = "下一步：完成<strong>托管签名</strong>，不要向他人泄露助记词或代签。";
        ask = { label: "签名前我要核对什么", href: linkAi("订单 " + order.id + " 托管签名前核对清单") };
        sub = { label: "去托管页", href: "escrow.html?id=" + encodeURIComponent(order.id) };
      } else if (order.status === "paying") {
        next = "下一步：进入<strong>付款页</strong>，仅认订单页展示的收款账户与金额。";
        ask = { label: "付款防骗核对", href: linkAi("订单 " + order.id + " 我要付款了教我怎么核对") };
        sub = { label: "去付款", href: "pay.html?id=" + encodeURIComponent(order.id) };
      } else if (order.status === "paid_pending" || order.status === "releasing") {
        next = "下一步：等待对方放币；可在<strong>放币进度</strong>查看链上状态。";
        ask = { label: "一直未放币怎么办", href: linkAi("订单 " + order.id + " 已付款但对方未放币") };
        sub = { label: "查看放币", href: "release.html?id=" + encodeURIComponent(order.id) };
      } else if (order.status === "dispute") {
        next = "当前处于<strong>申诉处理</strong>，请保留凭证并关注站内通知。";
        ask = { label: "申诉进度说明", href: linkAi("订单 " + order.id + " 申诉中我要做什么") };
      } else if (order.status === "done") {
        next = "订单已完成；可进行下一笔或整理资金。演示环境无真实链上划转。";
        ask = { label: "完成后还要注意什么", href: linkAi("订单 " + order.id + " 完成后资金与安全还要注意什么") };
      } else {
        next = "请根据下方进度条推进；不要随意向站外账户打款。";
        ask = { label: "帮我解释当前状态", href: linkAi("订单 " + order.id + " 当前状态什么意思") };
      }
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 本单</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(order.fiatCode || p.fiat, "buy"), "按订单状态推进，勿信私聊换卡") +
        "</div>" +
        '<p class="ai-nudge__intent">' +
        next +
        "</p>" +
        actionsRow(ask, sub) +
        "</aside>"
      );
    }

    if (boot === "create" && order) {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 确认下单</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(order.fiatCode || p.fiat, order.side), "确认单价与名义后再托管") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>核对单价、名义金额与对手昵称；确认后进入<strong>托管签名</strong>，途中不要离开订单页去私下交易。</p>' +
        actionsRow(
          {
            label: "锁单前最后检查清单",
            href: linkAi("订单 " + order.id + " 确认下单前我要检查哪些信息"),
          },
          { label: "为什么必须走托管", href: linkAi("OTC 为什么要先托管再付款 演示说明") }
        ) +
        "</aside>"
      );
    }

    if (boot === "escrow" && order) {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 托管</span>' +
        pillsRow("链上安全", "本地签", "勿截屏助记词 / 勿代签") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>在<strong>本页或钱包插件</strong>完成签名；签名成功后按引导去<strong>付款</strong>，不要提前向聊天里发来的卡号转账。</p>' +
        actionsRow(
          { label: "签名完成接下来做什么", href: linkAi("订单 " + order.id + " 托管签名成功后下一步") },
          { label: "去付款页", href: "pay.html?id=" + encodeURIComponent(order.id) }
        ) +
        "</aside>"
      );
    }

    if (boot === "pay" && order) {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 付款</span>' +
        pillsRow("防骗", "只认本页", "附言按订单要求填写") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>复制收款信息到网银/支付宝前再核对一遍；勾选确认后再点「已付款」，如遇要求换卡请先停手并申诉。</p>' +
        actionsRow(
          { label: "付款前我必须核对的几项", href: linkAi("订单 " + order.id + " 付款前核对收款账户与金额") },
          { label: "这是不是诈骗场景", href: linkAi("对方催我转私人账户是不是诈骗") }
        ) +
        "</aside>"
      );
    }

    if (boot === "release" && order) {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 完成</span>' +
        pillsRow("参考冰点（买）", demoIcePeak(order.fiatCode || p.fiat, "buy"), "可再来一笔或问助手复盘") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>确认链上到账与订单状态；若无误可做资金归集或下一笔。<strong>演示环境</strong>无真实资产移动。</p>' +
        actionsRow(
          { label: "完成后怎么管理资金", href: linkAi("OTC 订单完成后资金与安全建议") },
          { label: "回首页", href: "index.html" }
        ) +
        "</aside>"
      );
    }

    if (boot === "dispute") {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 申诉</span>' +
        pillsRow("举证", "流水/单号", "最终提交需勾选确认") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>选对订单、写清类型与经过；材料越完整处理越快。提交前请在弹窗内<strong>二次确认</strong>。</p>' +
        actionsRow(
          { label: "申诉材料怎么写更有效", href: linkAi("平台申诉要准备什么材料、怎么描述情况") },
          { label: "哪些情况不建议私了", href: linkAi("OTC 哪些纠纷应该走平台申诉") }
        ) +
        "</aside>"
      );
    }

    if (boot === "profile") {
      return (
        '<aside class="ai-nudge" id="ai-nudge-root" aria-label="智能助手提示">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">NX 助手 · 我的</span>' +
        pillsRow("偏好", p.fiat + "/" + p.coin, "影响大厅与询价展示") +
        "</div>" +
        '<p class="ai-nudge__intent"><strong>意图：</strong>设置默认交易对后，大厅/询价会按此组合提示；更换后返回交易页即生效（演示）。</p>' +
        actionsRow(
          { label: "解释多币种偏好有什么用", href: linkAi("OTC 里法币和币种偏好设置会怎样影响下单") },
          { label: "账户安全建议", href: "safety.html" }
        ) +
        "</aside>"
      );
    }

    if (boot === "ai") {
      return (
        '<aside class="ai-nudge ai-nudge--compact" id="ai-nudge-root" aria-label="提问建议">' +
        '<div class="ai-nudge__head">' +
        '<span class="ai-nudge__brand">试试这样问</span>' +
        "</div>" +
        '<p class="ai-nudge__intent ai-nudge__intent--tight">' +
          "例如：<strong>「询价和直接去大厅有什么区别」</strong>、<strong>「我的订单下一步」</strong>、<strong>「付款要注意什么」</strong>。点下方链接将带问题打开会话。" +
        "</p>" +
        '<div class="ai-nudge__chips">' +
        '<a class="ai-chip" href="' +
        linkAi("用自然语言带我走完一笔 OTC 交易有哪些步骤") +
        '">全流程</a>' +
        '<a class="ai-chip" href="' +
        linkAi(p.coin + "/" + p.fiat + " 现在演示里历史冰点是多少，能当真吗") +
        '">冰点含义</a>' +
        '<a class="ai-chip" href="' +
        linkAi("推荐成交和冰点提示我该怎么用") +
        '">推荐怎么用</a>' +
        "</div>" +
        "</aside>"
      );
    }

    return "";
  }

  function mount(ctx) {
    var old = document.getElementById("ai-nudge-root");
    if (old) old.remove();
    var html = buildHtml(ctx || {});
    if (!html) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var el = wrap.firstElementChild;
    var app = document.querySelector(".app");
    if (!app || !el) return;
    var anchor = app.querySelector(".shell-header, .sub-top");
    if (anchor) anchor.insertAdjacentElement("afterend", el);
    else app.prepend(el);
  }

  window.NxOtcAiHints = {
    mount: mount,
    buildHtml: buildHtml,
  };
})();
