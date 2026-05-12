(function () {
  "use strict";

  /**
   * OTC 多币种（法币腿 / 加密腿）注册表与格式化。
   * 报价与汇率在此原型中为演示数据；接入真实环境时请改由后端返回。
   */
  var FIAT = {
    CNY: { label: "人民币", sym: "¥", decimals: 2 },
    HKD: { label: "港币", sym: "HK$", decimals: 2 },
    USD: { label: "美元", sym: "$", decimals: 2 },
  };
  var CRYPTO = {
    USDT: { label: "USDT", decimals: 4 },
    USDC: { label: "USDC", decimals: 4 },
  };

  var prefFiat = "CNY";
  var prefCoin = "USDT";

  /** 演示参考：1 单位 crypto 折合多少 fiat（非实时） */
  var DEMO_RATE = {
    USDT: { CNY: 7.24, HKD: 7.82, USD: 1.0 },
    USDC: { CNY: 7.23, HKD: 7.81, USD: 1.0 },
  };

  function setPreference(fiat, coin) {
    if (fiat && FIAT[fiat]) prefFiat = fiat;
    if (coin && CRYPTO[coin]) prefCoin = coin;
  }

  function getPreference() {
    return { fiat: prefFiat, coin: prefCoin };
  }

  function normalizeOrder(o) {
    if (!o || typeof o !== "object") return o;
    o.fiatCode = o.fiatCode || "CNY";
    o.coinCode = o.coinCode || "USDT";
    return o;
  }

  function formatFiat(amount, code) {
    var fc = code || prefFiat;
    var c = FIAT[fc] || FIAT.CNY;
    var n = Number(amount);
    if (n == null || isNaN(n)) return "—";
    return c.sym + " " + n.toLocaleString("zh-CN", { maximumFractionDigits: c.decimals !== undefined ? c.decimals : 2 });
  }

  function formatCoinAmt(amount, coinCode) {
    var cc = coinCode || prefCoin;
    var c = CRYPTO[cc] || CRYPTO.USDT;
    var n = Number(amount);
    if (n == null || isNaN(n)) return "—";
    return n.toLocaleString("zh-CN", { maximumFractionDigits: c.decimals !== undefined ? c.decimals : 4 }) + " " + cc;
  }

  function pairSlash() {
    return prefCoin + " / " + prefFiat;
  }

  function fiatLabelLine() {
    var f = FIAT[prefFiat];
    return f ? "法币 · " + prefFiat + "（" + f.label + "）" : "法币 · " + prefFiat;
  }

  function estimateFiatFromCoin(coinAmount, coin, fiat) {
    var cc = coin || prefCoin;
    var fc = fiat || prefFiat;
    var table = DEMO_RATE[cc];
    if (!table) return null;
    var r = table[fc];
    if (r == null || r === undefined) return null;
    return Number(coinAmount) * r;
  }

  window.NxOtcCurrency = {
    FIAT: FIAT,
    CRYPTO: CRYPTO,
    DEFAULT_FIAT: "CNY",
    DEFAULT_COIN: "USDT",
    setPreference: setPreference,
    getPreference: getPreference,
    normalizeOrder: normalizeOrder,
    formatFiat: formatFiat,
    formatCoin: formatCoinAmt,
    pairSlash: pairSlash,
    fiatLabelLine: fiatLabelLine,
    estimateFiatFromCoin: estimateFiatFromCoin,
  };
})();
