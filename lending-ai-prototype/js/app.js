/**
 * 主题：存储用户选择，与系统偏好协同
 */
(function () {
  const STORAGE_KEY = "lending-ai-theme";
  const root = document.documentElement;

  function getSystemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function getResolvedDark() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return getSystemDark();
  }

  function syncAppearanceAttr() {
    root.setAttribute("data-appearance", getResolvedDark() ? "dark" : "light");
  }

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
    syncAppearanceAttr();
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else {
      applyTheme("system");
    }
  }

  function cycleTheme() {
    const current = localStorage.getItem(STORAGE_KEY);
    let next;
    if (current === "light") next = "dark";
    else if (current === "dark") next = "system";
    else next = "light";

    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY);
      applyTheme("system");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    }

    syncToggleLabel();
  }

  function syncToggleLabel() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.setAttribute(
      "aria-label",
      getResolvedDark() ? "切换为明亮模式" : "切换为黑夜模式"
    );
    const saved = localStorage.getItem(STORAGE_KEY);
    btn.title =
      saved === null ? "主题：跟随系统（点击切换）" : "主题：" + saved + "（点击切换）";
    syncAppearanceAttr();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    syncToggleLabel();
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", cycleTheme);

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function () {
          if (!localStorage.getItem(STORAGE_KEY)) {
            syncToggleLabel();
          }
        });
    }

    const tabButtons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".panel");

    function syncPanelHidden() {
      panels.forEach(function (p) {
        p.hidden = !p.classList.contains("is-active");
      });
    }

    syncPanelHidden();

    tabButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        const id = b.getAttribute("data-panel");
        tabButtons.forEach(function (x) {
          x.classList.toggle("is-active", x === b);
          x.setAttribute("aria-selected", x === b ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.id === "panel-" + id);
        });
        syncPanelHidden();
      });
    });
  });
})();
