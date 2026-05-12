(function () {
  "use strict";

  function ensureToastRoot() {
    var root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      root.className = "toast-root";
      root.setAttribute("aria-live", "polite");
      document.body.appendChild(root);
    }
    return root;
  }

  function showToast(message, kind) {
    var root = ensureToastRoot();
    var t = document.createElement("div");
    t.className = "toast" + (kind === "warn" ? " toast-warn" : "");
    t.textContent = message;
    root.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("show");
    });
    window.setTimeout(function () {
      t.classList.remove("show");
      window.setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 280);
    }, 2400);
  }

  function markPressed(el) {
    if (!el || el.tagName !== "BUTTON") return;
    el.classList.add("btn-pressed");
    window.setTimeout(function () {
      el.classList.remove("btn-pressed");
    }, 200);
  }

  function setTabActive() {
    var tab = document.body.getAttribute("data-tab");
    if (!tab) return;
    document.querySelectorAll("nav.bottom-tabs a[data-tab]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    });
  }

  function initChips() {
    document.querySelectorAll(".chip-group[data-chip-app]").forEach(function (group) {
      group.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          group.querySelectorAll(".chip").forEach(function (c) {
            c.classList.remove("on");
          });
          chip.classList.add("on");
          markPressed(chip);
          showToast("已切换为：" + (chip.textContent || "").trim());
        });
      });
    });
  }

  function initButtons() {
    document.querySelectorAll("button.btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.id === "btn-pay-submit" || btn.id === "btn-wallet" || btn.id === "btn-ai-send" || btn.id === "btn-ai-clear" || btn.id === "btn-oc-confirm" || btn.id === "btn-dis-final" || btn.id === "btn-rfq-fetch") {
          return;
        }

        if (btn.id === "btn-ai-cancel") {
          markPressed(btn);
          showToast("已取消本次确认");
          return;
        }

        markPressed(btn);
        var label = (btn.textContent || "").trim() || "操作";
        showToast("已完成：" + label);
      });
    });
  }

  function initLinkFeedback() {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      a.addEventListener("click", function () {
        a.style.opacity = "0.82";
        window.setTimeout(function () {
          a.style.opacity = "";
        }, 120);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.showToast = showToast;
    setTabActive();
    initChips();
    initButtons();
    initLinkFeedback();
    if (window.NxOtcUi && typeof window.NxOtcUi.boot === "function") {
      window.NxOtcUi.boot();
    }
  });
})();
