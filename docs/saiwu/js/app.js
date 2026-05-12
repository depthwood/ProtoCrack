/**
 * 主题、时钟、现场计时器、首页轮播
 */
(function () {
  var THEME_KEY = "saiwu-theme";
  var META_COLORS = { dark: "#0a0f1a", light: "#e8eef4" };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function getTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return "dark";
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", META_COLORS[theme] || META_COLORS.dark);
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      toggle.setAttribute("title", theme === "dark" ? "浅色模式" : "深色模式");
      toggle.textContent = theme === "dark" ? "☀" : "☾";
    }
  }

  /* 若 head 内联脚本未写入，则用 localStorage 补齐 */
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      if (!document.documentElement.getAttribute("data-theme")) {
        applyTheme(saved);
      }
    }
  } catch (e) {}

  applyTheme(getTheme());

  var toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
  }

  function tickClock() {
    var el = document.getElementById("clock-now");
    if (!el) return;
    var d = new Date();
    el.textContent =
      pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  tickClock();
  setInterval(tickClock, 1000);

  var timerEl = document.getElementById("timer-elapsed");
  var timerBtn = document.getElementById("timer-toggle");
  if (timerEl && timerBtn) {
    var running = false;
    var startMs = 0;
    var accMs = 0;
    var raf = 0;

    function renderTimer() {
      var ms = accMs + (running ? Date.now() - startMs : 0);
      var s = Math.floor(ms / 1000);
      var m = Math.floor(s / 60);
      s = s % 60;
      var h = Math.floor(m / 60);
      m = m % 60;
      timerEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
    }

    function loopTimer() {
      renderTimer();
      if (running) raf = requestAnimationFrame(loopTimer);
    }

    timerBtn.addEventListener("click", function () {
      if (!running) {
        running = true;
        startMs = Date.now();
        timerBtn.textContent = "暂停计时";
        loopTimer();
      } else {
        running = false;
        accMs += Date.now() - startMs;
        cancelAnimationFrame(raf);
        timerBtn.textContent = "开始 / 继续";
        renderTimer();
      }
    });
  }

  /* 轮播 */
  function initCarousel(root) {
    var track = root.querySelector(".carousel-track");
    var viewport = root.querySelector(".carousel-viewport");
    if (!track || !viewport) return;

    var slides = track.querySelectorAll(".carousel-slide");
    var prevBtn = root.querySelector(".carousel-prev");
    var nextBtn = root.querySelector(".carousel-next");
    var dotsRoot = root.querySelector(".carousel-dots");
    var n = slides.length;
    if (n < 1) return;

    var index = 0;
    var autoMs = 5200;
    var timer = 0;
    var reducedMotion =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    function goTo(i, instant) {
      index = ((i % n) + n) % n;
      if (instant) track.classList.add("is-no-transition");
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (instant) {
        requestAnimationFrame(function () {
          track.classList.remove("is-no-transition");
        });
      }
      if (dotsRoot) {
        var dots = dotsRoot.querySelectorAll(".carousel-dot");
        for (var d = 0; d < dots.length; d++) {
          dots[d].setAttribute("aria-current", d === index ? "true" : "false");
        }
      }
      root.setAttribute("data-carousel-index", String(index));
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function scheduleAuto() {
      clearTimeout(timer);
      if (reducedMotion || n < 2) return;
      timer = setTimeout(function () {
        next();
        scheduleAuto();
      }, autoMs);
    }

    function pauseAuto() {
      clearTimeout(timer);
    }

    if (dotsRoot && n > 0) {
      dotsRoot.innerHTML = "";
      for (var i = 0; i < n; i++) {
        (function (j) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "carousel-dot";
          b.setAttribute("aria-label", "第 " + (j + 1) + " 张");
          b.addEventListener("click", function () {
            goTo(j);
            scheduleAuto();
          });
          dotsRoot.appendChild(b);
        })(i);
      }
    }

    goTo(0, true);
    scheduleAuto();

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        scheduleAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        scheduleAuto();
      });
    }

    root.addEventListener("mouseenter", pauseAuto);
    root.addEventListener("mouseleave", scheduleAuto);
    root.addEventListener("focusin", pauseAuto);
    root.addEventListener("focusout", scheduleAuto);

    var sx = 0;
    var dragging = false;
    viewport.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        sx = e.touches[0].clientX;
        dragging = true;
        pauseAuto();
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      function (e) {
        if (!dragging) return;
        dragging = false;
        var end = e.changedTouches && e.changedTouches[0];
        if (!end) {
          scheduleAuto();
          return;
        }
        var dx = end.clientX - sx;
        if (dx > 50) prev();
        else if (dx < -50) next();
        scheduleAuto();
      },
      { passive: true }
    );
  }

  var carousels = document.querySelectorAll("[data-carousel]");
  for (var c = 0; c < carousels.length; c++) {
    initCarousel(carousels[c]);
  }
})();
