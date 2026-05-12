/**
 * 主题、长辈模式、时钟、Toast、演示按钮、AI 对话
 */
(function () {
  var THEME_KEY = "yiliao-theme";
  var ELDERLY_KEY = "yiliao-elderly";
  var META_COLORS = { dark: "#0c1220", light: "#e8eef2" };
  var toastTimer = 0;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function showToast(message) {
    if (!message) return;
    var prev = document.querySelectorAll(".app-toast");
    for (var i = 0; i < prev.length; i++) prev[i].remove();
    if (toastTimer) clearTimeout(toastTimer);
    var el = document.createElement("div");
    el.className = "app-toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("app-toast--show");
    });
    toastTimer = setTimeout(function () {
      el.classList.remove("app-toast--show");
      setTimeout(function () {
        el.remove();
      }, 240);
    }, 2400);
  }

  function getTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return "light";
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", META_COLORS[theme] || META_COLORS.light);
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      toggle.setAttribute("title", theme === "dark" ? "浅色模式" : "深色模式");
      toggle.textContent = theme === "dark" ? "☀" : "☾";
    }
  }

  function applyElderly(on) {
    document.documentElement.setAttribute("data-elderly", on ? "true" : "false");
    try {
      localStorage.setItem(ELDERLY_KEY, on ? "1" : "0");
    } catch (e) {}
    var sw = document.getElementById("elderly-switch");
    if (sw) sw.checked = on;
  }

  function getElderly() {
    return document.documentElement.getAttribute("data-elderly") === "true";
  }

  try {
    var savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      if (!document.documentElement.getAttribute("data-theme")) {
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    }
    var savedElderly = localStorage.getItem(ELDERLY_KEY);
    if (savedElderly === "1" || savedElderly === "0") {
      if (!document.documentElement.getAttribute("data-elderly")) {
        document.documentElement.setAttribute("data-elderly", savedElderly === "1" ? "true" : "false");
      }
    }
  } catch (e) {}

  if (!document.documentElement.getAttribute("data-elderly")) {
    document.documentElement.setAttribute("data-elderly", "false");
  }
  applyTheme(getTheme());

  var toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var next = getTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      showToast(next === "dark" ? "已切换为深色模式" : "已切换为浅色模式");
    });
  }

  var elderlySwitch = document.getElementById("elderly-switch");
  if (elderlySwitch) {
    elderlySwitch.checked = getElderly();
    elderlySwitch.addEventListener("change", function () {
      applyElderly(elderlySwitch.checked);
      showToast(elderlySwitch.checked ? "已开启长辈模式（更大字号）" : "已关闭长辈模式");
    });
  }

  document.body.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var hit = t.closest("[data-toast-msg]");
    if (!hit) return;
    var msg = hit.getAttribute("data-toast-msg");
    if (msg) showToast(msg);
  });

  function tickClock() {
    var el = document.getElementById("clock-now");
    if (!el) return;
    var d = new Date();
    el.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  tickClock();
  setInterval(tickClock, 15000);

  var aiSend = document.getElementById("ai-send-btn");
  var aiInput = document.getElementById("ai-input");
  function syncAiSendState() {
    if (!aiSend || !aiInput) return;
    var ok = !!(aiInput.value || "").trim();
    aiSend.disabled = !ok;
    aiSend.setAttribute("aria-disabled", ok ? "false" : "true");
  }
  if (aiSend && aiInput) {
    syncAiSendState();
    aiInput.addEventListener("input", syncAiSendState);
    aiInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        aiSend.click();
      }
    });
    aiSend.addEventListener("click", function () {
      var text = (aiInput.value || "").trim();
      if (!text) {
        showToast("请先输入问题");
        return;
      }
      var wrap = document.querySelector(".ai-chat");
      if (!wrap) return;
      showToast("已发送（演示）");
      var u = document.createElement("div");
      u.className = "bubble bubble--user";
      u.textContent = text;
      wrap.appendChild(u);
      var a = document.createElement("div");
      a.className = "bubble bubble--ai";
      a.textContent =
        "（演示）建议您先打开「行程」查看下一站；具体诊疗请以护士台或医生说明为准。如需解释报告用语，可说明是哪一份检查。";
      wrap.appendChild(a);
      aiInput.value = "";
      syncAiSendState();
      wrap.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }
})();
