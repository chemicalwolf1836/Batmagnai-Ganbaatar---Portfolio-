# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Live site: https://batmagnai-portfolio.netlify.app/

## My Learning Context
- Level: Junior / entry-level developer
- Goal: Learn while building — explain WHY, not just WHAT
- Stack: HTML, CSS, JavaScript (vanilla — no frameworks yet)

## How to Work With Me
- Before making any change, briefly explain what you're about to do and why
- After a change, explain what it does in plain English
- If I'm doing something wrong or there's a better way, tell me — don't just silently fix it
- When introducing a new concept, give a one-line analogy first
- Flag when something I asked for is bad practice, and suggest the right way
- Keep explanations short — teach in layers, not walls of text

---

## Development Commands

No build system. Serve locally with any static file server:

```bash
npx live-server
# or
open index.html
```

Deploy: push to GitHub → Netlify auto-deploys.

---

## Design System — DO NOT DEVIATE

### CSS Custom Properties (defined in `:root`)
```css
--bg: #ffffff
--text: #111114
--muted: #5b5e66
--line: rgba(17,17,20,0.12)
--accent: #ff2d2d        ← primary red
--shadow: 0 18px 50px rgba(0,0,0,0.08)
--radius: 18px
--max: 1080px
--font: ui-sans-serif, system-ui, ...
--mono: ui-monospace, SFMono-Regular, ...
--ease: cubic-bezier(.2,.8,.2,1)
```

Always use these variables. Never hardcode colors — except `#ff3b30` used on `.brand-mark` and `.kicker i` (slightly warmer red, intentional).

### Key UI Patterns
- `.card` — white panel, 1px border, border-radius `var(--radius)`, hover lifts with red border tint
- `.badge` — pill shape, red-tinted bg, used for project type labels
- `.btn` — rounded button; `.btn.primary` = red bg, white text
- `.kicker` — mono font label with red angular mark (`clip-path` polygon)
- `.highlight` — inline red text (`#dc2626`) for emphasis
- `.brand-mark` — small red parallelogram shape (`clip-path` polygon) in nav

### Angular / Mirror's Edge Elements
- `.gridlines` — skewed grid in hero background
- `.angle.a1` / `.angle.a2` — decorative angled panels (right side of hero)
- Red left border accent used on `.angle.a1`

---

---

## JavaScript Architecture

`script.js` serves all pages from a single file, structured in two blocks:

**Block 1 — Global** (top-level IIFE, runs on every page): mobile menu toggle via `[data-menu-btn]`, active nav link marking via `location.pathname`, `mailto:` URL builder for contact form.

**Block 2 — PromptKit** (second `DOMContentLoaded` + trailing IIFE): runs only on `promptkit.html`, guarded by `onPromptKitPage()` checks. Contains:
- `PROMPT_CONFIG` — template rules + output format per mode (portfolio / readme / linkedin / web)
- `TONE_CONFIG` — tone instructions (professional / recruiter / technical / beginner)
- `loadDefaults()` — fills textareas from config objects when mode/tone changes
- `buildPrompt()` — assembles final prompt string from all inputs
- `renderPreviewCard()` — live DOM update of preview card
- `setStatus(msg)` — temporary feedback text (scoped inside PromptKit IIFE)
- Saved prompts CRUD: localStorage key `promptkit_saved_prompts_v2`
- Draft autosave: each field saved by its element ID (`problem`, `actions`, `result`, `tools`, `repo`, `demo`, `writeup`)

**JS ↔ HTML coupling:** interactive elements are targeted exclusively via data attributes (`data-menu-btn`, `data-generate`, `data-save-prompt`, `data-clear`). IDs are for reading/writing values. Classes are for styling only.

---

## What NOT to Touch
- The `clip-path` shapes on `.brand-mark` and `.kicker i` — intentional angular geometry
- The `--ease` cubic-bezier — consistent motion feel
- `escapeHtml()` and `escapeAttr()` in `script.js` — XSS protection, never remove
