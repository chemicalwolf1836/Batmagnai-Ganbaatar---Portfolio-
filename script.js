// Minimal JS: mobile menu + active nav + mailto builder + theme toggle

(function () {
  // Theme toggle — CSS handles icon visibility, JS handles state + persistence
  const themeBtn = document.querySelector("[data-theme-btn]");
  const html = document.documentElement;

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  const menuBtn = document.querySelector("[data-menu-btn]");
  const navLinks = document.querySelector("[data-nav-links]");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    // close on link click (mobile)
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });


    // close on outside click
    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("open")) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-nav]")) return;
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  }

  // Mark current page in nav
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('a[data-nav-link]').forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });

  // Contact page: build a mailto from fields (no backend)
  const mailBtn = document.querySelector("[data-mailto]");
  if (mailBtn) {
    mailBtn.addEventListener("click", () => {
      const name = (document.querySelector("#name")?.value || "").trim();
      const email = (document.querySelector("#email")?.value || "").trim();
      const msg = (document.querySelector("#message")?.value || "").trim();
      const errorEl = document.querySelector("#form-error");

      if (!name || !email || !msg) {
        if (errorEl) {
          errorEl.textContent = "Please fill in all fields before sending.";
          clearTimeout(errorEl._timer);
          errorEl._timer = setTimeout(() => { errorEl.textContent = ""; }, 4000);
        }
        return;
      }

      if (errorEl) errorEl.textContent = "";

      const to = "batmagnai.ganbaatar@gmail.com";
      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `${msg}\n`
      );

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }


  // Button ripple — creates a circle that radiates from the click point
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
})();
