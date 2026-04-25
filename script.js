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
  const clearDraftBtn = document.querySelector("[data-clear-draft]");
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

  const savedCountEl = document.getElementById("savedCount");

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

  const PROMPT_CONFIG = {
  portfolio: {
    rules: `
- Minimalist, neutral, professional tone.
- Do not invent tools, metrics, links, or outcomes.
- One-line outcome: max 20 words.
- Summary: 3–6 bullets, each max 12 words.
- References: one line, dot-separated (Repo · Demo · Write-up).
`,
    output: `
1) Website text version:
Title: <title>
Outcome: <one-line outcome>

Summary:
- <bullet>
- <bullet>

References: <Repo · Demo · Write-up>

2) HTML snippet version:
<article class="card">...</article>
`
  },

  readme: {
    rules: `
- Use clear markdown.
- Professional, concise tone.
- Do not invent missing details.
- Keep it readable for developers.
`,
    output: `
## Title

Short summary

### Problem
### What I Built
### Result
### Tech / Tools
### Links
`
  },

  linkedin: {
    rules: `
- Professional and natural tone.
- No exaggeration.
- Keep it concise.
`,
    output: `
Project title

Short paragraph

Key points:
• point
• point
• point
`
  },

  web: {
    rules: `
- Keep it practical and beginner-friendly.
- Focus on real-world usability.
- Do not invent features or tools.
- Use provided tools if available.
`,
    output: `
Project planning prompt:

1. Project overview
2. Core features
3. Suggested structure
4. Tech approach
5. Build plan
6. Improvements
`
  }
};

const promptModeEl = document.getElementById("promptMode");
const promptToneEl =  document.getElementById("promptTone");
const resetDefaultsBtn = document.getElementById("resetDefaults");


promptModeEl?.addEventListener("change", loadDefaults);
promptToneEl?.addEventListener("change", loadDefaults);
resetDefaultsBtn?.addEventListener("click", loadDefaults);




function loadDefaults() {
  const modeEl = document.getElementById("promptMode");
  const toneEl = document.getElementById("promptTone");
  const rulesEl = document.getElementById("customRules");
  const outputEl = document.getElementById("customOutput");

  if (!modeEl || !toneEl || !rulesEl || !outputEl) return;

  const mode = valueOrBlank(modeEl) || "portfolio";
  const tone = valueOrBlank(toneEl) || "professional";


  const config = PROMPT_CONFIG[mode];
  const toneRules = TONE_CONFIG[tone] || "";


  if (!config) return;

  rulesEl.value = `${config.rules}\n${toneRules}`.trim();
  outputEl.value = config.output.trim();

  refreshGeneratedPrompt();
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
    const status = result ? "Ready" : "Draft"; // can be changed later

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
          `<span class="badge muted">${status}</span>`+
        `</div>` +
        `<h3>${escapeHtml(title)}</h3>` +
        `<p>${escapeHtml(result)}</p>` +
        bulletsHtml +
        linksHtml +
      `</article>`;
  }

  let editingId = null;


document.addEventListener("DOMContentLoaded", function () {

    const problemEl = document.getElementById("problem");
    const actionsEl = document.getElementById("actions");
    const resultEl = document.getElementById("result");
    const saveStatusEl = document.getElementById("saveStatus");
    const editingStatusEl = document.getElementById("editingStatus");
    const badgeEl = document.getElementById("badge");
 const titleEl = document.getElementById("title");
 const toolsEl = document.getElementById("tools");
 const savePromptBtn = document.querySelector("[data-save-prompt]");
 const savedPromptsEl = document.getElementById("savedPrompts");
 const savedPromptsKey = "promptkit_saved_prompts_v2";
 const exportBtn = document.getElementById("exportBtn");
 const importInput = document.getElementById("importInput");
 const promptMode = document.getElementById("promptMode").value;







    function showSaveStatus(msg) {
        if (!saveStatusEl) return;
        saveStatusEl.textContent = "Saved ✓.";
        if (msg) setTimeout(() => { saveStatusEl.textContent = ""; }, 2000);
    }

    function updateEditingUI() {
  if (!savePromptBtn || !editingStatusEl) return;

  if (editingId) {
    const currentTitle = titleEl?.value.trim() || "Untitled project";
    savePromptBtn.textContent = "Update Prompt";
    editingStatusEl.textContent = `✏️ Editing: ${currentTitle}`;
  } else {
    savePromptBtn.textContent = "Save Prompt";
    editingStatusEl.textContent = "";
  }
}


    function getSavedPrompts() {
  try {
    return JSON.parse(localStorage.getItem(savedPromptsKey)) || [];
  } catch (error) {
    return [];
  }
}

function setSavedPrompts(prompts) {
  localStorage.setItem(savedPromptsKey, JSON.stringify(prompts));
}

function renderSavedPrompts() {
  const searchInput = document.getElementById("searchInput");
const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

const allPrompts = getSavedPrompts();

const prompts = allPrompts.filter((p) => {
  const text = [
    p.title,
    p.badge,
    p.problem,
    p.result,
    p.tools
  ].join(" ").toLowerCase();

  return text.includes(query);
});

if (exportBtn) {
  exportBtn.disabled = allPrompts.length === 0;
}



  if (savedCountEl) {
  savedCountEl.textContent = `Saved Prompts (${prompts.length})`;

}

if (!savedPromptsEl) return;


  if (!allPrompts.length) {
  savedPromptsEl.innerHTML = `
    <p class="empty-state">
      No saved prompts yet.<br/>
      Start by creating your first workflow 👇
    </p>
  `;
  return;
}

if (!prompts.length) {
  savedPromptsEl.innerHTML = `
    <p class="empty-state">
      No matching prompts found.<br/>
      Try a different keyword.
    </p>
  `;
  return;
}



  savedPromptsEl.innerHTML = prompts.map(p => `
    <div class="card">
      <div class="meta">
        <span class="badge">${p.badge}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.result || "No outcome yet."}</p>
      <p class="muted">${p.tools || ""}</p>

      <div class="saved-actions">
  <button class="btn" type="button" data-load-id="${p.id}">Load</button>
  <button class="btn" type="button" data-copy-id="${p.id}">Copy</button>
  <button class="btn" type="button" data-delete-id="${p.id}">Delete</button>
</div>




    </div>
  `).join("");

  savedPromptsEl.querySelectorAll("[data-load-id]").forEach((button) => {
  button.addEventListener("click", function () {
    const id = button.getAttribute("data-load-id");

    editingId = id; // Set the global editingId to this prompt's ID
    updateEditingUI(); // Update the UI to reflect that we're editing

    const prompts = getSavedPrompts();
    const prompt = prompts.find((item) => item.id === id);


    if (!prompt) return;

    if (badgeEl) badgeEl.value = prompt.badge || "";
    if (titleEl) titleEl.value = prompt.title || "";
    if (problemEl) problemEl.value = prompt.problem || "";
    if (actionsEl) actionsEl.value = prompt.actions || "";
    if (resultEl) resultEl.value = prompt.result || "";
    if (toolsEl) toolsEl.value = prompt.tools || "";

    if (typeof renderPreviewCard === "function") {
      renderPreviewCard();
    }

    updateEditingUI();

    titleEl.focus();
    titleEl.select();

    showSaveStatus("Prompt loaded.");
  });
});

savedPromptsEl.querySelectorAll("[data-copy-id]").forEach((button) => {
  button.addEventListener("click", async function () {
    const id = button.getAttribute("data-copy-id");
    const prompts = getSavedPrompts();
    const prompt = prompts.find((item) => item.id === id);

    if (!prompt) return;

    editingId = prompt.id;


    const text = [
      `Badge: ${prompt.badge || ""}`,
      `Title: ${prompt.title || ""}`,
      "",
      "Problem:",
      prompt.problem || "",
      "",
      "Actions:",
      prompt.actions || "",
      "",
      "Result:",
      prompt.result || "",
      "",
      "Tools:",
      prompt.tools || ""
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      showSaveStatus("Copied to clipboard.");
    } catch (error) {
      showSaveStatus("Copy failed.");
    }
  });
});


savedPromptsEl.querySelectorAll("[data-delete-id]").forEach((button) => {
  button.addEventListener("click", function () {
    const id = button.getAttribute("data-delete-id");
    const prompts = getSavedPrompts().filter((item) => item.id !== id);

    setSavedPrompts(prompts);
    renderSavedPrompts();
    showSaveStatus("Prompt deleted.");
  });
});

}




function buildSavedPrompt() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    badge: badgeEl?.value.trim() || "Workflow",
    title: titleEl?.value.trim() || "Untitled project",
    problem: problemEl?.value.trim() || "",
    actions: actionsEl?.value.trim() || "",
    result: resultEl?.value.trim() || "",
    tools: toolsEl?.value.trim() || "",
    createdAt: new Date().toISOString()
  };
}

if (savePromptBtn) {
  savePromptBtn.addEventListener("click", function () {
    const savedPrompt = buildSavedPrompt();

    if (!savedPrompt.title && !savedPrompt.problem && !savedPrompt.result) {
      showSaveStatus("Add some content first.");
      return;
    }

    const prompts = getSavedPrompts();
    const wasEditing = Boolean(editingId);
    if (editingId) {
  const index = prompts.findIndex((p) => p.id === editingId);
  if (index !== -1) {
    prompts[index] = { ...savedPrompt, id: editingId };
  }
} else {
  prompts.push(savedPrompt);
}

editingId = null;

    setSavedPrompts(prompts);
    renderSavedPrompts();
    updateEditingUI();
    showSaveStatus(wasEditing ? "🔄 Prompt updated." : "✅ Prompt saved.");
  });

  if (searchInput) {
  searchInput.addEventListener("input", function () {
    renderSavedPrompts();
  });
}


}






  if (!problemEl || !actionsEl || !resultEl) {console.warn("Missing one or more fields in PromptKit page."); return;}

    // Draft autosave fields
const draftFields = [
  "problem",
  "actions",
  "result",
  "tools",
  "repo",
  "demo",
  "writeup"
];

// Load saved draft values
draftFields.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.value = localStorage.getItem(id) || "";
});

// Save draft values while typing
draftFields.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("input", () => {
    localStorage.setItem(id, el.value);
    showSaveStatus("Saved ✓");
  });
});

console.log("Draft auto-save enabled for:", draftFields.join(", "));


    if (exportBtn) {
  exportBtn.addEventListener("click", function () {
    const prompts = getSavedPrompts();

    const blob = new Blob([JSON.stringify(prompts, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "promptkit-backup.json";
    link.click();

    URL.revokeObjectURL(url);
    showSaveStatus("📤 Prompts exported.");
  });
}

if (importInput) {
  importInput.addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
      try {
        const imported = JSON.parse(reader.result);

        if (!Array.isArray(imported)) {
          showSaveStatus("Invalid JSON file.");
          return;
        }

        const cleaned = imported.map((item) => ({
          id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
          badge: item.badge || "Workflow",
          title: item.title || "Untitled project",
          problem: item.problem || "",
          actions: item.actions || "",
          result: item.result || "",
          tools: item.tools || "",
          createdAt: item.createdAt || new Date().toISOString()
        }));

        setSavedPrompts(cleaned);
        renderSavedPrompts();
        updateEditingUI();
        showSaveStatus("📥 Prompts imported.");
      } catch (error) {
        showSaveStatus("❌ Import failed.");
      }

      importInput.value = "";
    };

    reader.readAsText(file);
  });
}



    // --Clear Saved Draft button
    clearDraftBtn.addEventListener("click", () => {
      // 1) Confirm with user (optional but good UX)
      if (!confirm("Are you sure you want to clear the saved draft? This cannot be undone.")) return;
        const draftFields = [
       "problem",
       "actions",
       "result",
       "tools",
       "repo",
       "demo",
       "writeup"
       ];

       draftFields.forEach((key) => {
       localStorage.removeItem(key);

       const el = document.getElementById(key);
       if (el) el.value = "";
      });

        console.log("✅ Cleared saved draft.");
        //3) Clear output prompt box too  (optional but nice for workflow)
        if (outputEl) outputEl.value = "";
          //4) Clear preview card (optional but nice for workflow)
        const mount = document.getElementById("previewMount");
        if (mount) mount.innerHTML = "";
        //5) Show status message
        setStatus("Saved draft cleared.");
        //6) Clear status message after a few seconds
        setTimeout(() => { setStatus(""); }, 3000);
        //7) Update UI: disable Clear Draft button since there's no draft now
        clearDraftBtn.disabled = true;
        //8) Re-enable Clear Draft button after user starts typing again (optional)
        const enableClearDraft = () => { clearDraftBtn.disabled = false; };
        problemEl.addEventListener("input", enableClearDraft, { once: true });
        actionsEl.addEventListener("input", enableClearDraft, { once: true });
        resultEl.addEventListener("input", enableClearDraft, { once: true });
        //9) Update UI
        if(typeof renderPreviewCard === "function") renderPreviewCard();
        //10) Small user feedback (reuses your  status line)
        if(typeof setStatus === "function") setStatus("Draft cleared. Start typing to create a new one.");


    });
});





  // small escape helpers (avoid injecting HTML from input)
  function escapeHtml(str) {
    return safeText(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function updateEditingUI() {
  const saveBtn = document.querySelector("[data-save]");
  const editingLabel = document.getElementById("editingLabel");

  if (!saveBtn || !editingLabel) return;

  if (editingId) {
    saveBtn.textContent = "Update Prompt";
    editingLabel.textContent = "Editing mode";
  } else {
    saveBtn.textContent = "Save Prompt";
    editingLabel.textContent = "";
  }
}


  function escapeAttr(str) {
    return escapeHtml(str).replace(/\s/g, "%20");
  }

  function buildPrompt() {
    const promptMode = valueOrBlank(document.getElementById("promptMode"));
    const promptTone = valueOrBlank(document.getElementById("promptTone"));

    const customRules = valueOrBlank(document.getElementById("customRules"));
    const customOutput = valueOrBlank(document.getElementById("customOutput"));

   const config = PROMPT_CONFIG[promptMode];
   const toneRules = TONE_CONFIG[promptTone] || "";

   if (!config) return "";

   const finalRules = customRules || `${config.rules}\n${toneRules}`.trim();
   const finalOutput = customOutput || config.output.trim();



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

    const data = {
    badge,
    title,
    problem,
    actions,
    result,
    tools,
    refs,
    tone: promptTone,
    rules: finalRules,
    output: finalOutput
  };

  if (promptMode === "readme") {
    return buildReadmePrompt(data);
  }

  if (promptMode === "linkedin") {
    return buildLinkedInPrompt(data);
  }

  if (promptMode === "web") {
  return buildWebPrompt(data);
}


  return buildPortfolioPrompt(data);
}

function buildPortfolioPrompt(data) {

return `You are a strict formatter and editor.

Task:
Convert input into a minimalist portfolio project card.

My input:
Badge: ${data.badge}
Title: ${data.title}
Problem: ${data.problem}
Actions:
${data.actions}
Result: ${data.result}
Tools: ${data.tools}
References:
${data.refs || "(none)"}

Rules:
${data.rules}

Output:
${data.output}`;
}




function buildReadmePrompt(data) {


 return `Create a clean GitHub README section.

Input:
Badge: ${data.badge}
Title: ${data.title}
Problem: ${data.problem}
Actions:
${data.actions}
Result: ${data.result}
Tools: ${data.tools}
References:
${data.refs || "(none)"}

Rules:
${data.rules}

Output:
${data.output}`;
}




function buildLinkedInPrompt(data) {


 return `Create a professional LinkedIn post.

Input:
Badge: ${data.badge}
Title: ${data.title}
Problem: ${data.problem}
Actions:
${data.actions}
Result: ${data.result}
Tools: ${data.tools}
References:
${data.refs || "(none)"}

Rules:
${data.rules}

Output:
${data.output}`;
}




function buildWebPrompt(data) {


 return `You are a strict formatter and project planner.

Task:
Create a web project build prompt from my input.

My input:
Badge: ${data.badge}
Title: ${data.title}
Problem: ${data.problem}
Actions:
${data.actions}
Result: ${data.result}
Tools: ${data.tools}
References:
${data.refs || "(none)"}

Rules:
${data.rules}

Output:
${data.output}`;
}



const TONE_CONFIG = {
  professional: `
- Use a clear, professional tone.
- Keep the wording concise and practical.
- Avoid hype, exaggeration, or filler.
`,

  recruiter: `
- Use a recruiter-friendly tone.
- Emphasize clarity, impact, and usability.
- Keep the writing easy to skim quickly.
`,

  technical: `
- Use a technical and precise tone.
- Focus on implementation details, structure, and logic.
- Keep the wording clear and developer-oriented.
`,

  beginner: `
- Use a beginner-friendly tone.
- Keep the language simple and supportive.
- Explain structure clearly without jargon.
`
};






  function setStatus(msg) {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    if (msg) setTimeout(() => (copyStatus.textContent = ""), 2000);
  }

  if (!onPromptKitPage()) return;

  if (badgeEl && !badgeEl.value) badgeEl.value = "Front End";
  renderPreviewCard();

  genBtn.addEventListener("click", () => {
    console.log("Generate clicked");

    if (isGenerating) {
      setStatus("Please wait...");
      return
    }
    if (!actionsEl.value.trim()) {
      setStatus("Please add at least one action.");
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
    setStatus("Prompt generated."); setTimeout(() => { genBtn.textContent = "Generate Prompt"; isGenerating = false;}, 1000);} );


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

    copyBtn.textContent = "Copied ✓";
    setStatus("Prompt copied to clipboard.");

    setTimeout(() => {
      copyBtn.textContent = "Copy Prompt";
    }, 2000);

  } catch (e) {
    outputEl.focus();
    outputEl.select();
    document.execCommand("copy");

    copyBtn.textContent = "Copied ✓";
    setStatus("Copied.");

    setTimeout(() => {
      copyBtn.textContent = "Copy Prompt";
    }, 2000);
  }

});
})();
