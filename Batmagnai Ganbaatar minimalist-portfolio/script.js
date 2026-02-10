// Minimal JS: mobile menu + active nav + mailto builder

(function () {
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

      const to = "your-email@example.com"; // <-- REPLACE THIS
      const subject = encodeURIComponent(`Portfolio inquiry from ${name || "someone"}`);
      const body = encodeURIComponent(
        `Name: ${name || "[not provided]"}\n` +
        `Email: ${email || "[not provided]"}\n\n` +
        `${msg || "[message not provided]"}\n`
      );

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();


// PromptKit: generate a strict prompt for project cards
(function () {
  const genBtn = document.querySelector("[data-generate]");
  const clearBtn = document.querySelector("[data-clear]");
  const copyBtn = document.querySelector("[data-copy]");
  const copyStatus = document.getElementById("copyStatus");

  const badgeEl = document.getElementById("badge");
  const titleEl = document.getElementById("title");
  const problemEl = document.getElementById("problem");
  const actionsEl = document.getElementById("actions");
  const resultEl = document.getElementById("result");
  const toolsEl = document.getElementById("tools");
  const repoEl = document.getElementById("repo");
  const demoEl = document.getElementById("demo");
  const writeupEl = document.getElementById("writeup");
  const outputEl = document.getElementById("output");

  let isGenerating  = false;

  function onPromptKitPage() {
    return !!(genBtn && outputEl && titleEl && problemEl && actionsEl && resultEl && toolsEl);
  }

  function sanitizeBadge(v) {
    const x = (v || "").trim();
    if (x === "AI" || x === "Workflow" || x === "Front End") return x;
    return "Front End";
  }

  function valueOrBlank(el) {
    return (el?.value || "").trim();
  }

  function buildReferences(repo, demo, writeup) {
    const lines = [];
    if (repo) lines.push(`- Repo: ${repo}`);
    if (demo) lines.push(`- Live demo: ${demo}`);
    if (writeup) lines.push(`- Write-up: ${writeup}`);
    return lines.length ? lines.join("\n") : "";
  }


  // PromptKit preview renderer
  function splitBullets(text) {
    return (text || "")
      .split(/\r?\n/)
      .map(s => s.replace(/^\s*[-•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  function safeText(s) {
    return (s || "").toString();
  }

  function renderPreviewCard() {
    const mount = document.getElementById("previewMount");
    if (!mount) return;

    const badge = sanitizeBadge(valueOrBlank(badgeEl));
    const title = valueOrBlank(titleEl) || "Untitled project";
    const result = valueOrBlank(resultEl) || "Outcome will appear here.";
    const bullets = splitBullets(valueOrBlank(actionsEl));
    const repo = valueOrBlank(repoEl);
    const demo = valueOrBlank(demoEl);
    const writeup = valueOrBlank(writeupEl);

    const links = [];
    if (repo) links.push({ label: "Repo", href: repo });
    if (demo) links.push({ label: "Demo", href: demo });
    if (writeup) links.push({ label: "Write-up", href: writeup });

    const bulletsHtml = bullets.length
      ? `<p>${bullets.map(b => `• ${escapeHtml(b)}`).join("<br />")}</p>`
      : `<p style="opacity:.8">• Add 3–6 action bullets to preview.</p>`;

    const linksHtml = links.length
      ? `<div class="links">${links.map(l => `<a class="link" href="${escapeAttr(l.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`).join("")}</div>`
      : `<div class="links"><span class="link" style="opacity:.6">No references yet</span></div>`;

    mount.innerHTML =
      `<article class="card">` +
        `<div class="meta">` +
          `<span class="badge">${escapeHtml(badge)}</span>` +
          `<span>In progress</span>` +
        `</div>` +
        `<h3>${escapeHtml(title)}</h3>` +
        `<p>${escapeHtml(result)}</p>` +
        bulletsHtml +
        linksHtml +
      `</article>`;
  }

  // small escape helpers (avoid injecting HTML from input)
  function escapeHtml(str) {
    return safeText(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/\s/g, "%20");
  }

  function buildPrompt() {
    const badge = sanitizeBadge(valueOrBlank(badgeEl));
    const title = valueOrBlank(titleEl);
    const problem = valueOrBlank(problemEl);
    const actions = valueOrBlank(actionsEl);
    const result = valueOrBlank(resultEl);
    const tools = valueOrBlank(toolsEl);

    const repo = valueOrBlank(repoEl);
    const demo = valueOrBlank(demoEl);
    const writeup = valueOrBlank(writeupEl);
    const refs = buildReferences(repo, demo, writeup);

    return `You are a strict formatter and editor.\n` +
`Your job is to convert input into a minimalist portfolio project card.\n` +
`Do not add new facts or improve scope.\n\n` +
`Task:\n` +
`Create a minimalist portfolio project card from my input.\n\n` +
`My input:\n` +
`Badge: ${badge}\n` +
`Status: In progress\n` +
`Title: ${title}\n` +
`Problem: ${problem}\n` +
`Actions:\n${actions}\n` +
`Result: ${result}\n` +
`Tools: ${tools}\n` +
`References:\n${refs || "(none)"}\n\n` +
`Rules:\n` +
`- Minimalist, neutral, professional tone. No hype or buzzwords.\n` +
`- Do not invent tools, metrics, links, or outcomes. If missing, omit.\n` +
`- One-line outcome: max 20 words.\n` +
`- Summary: 3–6 bullets, each max 12 words.\n` +
`- References: one line, dot-separated (e.g., Repo · Demo · Write-up). Only include provided links.\n` +
`- If input is unclear, ask up to 3 clarifying questions BEFORE output.\n\n` +
`Output:\n` +
`1) Website text version (plain text):\n` +
`Title: <title>\n` +
`Outcome: <one-line outcome>\n` +
`Summary:\n` +
`- <bullet>\n` +
`(3–6 bullets)\n` +
`References: <Repo · Demo · Write-up> (omit if none)\n\n` +
`2) HTML snippet version (NO inline styles):\n` +
`<article class="card">\n` +
`  <div class="meta">\n` +
`    <span class="badge">${badge}</span>\n` +
`    <span>In progress</span>\n` +
`  </div>\n` +
`  <h3>...</h3>\n` +
`  <p>...</p>\n` +
`  <div class="links">\n` +
`    <a class="link" href="...">Repo</a>\n` +
`    <a class="link" href="...">Demo</a>\n` +
`    <a class="link" href="...">Write-up</a>\n` +
`  </div>\n` +
`</article>\n\n` +
`HTML rules:\n` +
`- Use only: article, div, span, h3, p, a.\n` +
`- Use classes exactly: card, meta, badge, links, link.\n` +
`- If a reference link is missing, do not include that <a>.\n`;
  }

  function setStatus(msg) {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    if (msg) setTimeout(() => (copyStatus.textContent = ""), 2000);
  }

  if (!onPromptKitPage()) return;

  if (badgeEl && !badgeEl.value) badgeEl.value = "Front End";
  renderPreviewCard();

  genBtn.addEventListener("click", () => {
    if (isGenerating) {
      setStatus("Please wait...");
      return
    }
    if (!actionsEl.value.trim()) {
      setStatus("Please add some notes first.");
      return;
    }
    const lines = actionsEl.value.trim().split("\n");
    if(lines.length < 3 || lines.length > 6) {
      setStatus("Please add between 3 and 6 action bullets.");
      return;
    }
    isGenerating = true;
   genBtn.textContent = "Generating...";
    outputEl.value = buildPrompt();
    renderPreviewCard();
    setStatus("Prompt generated."); setTimeout(() => { genBtn.textContent = "Generate Prompt ->"; isGenerating = false;}, 1000);} );


  clearBtn?.addEventListener("click", () => {
    [titleEl, problemEl, actionsEl, resultEl, toolsEl, repoEl, demoEl, writeupEl].forEach(el => {
      if (el) el.value = "";
    });
    if (badgeEl) badgeEl.value = "Front End";
    outputEl.value = "";
    const mount = document.getElementById("previewMount");
    if (mount) mount.innerHTML = "";
    setStatus("Cleared.");
  });

  copyBtn?.addEventListener("click", async () => {
    const text = outputEl.value.trim();
    if (!text) return setStatus("Nothing to copy.");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied.");
    } catch (e) {
      outputEl.focus();
      outputEl.select();
      document.execCommand("copy");
      setStatus("Copied.");
    }
  });
})();
