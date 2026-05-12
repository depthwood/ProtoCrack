(function () {
  "use strict";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function fmtMoney(n) {
    if (n == null || isNaN(n)) return "—";
    return n.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }

  function curFmtFiat(n, fiatCode) {
    if (window.NxOtcCurrency) return NxOtcCurrency.formatFiat(n, fiatCode);
    return "¥ " + fmtMoney(n);
  }

  function curFmtCoin(n, coinCode) {
    if (window.NxOtcCurrency) return NxOtcCurrency.formatCoin(n, coinCode);
    return fmtMoney(n) + " USDT";
  }

  function coinLabel(coinCode) {
    return coinCode || "USDT";
  }

  function normO(o) {
    if (o && window.NxOtcCurrency) return NxOtcCurrency.normalizeOrder(o);
    if (o && !o.fiatCode) o.fiatCode = "CNY";
    if (o && !o.coinCode) o.coinCode = "USDT";
    return o;
  }

  function loadCurrencyPrefs() {
    if (!window.NxOtcCurrency || !window.NxOtcStore) return Promise.resolve();
    return Promise.all([NxOtcStore.getKv("pref_fiat"), NxOtcStore.getKv("pref_coin")]).then(function (vals) {
      NxOtcCurrency.setPreference(vals[0], vals[1]);
    });
  }

  function applyShellPair() {
    if (!window.NxOtcCurrency) return;
    document.querySelectorAll("[data-shell-fiat]").forEach(function (el) {
      el.textContent = NxOtcCurrency.fiatLabelLine();
    });
    document.querySelectorAll("[data-shell-pair]").forEach(function (el) {
      el.textContent = NxOtcCurrency.pairSlash();
    });
    var bl = document.getElementById("home-balance-label");
    if (bl) bl.textContent = "参考余额（" + NxOtcCurrency.getPreference().coin + "）";
    var est = document.getElementById("home-fiat-est");
    if (est) {
      var pref = NxOtcCurrency.getPreference();
      var demoCoinAmt = 13820;
      var fiatEst = NxOtcCurrency.estimateFiatFromCoin(demoCoinAmt, pref.coin, pref.fiat);
      if (fiatEst != null) {
        est.textContent =
          "约合 " + NxOtcCurrency.formatFiat(fiatEst, pref.fiat) + " · 仅供参考（演示汇率）";
      }
    }
  }

  function shortId(id) {
    if (!id || id.length < 10) return id || "";
    return "···" + id.slice(-6);
  }

  function statusGroup(st) {
    if (st === "done") return "done";
    if (st === "dispute") return "dispute";
    return "active";
  }

  function tagClass(st) {
    if (st === "done") return "ok";
    if (st === "dispute") return "warn";
    return "warn";
  }

  function tagText(st) {
    var map = {
      locked: "待托管",
      paying: "待付款",
      paid_pending: "待放币",
      releasing: "放币中",
      done: "已完成",
      dispute: "申诉中",
    };
    return map[st] || "处理中";
  }

  var QUOTES_SHEETS = {
    buy: [
      {
        name: "商家 A",
        badge: "高履约",
        limit: "限额 ¥5万 - 200万",
        eta: "平均 8 分钟",
        price: "7.2430",
        p: 7.243,
      },
      {
        name: "商家 B",
        badge: "",
        limit: "限额 ¥2万 - 50万",
        eta: "平均 12 分钟",
        price: "7.2415",
        p: 7.2415,
      },
      {
        name: "商家 C",
        badge: "",
        limit: "限额 ¥1万 - 20万",
        eta: "平均 20 分钟",
        price: "7.2390",
        p: 7.239,
      },
    ],
    sell: [
      {
        name: "承兑商 甲",
        badge: "企业认证",
        limit: "收币 1 万 - 50 万 U",
        eta: "平均 10 分钟",
        price: "7.2480",
        p: 7.248,
      },
      {
        name: "承兑商 乙",
        badge: "高周转",
        limit: "收币 5 千 - 30 万 U",
        eta: "平均 15 分钟",
        price: "7.2465",
        p: 7.2465,
      },
      {
        name: "承兑商 丙",
        badge: "",
        limit: "收币 8 千 - 10 万 U",
        eta: "平均 25 分钟",
        price: "7.2450",
        p: 7.245,
      },
    ],
  };

  function renderQuotesList(side) {
    var root = $("#quotes-list-root");
    if (!root) return;
    var prefs = window.NxOtcCurrency ? NxOtcCurrency.getPreference() : { fiat: "CNY", coin: "USDT" };
    var rows = QUOTES_SHEETS[side] || QUOTES_SHEETS.buy;
    var sideQ = side === "sell" ? "sell" : "buy";
    root.innerHTML = rows
      .map(function (r) {
        var href =
          "order-create.html?merchant=" +
          encodeURIComponent(r.name) +
          "&price=" +
          encodeURIComponent(String(r.p)) +
          "&side=" +
          sideQ +
          "&fiatCode=" +
          encodeURIComponent(prefs.fiat) +
          "&coinCode=" +
          encodeURIComponent(prefs.coin);
        var badge = r.badge ? ' <span class="tag ok">' + r.badge + "</span>" : "";
        return (
          '<a href="' +
          href +
          '" class="list-row">' +
          '<div><div class="name">' +
          r.name +
          badge +
          '</div><div class="sub">' +
          r.limit +
          " · " +
          r.eta +
          "</div></div>" +
          '<div><div class="price">' +
          r.price +
          '</div><div class="side">' +
          prefs.fiat +
          "</div></div></a>"
        );
      })
      .join("");

    var hint = $("#quotes-hint");
    if (hint) {
      hint.textContent =
        side === "sell"
          ? "卖出 " + prefs.coin + "：以下为承兑商报的收购价（通常以" + prefs.fiat + "计价，越高到手越多）。演示数据。"
          : "买入 " + prefs.coin + "：以下为卖出报价（以" + prefs.fiat + "计价，越低同额买到的 U 越多）。演示数据。";
    }
  }

  function injectRfqBanner() {
    try {
      var raw = sessionStorage.getItem("nx_rfq_bundle");
      if (!raw) return;
      var data = JSON.parse(raw);
      var app = document.querySelector(".app");
      if (!app || document.getElementById("rfq-carry-banner")) return;
      var el = document.createElement("div");
      el.id = "rfq-carry-banner";
      el.className = "rfq-banner-top";
      el.innerHTML =
        "已携带 <strong>询价单</strong>：" +
        data.rfqId +
        " · 名义 " +
        (window.NxOtcCurrency
          ? NxOtcCurrency.formatFiat(data.notional, data.fiatCode || "CNY")
          : "¥ " + fmtMoney(data.notional)) +
        ' · <a href="rfq.html">回看报价</a>';
      var hdr = app.querySelector(".shell-header");
      if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(el, hdr.nextSibling);
      else app.insertBefore(el, app.firstChild);
    } catch (e) {}
  }

  function bootQuotes() {
    injectRfqBanner();
    var params = new URLSearchParams(location.search);
    var urlSide = params.get("side");
    var initSide =
      urlSide === "sell" ? "sell" : urlSide === "buy" ? "buy" : null;

    var group = document.querySelector("#quotes-chips");
    if (initSide == null && group) {
      var onChip = group.querySelector(".chip.on");
      if (onChip && onChip.getAttribute("data-side")) initSide = onChip.getAttribute("data-side");
    }
    if (initSide == null) initSide = "buy";

    document.body.setAttribute("data-quote-side", initSide);

    if (group) {
      group.querySelectorAll(".chip").forEach(function (c) {
        c.classList.toggle("on", c.getAttribute("data-side") === initSide);
      });
    }

    renderQuotesList(initSide);

    if (group) {
      group.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (!chip) return;
        var s = chip.getAttribute("data-side");
        if (s) {
          document.body.setAttribute("data-quote-side", s);
          renderQuotesList(s);
          refreshAiNudge();
        }
      });
    }
    refreshAiNudge();
    return Promise.resolve();
  }

  function bootRfq() {
    var btn = document.getElementById("btn-rfq-fetch");
    var panel = document.getElementById("rfq-quote-panel");
    var inner = document.getElementById("rfq-quote-inner");
    var toHall = document.getElementById("btn-rfq-to-hall");
    var askAi = document.getElementById("btn-rfq-ask-ai");
    if (btn && inner) {
      btn.addEventListener("click", function () {
        var prefs = window.NxOtcCurrency ? NxOtcCurrency.getPreference() : { fiat: "CNY", coin: "USDT" };
        var amt = parseFloat(String(document.getElementById("amt").value).replace(/,/g, "")) || 100000;
        var side =
          document.getElementById("rfq-side") && document.getElementById("rfq-side").value === "sell"
            ? "sell"
            : "buy";
        var rfqId = "RFQ-" + Date.now().toString(36).toUpperCase();
        var ttl = 90;
        var quotes;
        if (side === "sell") {
          quotes = [
            { ref: "Q-S1-" + rfqId.slice(-4), price: 7.251, lp: "收单 · 华东", eta: "~12m" },
            { ref: "Q-S2-" + rfqId.slice(-4), price: 7.248, lp: "收单 · 华南", eta: "~9m" },
            { ref: "Q-S3-" + rfqId.slice(-4), price: 7.246, lp: "收单 · 华北", eta: "~20m" },
          ];
          quotes.sort(function (a, b) {
            return b.price - a.price;
          });
        } else {
          quotes = [
            { ref: "Q-B1-" + rfqId.slice(-4), price: 7.241, lp: "LP-Alpha", eta: "~8m" },
            { ref: "Q-B2-" + rfqId.slice(-4), price: 7.243, lp: "LP-Beta", eta: "~11m" },
            { ref: "Q-B3-" + rfqId.slice(-4), price: 7.245, lp: "LP-Gamma", eta: "~18m" },
          ];
          quotes.sort(function (a, b) {
            return a.price - b.price;
          });
        }
        quotes.forEach(function (q, i) {
          q.best = i === 0;
        });

        sessionStorage.setItem(
          "nx_rfq_bundle",
          JSON.stringify({
            rfqId: rfqId,
            notional: amt,
            side: side,
            fiatCode: prefs.fiat,
            coinCode: prefs.coin,
            quotes: quotes,
            ts: Date.now(),
            ttlSec: ttl,
          })
        );

        var meta = document.getElementById("rfq-meta");
        if (meta)
          meta.textContent =
            rfqId +
            " · TTL " +
            ttl +
            "s · " +
            (side === "sell" ? "卖出 " + prefs.coin : "买入 " + prefs.coin) +
            " · 名义 " +
            (window.NxOtcCurrency ? NxOtcCurrency.formatFiat(amt, prefs.fiat) : "¥" + fmtMoney(amt));

        inner.innerHTML = quotes
          .map(function (q) {
            var cls = q.best ? "quote-card best" : "quote-card";
            var tag = q.best ? '<span class="tag ok">更优</span> ' : "";
            var pxLabel = side === "sell" ? "收购价（" + prefs.fiat + "/" + prefs.coin + "）" : "卖出价（" + prefs.fiat + "/" + prefs.coin + "）";
            return (
              "<div class=\"" +
              cls +
              '"><div class="ref">QuoteRef · ' +
              q.ref +
              " · " +
              q.lp +
              " · " +
              q.eta +
              '</div><div class="row"><span>' +
              tag +
              pxLabel +
              '</span><span class="px">' +
              q.price.toFixed(4) +
              "</span></div></div>"
            );
          })
          .join("");

        if (panel) panel.classList.remove("hidden");
        if (toHall) toHall.href = "quotes.html?side=" + side + "&from=rfq";
        if (askAi)
          askAi.href =
            "ai.html?q=" + encodeURIComponent("RFQ " + rfqId + " 三档报价怎么选，帮我对比");

        if (window.showToast) window.showToast("已聚合 " + quotes.length + " 档做市方报价（演示）");
      });
    }
    refreshAiNudge();
    return Promise.resolve();
  }

  function refreshDisPreview() {
    var oid = document.getElementById("dis-order");
    var why = document.getElementById("dis-why");
    var note = document.getElementById("dis-note");
    var pv = document.getElementById("dis-preview");
    if (!pv) return;
    var oidVal = oid && oid.value ? oid.value : "（未选择）";
    var wtxt = why && why.options[why.selectedIndex] ? why.options[why.selectedIndex].text : "";
    var ntxt = note && note.value ? note.value.trim() : "（可补充转账流水等）";
    pv.innerHTML =
      "<strong>订单</strong> " +
      oidVal +
      "<br/><strong>类型</strong> " +
      wtxt +
      "<br/><strong>说明</strong> " +
      ntxt.replace(/</g, "");
  }

  function bootDispute() {
    var params = new URLSearchParams(location.search);
    var preset = params.get("orderId") || params.get("id");
    var backEl = document.getElementById("dis-back");
    if (preset && backEl) backEl.href = "order-detail.html?id=" + encodeURIComponent(preset);

    var toOrd = document.getElementById("dis-to-order");
    if (toOrd && preset) toOrd.href = "order-detail.html?id=" + encodeURIComponent(preset);

    return NxOtcStore.getAllOrders()
      .then(function (all) {
        var sel = document.getElementById("dis-order");
        if (!sel) return null;

        var list = all.filter(function (o) {
          return o.status !== "done" && o.status !== "dispute";
        });
        sel.innerHTML =
          '<option value="">请选择订单</option>' +
          list
            .map(function (o) {
              normO(o);
              return (
                '<option value="' +
                o.id +
                '">' +
                shortId(o.id) +
                " · " +
                (o.side === "sell" ? "卖" : "买") +
                " " +
                coinLabel(o.coinCode) +
                " · " +
                curFmtFiat(o.fiat, o.fiatCode) +
                " · " +
                tagText(o.status) +
                "</option>"
              );
            })
            .join("");

        if (preset) sel.value = preset;

        ["dis-order", "dis-why"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.addEventListener("change", refreshDisPreview);
        });
        var ta = document.getElementById("dis-note");
        if (ta) ta.addEventListener("input", refreshDisPreview);
        refreshDisPreview();

        var fin = document.getElementById("btn-dis-final");
        if (fin && !fin.dataset.disBound) {
          fin.dataset.disBound = "1";
          fin.addEventListener("click", function () {
            var oid = sel.value;
            if (!oid) {
              if (window.showToast) window.showToast("请先选择订单", "warn");
              return;
            }
            refreshDisPreview();
            NxOtcStore.getOrder(oid).then(function (ord) {
              if (!ord) return;
              var ticket = "ARB-" + Date.now().toString(36).toUpperCase();
              var body =
                "将对订单 " +
                oid +
                " 发起平台申诉。\n工单号（演示）：" +
                ticket +
                "\n请勿向站外透露短信/验证码。";

              function submit() {
                return NxOtcStore.putOrder(
                  Object.assign({}, ord, {
                    status: "dispute",
                    label: "申诉中",
                    ticketId: ticket,
                  })
                ).then(function () {
                  if (window.showToast) window.showToast("申诉已受理（演示）：" + ticket);
                  window.location.href = "order-detail.html?id=" + encodeURIComponent(oid);
                });
              }

              if (!window.ConfirmGate) {
                submit();
                return;
              }
              window.ConfirmGate.open({
                title: "最终确认：提交申诉",
                body: body,
                checkboxLabel: "本人确认上述信息真实，授权平台按规则调证与处置",
                confirmText: "确认提交",
                cancelText: "返回修改",
              }).then(function (ok) {
                if (ok) submit();
              });
            });
          });
        }
        return null;
      })
      .then(function () {
        refreshAiNudge();
      })
      .catch(function () {
        var sel = document.getElementById("dis-order");
        if (sel) sel.innerHTML = '<option value="">加载失败</option>';
      });
  }

  function renderHome() {
    var slot = $("#home-order-slot");
    if (!slot) return;
    return NxOtcStore.getAllOrders().then(function (all) {
      all.sort(function (a, b) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      var pick = NxOtcAI.pickActiveOrder(all) || all[0];
      if (!pick) {
        slot.innerHTML =
          '<p class="muted" style="margin:0;">暂无近期订单。去「交易」或点「买入」开始。</p>' +
          '<a href="quotes.html" class="btn btn-outline btn-block" style="margin-top:12px;">去交易大厅</a>';
        refreshAiNudge();
        return;
      }
      normO(pick);
      var href = "order-detail.html?id=" + encodeURIComponent(pick.id);
      var title = (pick.side === "sell" ? "卖出" : "买入") + " " + coinLabel(pick.coinCode);
      slot.innerHTML =
        '<a href="' +
        href +
        '" class="list-row" aria-label="订单详情">' +
        '<div><div class="name">' +
        title +
        " · " +
        (pick.label || tagText(pick.status)) +
        '</div><div class="sub mono">' +
        shortId(pick.id) +
        " · 更新于刚刚（演示）</div></div>" +
        '<div class="side">查看 →</div></a>';
      refreshAiNudge();
    });
  }

  function renderOrderList() {
    var root = $("#order-list-root");
    if (!root) return;

    function paint(filter) {
      return NxOtcStore.getAllOrders().then(function (all) {
        all.sort(function (a, b) {
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        var rows = all.filter(function (o) {
          var g = statusGroup(o.status);
          if (filter === "active") return g === "active";
          if (filter === "done") return g === "done";
          if (filter === "dispute") return g === "dispute";
          return true;
        });
        if (!rows.length) {
          root.innerHTML = '<p class="muted" style="padding:20px 8px;">这里没有订单。返回交易大厅下一笔。</p>';
          return all;
        }
        root.innerHTML = rows
          .map(function (o) {
            normO(o);
            var href =
              o.status === "done" ? "release.html?id=" + encodeURIComponent(o.id) : "order-detail.html?id=" + encodeURIComponent(o.id);
            var title = (o.side === "sell" ? "卖出" : "买入") + " " + coinLabel(o.coinCode);
            var tg = '<span class="tag ' + tagClass(o.status) + '">' + tagText(o.status) + "</span>";
            return (
              '<a href="' +
              href +
              '" class="list-row">' +
              "<div><div class=\"name\">" +
              title +
              '</div><div class="sub mono">' +
              shortId(o.id) +
              " · " +
              curFmtFiat(o.fiat, o.fiatCode) +
              "</div></div>" +
              '<div class="side">' +
              tg +
              "</div></a>"
            );
          })
          .join("");
        return all;
      });
    }

    return paint("active").then(function (all) {
      refreshAiNudge({ ordersSnapshot: all || [] });
      var group = document.querySelector(".chip-group");
      if (group) {
        group.addEventListener("click", function (e) {
          var chip = e.target.closest(".chip");
          if (!chip) return;
          var f = chip.getAttribute("data-filter") || "active";
          group.querySelectorAll(".chip").forEach(function (c) {
            c.classList.remove("on");
          });
          chip.classList.add("on");
          paint(f).then(function (all2) {
            refreshAiNudge({ ordersSnapshot: all2 || [] });
          });
        });
      }
    });
  }

  function renderTimeline(order) {
    var st = order.status;
    var s1 = true;
    var s2 = ["locked", "paying", "paid_pending", "releasing", "done"].indexOf(st) >= 0;
    var s3 = ["paying", "paid_pending", "releasing", "done"].indexOf(st) >= 0;
    var s4 = ["paid_pending", "releasing", "done"].indexOf(st) >= 0;

    function on(ok) {
      return ok ? " tl-item on" : " tl-item";
    }

    return (
      '<div class="timeline">' +
      '<div class="' +
      on(s1) +
      '"><div><div class="t">已创建</div><div class="d">订单生效</div></div></div>' +
      '<div class="' +
      on(s2) +
      '"><div><div class="t">托管</div><div class="d">资产锁定（示意）</div></div></div>' +
      '<div class="' +
      on(s3) +
      '"><div><div class="t">付款</div><div class="d">' +
      (st === "paying" ? "请按页面信息完成转账" : "付款阶段") +
      "</div></div></div>" +
      '<div class="' +
      on(s4) +
      '"><div><div class="t">对方放币</div><div class="d">链上确认后完成</div></div></div>' +
      "</div>"
    );
  }

  function renderOrderDetail() {
    var root = $("#od-root");
    if (!root) return Promise.resolve();

    return NxOtcStore.getAllOrders().then(function (all) {
      var params = new URLSearchParams(location.search);
      var id = params.get("id");
      if (!id) {
        var act = NxOtcAI.pickActiveOrder(all);
        if (act) {
          history.replaceState({}, "", "order-detail.html?id=" + encodeURIComponent(act.id));
          id = act.id;
        }
      }
      if (!id) {
        root.innerHTML =
          '<div class="card"><p class="muted">没有可展示的订单。先去下一笔交易。</p>' +
          '<a class="btn btn-primary btn-block" href="quotes.html">去大厅</a></div>';
        return null;
      }
      return NxOtcStore.getOrder(id).then(function (order) {
        if (!order) {
          root.innerHTML = '<div class="card"><p class="muted">找不到该订单（可能已清理演示库）。</p></div>';
          return null;
        }

        normO(order);

        var title =
          (order.side === "sell" ? "卖出" : "买入") + " " + coinLabel(order.coinCode) + " · " + tagText(order.status);

        var hint = "";
        if (order.status === "paying") {
          hint =
            '<div class="card" style="border-color:rgba(167,139,250,0.35);">' +
            '<div class="muted small">助手 · 下一步</div>' +
            '<p style="margin:8px 0 0;font-size:13px;">建议你现在进入付款页核对账户与金额；如遇要求「私下换卡」，请先停手并在安全中心核对。</p>' +
            '<div class="row-actions" style="margin-top:10px;">' +
            '<a class="btn btn-outline" href="ai.html?q=' +
            encodeURIComponent("我要付款，教我怎么核对") +
            '">问助手怎么核对</a>' +
            "</div></div>";
        }

        var canDispute = ["paying", "paid_pending", "locked", "releasing"].indexOf(order.status) >= 0;
        var disputeBlock = "";
        if (canDispute) {
          disputeBlock =
            '<div class="card" style="border-color:rgba(251,113,133,0.35);">' +
            '<h2 style="margin:0 0 8px;font-size:0.9rem;">交易争议</h2>' +
            '<p class="muted" style="font-size:13px;margin:0 0 12px;">若对方未按订单约定确认收款或放币，请通过平台申诉并上传凭证。<strong>关键操作均在站内完成</strong>。</p>' +
            '<a class="btn btn-danger-outline btn-block" href="dispute.html?orderId=' +
            encodeURIComponent(order.id) +
            '">进入申诉向导</a></div>';
        }

        root.innerHTML =
          '<div class="card">' +
          '<div class="muted small">订单号</div>' +
          '<div class="mono" style="font-size:15px;margin-bottom:10px;">' +
          order.id +
          "</div>" +
          '<div class="name" style="font-size:15px;font-weight:700;">' +
          title +
          "</div>" +
          '<p class="muted" style="margin:8px 0 0;">' +
          curFmtFiat(order.fiat, order.fiatCode) +
          " · 单价 " +
          order.price +
          "（" +
          order.fiatCode +
          "/" +
          order.coinCode +
          "） · 约 " +
          curFmtCoin(order.coin, order.coinCode) +
          "</p>" +
          "</div>" +
          disputeBlock +
          hint +
          '<div class="card"><h2>进度</h2>' +
          renderTimeline(order) +
          '<div class="row-actions stack">' +
          (order.status === "locked"
            ? '<a class="btn btn-primary btn-block" href="escrow.html?id=' +
              encodeURIComponent(order.id) +
              '">去托管签名</a>'
            : order.status === "paying"
            ? '<a class="btn btn-primary btn-block" href="pay.html?id=' +
              encodeURIComponent(order.id) +
              '">去付款</a>'
            : order.status === "paid_pending"
              ? '<a class="btn btn-primary btn-block" href="release.html?id=' +
                encodeURIComponent(order.id) +
                '">查看放币进度</a>'
              : "") +
          '<a class="btn btn-outline btn-block" href="cancel.html?id=' +
          encodeURIComponent(order.id) +
          '">取消/超时</a>' +
          '<a class="btn btn-ghost btn-block" href="ai.html?q=' +
          encodeURIComponent("帮我总结这笔订单我还要做什么") +
          '">让助手总结进度</a>' +
          "</div></div>";

        document.title = "订单 · " + shortId(order.id);
        refreshAiNudge({ order: order });
        return order;
      });
    });
  }

  function bootCreate() {
    var q = new URLSearchParams(location.search);
    var id = q.get("id");
    var merchant = q.get("merchant");
    var price = parseFloat(q.get("price") || "7.24");
    if (id) {
      fillCreate(id);
      return Promise.resolve();
    }
    id = "OTC-" + Date.now().toString(36).toUpperCase();
    var fiat = 100000;
    var coin = Math.round((fiat / price) * 100) / 100;
    var side = q.get("side") === "sell" ? "sell" : "buy";
    var pref = window.NxOtcCurrency ? NxOtcCurrency.getPreference() : { fiat: "CNY", coin: "USDT" };
    var fiatCode = q.get("fiatCode") || pref.fiat;
    var coinCode = q.get("coinCode") || pref.coin;
    return NxOtcStore.putOrder({
      id: id,
      side: side,
      fiatCode: fiatCode,
      coinCode: coinCode,
      fiat: fiat,
      coin: coin,
      price: price,
      merchant: merchant || "商家",
      status: "locked",
      label: "待托管签名",
      step: 2,
    }).then(function () {
      history.replaceState(
        {},
        "",
        "order-create.html?id=" +
          encodeURIComponent(id) +
          "&merchant=" +
          encodeURIComponent(merchant || "") +
          "&price=" +
          encodeURIComponent(String(price)) +
          "&side=" +
          encodeURIComponent(side) +
          "&fiatCode=" +
          encodeURIComponent(fiatCode) +
          "&coinCode=" +
          encodeURIComponent(coinCode)
      );
      fillCreate(id);
    });
  }

  function fillCreate(id) {
    return NxOtcStore.getOrder(id).then(function (o) {
      if (!o) return;
      normO(o);
      var tb = $("#oc-table");
      if (tb) {
        var sideSell = o.side === "sell";
        var qtyRow = sideSell
          ? "<tr><th>卖出数量（约）</th><td class=\"mono\">" + curFmtCoin(o.coin, o.coinCode) + "</td></tr>"
          : "<tr><th>买入数量（约）</th><td class=\"mono\">≈ " + curFmtCoin(o.coin, o.coinCode) + "</td></tr>";
        var moneyRow = sideSell
          ? "<tr><th>预计到账</th><td class=\"mono\">" + curFmtFiat(o.fiat, o.fiatCode) + "</td></tr>"
          : "<tr><th>应付金额</th><td class=\"mono\">" + curFmtFiat(o.fiat, o.fiatCode) + "</td></tr>";
        tb.innerHTML =
          "<tbody>" +
          "<tr><th>参考单价</th><td class=\"mono\">" +
          o.price +
          " " +
          o.fiatCode +
          "/" +
          o.coinCode +
          "</td></tr>" +
          qtyRow +
          moneyRow +
          "<tr><th>" +
          (sideSell ? "收购方" : "商家") +
          "</th><td>" +
          (o.merchant || "—") +
          "</td></tr>" +
          "</tbody>";
      }
      var esc = $("#btn-oc-confirm");
      if (esc && o) {
        var url = "escrow.html?id=" + encodeURIComponent(o.id);
        esc.onclick = function () {
          if (!window.ConfirmGate) {
            location.href = url;
            return;
          }
          var sideW = o.side === "sell" ? "卖出" : "买入";
          var body =
            "订单号 " +
            o.id +
            "\n方向 " +
            sideW +
            " " +
            o.coinCode +
            "\n单价 " +
            o.price +
            " " +
            o.fiatCode +
            "/" +
            o.coinCode +
            "\n名义约 " +
            curFmtFiat(o.fiat, o.fiatCode) +
            " · 数量约 " +
            fmtMoney(o.coin) +
            " " +
            o.coinCode +
            "\n对手 " +
            (o.merchant || "—") +
            "\n\n下一步将进入托管签名页。请勿将钱包操作交给他人代签。";
          window.ConfirmGate.open({
            title: "确认锁单并进入托管",
            body: body,
            checkboxLabel: "已核对单价、金额与对手方，知晓误签与钓鱼风险",
            confirmText: "确认并前往",
            cancelText: "先不签",
          }).then(function (ok) {
            if (ok) location.href = url;
          });
        };
      }
      var back = $("#oc-back-q");
      if (back) back.href = "quotes.html";
      refreshAiNudge({ order: o });
    });
  }

  function bootEscrow() {
    var q = new URLSearchParams(location.search);
    var id = q.get("id");
    if (!id) return Promise.resolve();
    return NxOtcStore.getOrder(id).then(function (o) {
      if (!o) return o;
      var el = $("#esc-order");
      if (el) el.textContent = shortId(o.id);
      var back = $("#esc-back");
      if (back) back.href = "order-create.html?id=" + encodeURIComponent(id);

      var toPay = $("#esc-to-pay");
      if (toPay) toPay.href = "pay.html?id=" + encodeURIComponent(id);
      var walletBtn = $("#btn-wallet");
      if (walletBtn && !walletBtn.dataset.walletBound) {
        walletBtn.dataset.walletBound = "1";
        walletBtn.addEventListener("click", function () {
          return NxOtcStore.putOrder(
            Object.assign({}, o, {
              status: "paying",
              label: "待付款",
              step: 3,
            })
          ).then(function () {
            if (window.showToast) window.showToast("已模拟签名：进入付款前请再次核对订单页信息");
            location.href = "pay.html?id=" + encodeURIComponent(id);
          });
        });
      }
      refreshAiNudge({ order: o });
      return o;
    });
  }

  function bootPay() {
    var q = new URLSearchParams(location.search);
    var id = q.get("id");
    if (!id) return Promise.resolve();
    return NxOtcStore.getOrder(id).then(function (o) {
      if (!o) return o;
      normO(o);
      var ref = $("#pay-order-ref");
      if (ref) ref.textContent = o.id;
      var amt = $("#pay-amount");
      if (amt) amt.textContent = curFmtFiat(o.fiat, o.fiatCode);

      var back = $("#pay-back");
      if (back) back.href = "order-detail.html?id=" + encodeURIComponent(id);

      var pl = $("#pay-later");
      if (pl) pl.href = "order-detail.html?id=" + encodeURIComponent(id);
      var ask = $("#pay-ask-ai");
      if (ask)
        ask.href =
          "ai.html?q=" + encodeURIComponent("我刚要付款，帮我核对这笔订单 " + id + " 的注意点");

      var btn = document.getElementById("btn-pay-submit");
      if (btn && !btn.dataset.payBound) {
        btn.dataset.payBound = "1";
        btn.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          var ck = document.getElementById("pay-ack");
          if (!ck || !ck.checked) {
            if (window.showToast) window.showToast("请先勾选页面上的付款确认项", "warn");
            return;
          }
          function doSubmit() {
            NxOtcStore.putOrder(
              Object.assign({}, o, {
                status: "paid_pending",
                label: "待放币",
                step: 4,
              })
            ).then(function () {
              if (window.showToast) window.showToast("已提交付款反馈：等待对方放币");
              window.location.href = "order-detail.html?id=" + encodeURIComponent(id);
            });
          }
          if (!window.ConfirmGate) {
            doSubmit();
            return;
          }
          var body =
            "订单 " +
            o.id +
            "\n申报金额 " +
            curFmtFiat(o.fiat, o.fiatCode) +
            "\n\n请再次确认：你将向**本页展示的官方收款信息**付款。站外私聊账户一律无效。\n提交后平台将通知对方核销。";
          window.ConfirmGate.open({
            title: "最终确认：已付款申报",
            body: body,
            checkboxLabel: "本人确认已按订单完成转账，愿配合核验与存证",
            confirmText: "确认提交",
            cancelText: "返回核对",
          }).then(function (ok) {
            if (ok) doSubmit();
          });
        });
      }
      refreshAiNudge({ order: o });
      return o;
    });
  }

  function bootRelease() {
    var q = new URLSearchParams(location.search);
    var id = q.get("id");
    var relOrder = $("#rel-order");
    var relTx = $("#rel-tx");
    var relAsk = $("#rel-ask-ai");
    if (id) {
      if (relOrder) relOrder.textContent = "订单 " + id;
      if (relTx && id) {
        var tail = id
          .split("")
          .reduce(function (a, c) {
            return a + c.charCodeAt(0);
          }, 0) % 4096;
        relTx.textContent = "0x" + tail.toString(16) + "…c91f";
      }
      if (relAsk) relAsk.href = "ai.html?q=" + encodeURIComponent("订单 " + id + " 完成后我还要注意什么？");
    }
    if (!id) return Promise.resolve();
    return NxOtcStore.getOrder(id).then(function (o) {
      if (!o) return o;
      if (o.status !== "done") {
        return NxOtcStore.putOrder(
          Object.assign({}, o, {
            status: "done",
            label: "已完成",
            step: 5,
          })
        ).then(function (ord) {
          refreshAiNudge({ order: ord || o });
          return ord;
        });
      }
      refreshAiNudge({ order: o });
      return o;
    });
  }

  function scrollAiToEnd() {
    var el = $("#ai-thread");
    if (el) el.scrollTop = el.scrollHeight;
  }

  function renderAiMessage(m) {
    var wrap = document.createElement("div");
    wrap.className = m.role === "user" ? "msg user" : "msg bot";
    var who = document.createElement("div");
    who.className = "who";
    who.textContent = m.role === "user" ? "你" : "NX 助手";
    wrap.appendChild(who);
    wrap.appendChild(document.createTextNode(m.text));
    return wrap;
  }

  function renderAiActions(actions) {
    if (!actions || !actions.length) return null;
    var bar = document.createElement("div");
    bar.className = "ai-quick-actions";
    actions.forEach(function (a) {
      var b = document.createElement("a");
      b.className = "btn btn-ghost btn-block";
      b.style.marginBottom = "8px";
      b.textContent = a.label;
      if (a.href) b.href = a.href;
      else b.href = "#";
      bar.appendChild(b);
    });
    return bar;
  }

  function bootAiChat() {
    var thread = $("#ai-thread");
    var input = $("#ai-input");
    var send = $("#btn-ai-send");
    var clr = $("#btn-ai-clear");
    if (!thread || !input || !send) return Promise.resolve();

    function ctxFromOrders(all) {
      var act = NxOtcAI.pickActiveOrder(all);
      return { activeOrderId: act ? act.id : null };
    }

    function appendBotBundle(text, actions, risk) {
      return NxOtcStore.addAiMessage("assistant", text, { actions: actions, risk: risk }).then(function (row) {
        thread.appendChild(renderAiMessage(row));
        if (risk) {
          var tip = document.createElement("div");
          tip.className = "hint-box";
          tip.style.marginTop = "10px";
          tip.innerHTML = "<strong>风险提示</strong><p class=\"small\" style=\"margin:6px 0 0\">" + risk + "</p>";
          thread.appendChild(tip);
        }
        var actBar = renderAiActions(actions);
        if (actBar) thread.appendChild(actBar);
        scrollAiToEnd();
      });
    }

    function handleUserText(raw) {
      var t = (raw || "").trim();
      if (!t) return Promise.resolve();
      return NxOtcStore.addAiMessage("user", t).then(function (um) {
        thread.appendChild(renderAiMessage(um));
        scrollAiToEnd();
        return NxOtcStore.getAllOrders().then(function (all) {
          var ctx = ctxFromOrders(all);
          if (/(\d)/.test(t)) {
            var hint = NxOtcAI.extractMoney(t);
            if (hint) NxOtcStore.setKv("draft_fiat", hint);
          }
          var pack = NxOtcAI.reply(t, ctx);
          return appendBotBundle(pack.reply, pack.actions, pack.riskTip);
        });
      });
    }

    return NxOtcStore.getAiMessages().then(function (list) {
      thread.innerHTML = "";
      if (!list.length) {
        thread.appendChild(
          renderAiMessage({
            role: "assistant",
            text:
              "你好，我是 NX OTC 交易助手（演示）。你可以说：**询价/多档报价**、**走完一笔 OTC 全流程**、买入 10 万 USDT、查订单、付款要注意什么、**发起申诉** 等。转账、托管与申诉等关键动作只在站内页面完成，并带二次确认。",
          })
        );
      } else {
        list.forEach(function (m) {
          thread.appendChild(renderAiMessage(m));
        });
      }
      scrollAiToEnd();

      var q = new URLSearchParams(location.search).get("q");
      if (q) {
        input.value = q;
        handleUserText(q).then(function () {
          input.value = "";
        });
      }

      send.addEventListener("click", function () {
        var v = input.value;
        input.value = "";
        handleUserText(v);
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send.click();
        }
      });

      if (clr) {
        clr.addEventListener("click", function () {
          NxOtcStore.clearAiMessages().then(function () {
            if (window.showToast) window.showToast("对话已清空");
            thread.innerHTML = "";
            thread.appendChild(
              renderAiMessage({
                role: "assistant",
                text: "已清空上下文。你可以继续问：买入、订单进度、付款核对、防骗指南等。",
              })
            );
            scrollAiToEnd();
          });
        });
      }

      document.querySelectorAll("[data-ai-suggest]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          input.value = btn.getAttribute("data-text") || (btn.textContent || "").trim();
          send.click();
        });
      });

      refreshAiNudge();
      return null;
    });
  }

  function bootProfile() {
    var fiatSel = document.getElementById("pref-fiat");
    var coinSel = document.getElementById("pref-coin");
    if (!fiatSel || !coinSel || !window.NxOtcCurrency) return Promise.resolve();
    var F = NxOtcCurrency.FIAT;
    var C = NxOtcCurrency.CRYPTO;
    fiatSel.innerHTML = Object.keys(F)
      .map(function (k) {
        return '<option value="' + k + '">' + k + " · " + F[k].label + "</option>";
      })
      .join("");
    coinSel.innerHTML = Object.keys(C)
      .map(function (k) {
        return '<option value="' + k + '">' + k + "</option>";
      })
      .join("");
    return Promise.all([NxOtcStore.getKv("pref_fiat"), NxOtcStore.getKv("pref_coin")]).then(function (vals) {
      NxOtcCurrency.setPreference(vals[0], vals[1]);
      var p = NxOtcCurrency.getPreference();
      fiatSel.value = p.fiat;
      coinSel.value = p.coin;
      function save() {
        var nf = fiatSel.value;
        var nc = coinSel.value;
        NxOtcCurrency.setPreference(nf, nc);
        return Promise.all([NxOtcStore.setKv("pref_fiat", nf), NxOtcStore.setKv("pref_coin", nc)]).then(function () {
          if (window.showToast) window.showToast("已保存：" + NxOtcCurrency.pairSlash());
        });
      }
      if (!fiatSel.dataset.currBound) {
        fiatSel.dataset.currBound = "1";
        coinSel.dataset.currBound = "1";
        fiatSel.addEventListener("change", save);
        coinSel.addEventListener("change", save);
      }
      return null;
    })
      .then(function () {
        refreshAiNudge();
      });
  }

  function refreshAiNudge(extra) {
    if (!window.NxOtcAiHints || !window.NxOtcAiHints.mount) return;
    var b = document.body.getAttribute("data-boot");
    window.NxOtcAiHints.mount(Object.assign({ boot: b }, extra || {}));
  }

  window.refreshAiNudge = refreshAiNudge;

  function initFab() {
    if (document.body.getAttribute("data-ai-fab") === "0") return;
    if (!document.body.hasAttribute("data-tab")) return;
    if ($(".ai-fab")) return;
    var a = document.createElement("a");
    a.className = "ai-fab";
    a.href =
      "ai.html?from=" +
      encodeURIComponent(document.body.getAttribute("data-tab") || "tab") +
      "&q=" +
      encodeURIComponent("帮我推荐下一步该怎么做");
    a.textContent = "AI";
    a.setAttribute("aria-label", "打开智能助手");
    document.body.appendChild(a);
  }

  function boot() {
    if (!window.NxOtcStore) return Promise.resolve();
    return NxOtcStore.ready()
      .then(loadCurrencyPrefs)
      .then(function () {
        applyShellPair();
        var b = document.body.getAttribute("data-boot");
        if (b === "home") return renderHome().then(initFab);
        if (b === "quotes") return bootQuotes().then(initFab);
        if (b === "rfq") return bootRfq();
        if (b === "dispute") return bootDispute();
        if (b === "orders") return renderOrderList().then(initFab);
        if (b === "detail") return renderOrderDetail().then(initFab);
        if (b === "create") return bootCreate().then(initFab);
        if (b === "escrow") return bootEscrow().then(initFab);
        if (b === "pay") return bootPay();
        if (b === "release") return bootRelease();
        if (b === "ai") return bootAiChat();
        if (b === "profile") return bootProfile();
        if (document.body.hasAttribute("data-tab")) initFab();
        return null;
      });
  }

  window.NxOtcUi = {
    boot: boot,
  };
})();
