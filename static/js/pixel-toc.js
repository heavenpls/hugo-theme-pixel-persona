(function () {
  var toc = document.querySelector("[data-enhanced-toc]");
  if (!toc) return;

  var tocBody = toc.querySelector("[data-toc-scroll]");
  var links = Array.prototype.slice.call(
    toc.querySelectorAll(".pixel-toc__body a[href*='#']")
  );

  if (!tocBody || !links.length) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  var activeId = null;
  var ticking = false;
  var pendingItem = null;
  var pendingUntil = 0;

  function decodeHash(hash) {
    try {
      return decodeURIComponent(hash.replace(/^#/, ""));
    } catch (error) {
      return hash.replace(/^#/, "");
    }
  }

  function resolveTarget(link) {
    var href = link.getAttribute("href") || "";
    var hashIndex = href.indexOf("#");
    if (hashIndex === -1) return null;

    var hash = href.slice(hashIndex);
    var id = decodeHash(hash);
    var target = document.getElementById(id);

    if (!target && hash) {
      try {
        target = document.querySelector(hash);
      } catch (error) {
        target = null;
      }
    }

    if (!target) return null;

    return {
      id: id,
      link: link,
      target: target
    };
  }

  var items = links.map(resolveTarget).filter(Boolean);
  if (!items.length) return;

  function syncScrollShadows() {
    var maxScrollTop = tocBody.scrollHeight - tocBody.clientHeight;
    var scrollTop = tocBody.scrollTop;

    toc.classList.toggle("has-shadow-top", scrollTop > 2);
    toc.classList.toggle("has-shadow-bottom", maxScrollTop - scrollTop > 2);
  }

  function currentSectionOffset() {
    var header = document.querySelector(".pixel-site-header");
    return (header ? header.getBoundingClientRect().height : 0) + 18;
  }

  function setActive(item, smoothReveal) {
    if (!item || activeId === item.id) return;

    activeId = item.id;

    items.forEach(function (entry) {
      var isActive = entry.id === item.id;
      entry.link.classList.toggle("is-active", isActive);
      if (isActive) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    });

    revealLink(item.link, smoothReveal);
  }

  function revealLink(link, smoothReveal) {
    var bodyRect = tocBody.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    var delta = 0;
    var padding = 12;

    if (linkRect.top < bodyRect.top + padding) {
      delta = linkRect.top - bodyRect.top - padding;
    } else if (linkRect.bottom > bodyRect.bottom - padding) {
      delta = linkRect.bottom - bodyRect.bottom + padding;
    }

    if (!delta) return;

    tocBody.scrollBy({
      top: delta,
      behavior:
        smoothReveal && !prefersReducedMotion.matches ? "smooth" : "auto"
    });
  }

  function pickActiveItem() {
    if (pendingItem) {
      var pendingDelta =
        pendingItem.target.getBoundingClientRect().top - currentSectionOffset();

      if (Math.abs(pendingDelta) <= 24) {
        pendingItem = null;
        pendingUntil = 0;
      } else if (Date.now() < pendingUntil) {
        setActive(pendingItem, false);
        return;
      } else {
        pendingItem = null;
        pendingUntil = 0;
      }
    }

    var offset = currentSectionOffset();
    var candidate = items[0];

    items.forEach(function (item) {
      if (item.target.getBoundingClientRect().top - offset <= 0) {
        candidate = item;
      }
    });

    setActive(candidate, false);
  }

  function requestSync() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      pickActiveItem();
      ticking = false;
    });
  }

  tocBody.addEventListener("scroll", syncScrollShadows, { passive: true });

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", function () {
    syncScrollShadows();
    requestSync();
  });

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var item = resolveTarget(link);
      if (item) {
        event.preventDefault();
        pendingItem = item;
        pendingUntil = Date.now() + 900;
        setActive(item, true);

        window.scrollTo({
          top: Math.max(
            window.scrollY +
              item.target.getBoundingClientRect().top -
              currentSectionOffset(),
            0
          ),
          behavior: prefersReducedMotion.matches ? "auto" : "smooth"
        });

        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", "#" + item.id);
        } else {
          window.location.hash = item.id;
        }
      }
      window.setTimeout(requestSync, 180);
    });
  });

  window.addEventListener("hashchange", requestSync);

  syncScrollShadows();
  requestSync();
})();
