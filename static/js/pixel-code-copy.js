(function () {
  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    fallbackCopy(text);
  }

  function setCopiedState(button, copied) {
    var label = button.querySelector(".pixel-code-copy__label");
    var defaultText = button.getAttribute("data-copy-default") || "复制代码";
    var successText = button.getAttribute("data-copy-success") || "已复制";
    button.classList.toggle("is-copied", copied);
    if (label) {
      label.textContent = copied ? successText : defaultText;
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".pixel-code-copy");
    if (!button) return;

    var block = button.closest(".pixel-code-block");
    var code = block && block.querySelector("pre code");
    if (!code) return;

    copyText(code.textContent || "").then(function () {
      setCopiedState(button, true);
      window.setTimeout(function () {
        setCopiedState(button, false);
      }, 1800);
    }).catch(function () {
      setCopiedState(button, false);
    });
  });
})();
