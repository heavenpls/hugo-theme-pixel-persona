(function () {
  var storageKey = "pixel-theme";
  var root = document.documentElement;
  var buttons = document.querySelectorAll(".pixel-theme-toggle");

  function currentTheme() {
    return root.getAttribute("data-theme") || "light";
  }

  function syncButtons(theme) {
    buttons.forEach(function (button) {
      var state = button.querySelector(".pixel-theme-toggle__state");
      button.setAttribute("aria-pressed", String(theme === "dark"));
      if (state) {
        state.textContent = theme === "dark" ? "DARK" : "LIGHT";
      }
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      /* ignore storage failures */
    }
    syncButtons(theme);
  }

  syncButtons(currentTheme());

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
})();
