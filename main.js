(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = $(".navToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("navOpen");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu on link click
    $$(".nav a").forEach(a => a.addEventListener("click", () => {
      document.body.classList.remove("navOpen");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Reveal on view
  const revealEls = $$("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));

  // Autoplay videos only in view (keeps performance clean)
  const videos = $$(".js-autoVideo");
  const vio = new IntersectionObserver((entries) => {
    entries.forEach(async e => {
      const v = e.target;
      try {
        if (e.isIntersecting) {
          // Some browsers require user gesture; but muted+playsinline usually works
          await v.play();
        } else {
          v.pause();
        }
      } catch (_) {
        // Ignore autoplay failures
      }
    });
  }, { threshold: 0.35 });

  videos.forEach(v => vio.observe(v));

  // Parallax (images + cards)
  const parallaxEls = $$("[data-parallax]");
  let latestY = 0;
  let ticking = false;

  function onScroll() {
    latestY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
    updateProgress();
  }
  // Hide video blocks if media fails to load (prevents empty spaces)
  function hideIfMissingMedia(el, fallbackSelector) {
    if (!el) return;

    el.addEventListener("error", () => {
      // hide the container if a big video panel fails
      const panel = el.closest(".videoPanel");
      if (panel) panel.style.display = "none";
      // for hero video, just fade it out
      el.style.opacity = "0";
    });

    // Some browsers don't fire "error" reliably; check readiness shortly after
    setTimeout(() => {
      if (el.readyState === 0 && el.networkState === 3) { // NETWORK_NO_SOURCE
        const panel = el.closest(".videoPanel");
        if (panel) panel.style.display = "none";
        el.style.opacity = "0";
      }
    }, 1200);
  }

  // Apply to your videos
  hideIfMissingMedia(document.querySelector(".hero__video"));
  document.querySelectorAll(".panelVideo").forEach(v => hideIfMissingMedia(v));

  function updateParallax() {
    const h = window.innerHeight || 1;
    parallaxEls.forEach(el => {
      const factor = parseFloat(el.getAttribute("data-parallax") || "0.12");
      // Element-relative parallax: based on its distance from viewport center
      const r = el.getBoundingClientRect();
      const rel = (r.top + r.height / 2 - h / 2) / h; // ~[-1..1]
      const move = rel * factor * 120; // px
      el.style.transform = `translate3d(0, ${move}px, 0)`;
    });
    ticking = false;
  }

  // Scroll progress bar
  const bar = $("#scrollProgressBar");
  function updateProgress() {
    if (!bar) return;
    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    const p = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
    bar.style.width = `${(p * 100).toFixed(2)}%`;
  }

  // Init
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateParallax();
    updateProgress();
  });

  updateParallax();
  updateProgress();
})();

