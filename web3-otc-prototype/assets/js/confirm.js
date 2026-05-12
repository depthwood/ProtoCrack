(function () {
  "use strict";

  /**
   * @param {{ title?: string, body?: string, checkboxLabel?: string, confirmText?: string, cancelText?: string }} opts
   * @returns {Promise<boolean>}
   */
  function open(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var mask = document.createElement("div");
      mask.className = "cg-mask";
      mask.setAttribute("role", "dialog");
      mask.setAttribute("aria-modal", "true");

      var panel = document.createElement("div");
      panel.className = "cg-panel";

      var title = document.createElement("div");
      title.className = "cg-title";
      title.textContent = opts.title || "请确认";

      var body = document.createElement("div");
      body.className = "cg-body";
      if (opts.body) {
        body.textContent = opts.body;
      }

      var ckWrap = document.createElement("label");
      ckWrap.className = "cg-check";
      var ck = document.createElement("input");
      ck.type = "checkbox";
      ck.id = "cg-ack";
      var ckSpan = document.createElement("span");
      ckSpan.textContent = opts.checkboxLabel || "我已阅读并确认上述信息";
      ckWrap.appendChild(ck);
      ckWrap.appendChild(ckSpan);

      var actions = document.createElement("div");
      actions.className = "cg-actions";
      var btnCancel = document.createElement("button");
      btnCancel.type = "button";
      btnCancel.className = "btn btn-outline";
      btnCancel.textContent = opts.cancelText || "取消";
      var btnOk = document.createElement("button");
      btnOk.type = "button";
      btnOk.className = "btn btn-primary";
      btnOk.textContent = opts.confirmText || "确认";

      function cleanup(result) {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
        resolve(result);
      }

      btnCancel.addEventListener("click", function () {
        cleanup(false);
      });
      btnOk.addEventListener("click", function () {
        if (!ck.checked) {
          if (window.showToast) window.showToast("请先勾选确认项", "warn");
          return;
        }
        cleanup(true);
      });
      mask.addEventListener("click", function (e) {
        if (e.target === mask) cleanup(false);
      });

      actions.appendChild(btnCancel);
      actions.appendChild(btnOk);
      panel.appendChild(title);
      if (opts.body) panel.appendChild(body);
      panel.appendChild(ckWrap);
      panel.appendChild(actions);
      mask.appendChild(panel);
      document.body.appendChild(mask);
      ck.focus();
    });
  }

  window.ConfirmGate = { open: open };
})();
