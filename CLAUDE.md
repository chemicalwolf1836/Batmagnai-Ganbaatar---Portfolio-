# CLAUDE.md — Batmagnai Ganbaatar Portfolio

## Project Overview
Personal portfolio + PromptKit tool. Vanilla HTML, CSS, JavaScript — no frameworks.
Live at: https://batmagnai-portfolio.netlify.app/

## File Structure
```
index.html              ← Homepage (hero, project cards)
about.html              ← About + skills
projects.html           ← Project case study list
contact.html            ← Contact form (mailto, no backend)
promptkit.html          ← PromptKit tool (main app)
promptkit-detail.html   ← PromptKit case study page
tokyo-neon-kissa.html   ← Tokyo Neon Kissa case study page
style.css               ← ALL styles (one shared file)
script.js               ← ALL JS (one shared file)
```

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

## Design System — DO NOT DEVIATE

### CSS Custom Properties (defined in :root)
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

Always use these variables. Never hardcode colors — except #ff3b30 used on
.brand-mark and .kicker i (slightly warmer red, intentional).

### Key UI Patterns
- `.card` — white panel, 1px border, border-radius var(--radius), hover lifts with red border tint
- `.badge` — pill shape, red-tinted bg, used for project type labels
- `.btn` — rounded button; `.btn.primary` = red bg, white text
- `.kicker` — mono font label with red angular mark (clip-path polygon)
- `.highlight` — inline red text (#dc2626) for emphasis
- `.brand-mark` — small red parallelogram shape (clip-path polygon) in nav

### Angular / Mirror's Edge Elements
- `.gridlines` — skewed grid in hero background
- `.angle.a1` / `.angle.a2` — decorative angled panels (right side of hero)
- Red left border accent used on `.angle.a1`

---

## Known Bugs (fix these, don't introduce more)
1. `.actions` has `display: auto` — INVALID. Should be `display: flex; flex-wrap: wrap;`
2. `.highlight` is defined twice in style.css — remove the duplicate (keep the one with `letter-spacing`)
3. `menu-toggle` vs `menu-btn` — inconsistent across pages; standardize to `menu-btn` + update CSS
4. Contact script.js still has `your-email@example.com` — needs real email
5. Duplicate `id="editingLabel"` in promptkit.html — IDs must be unique in HTML

---

## JavaScript Architecture

### script.js structure
- IIFE 1 (lines ~3–59): Nav menu toggle, active page marking, mailto builder
- IIFE 2 (lines ~62–1059): PromptKit logic — runs only if on promptkit.html

### PromptKit Key Functions
- `buildPrompt()` — assembles the final prompt string from all inputs
- `renderPreviewCard()` — live DOM update of the preview card
- `loadDefaults()` — fills rules/output textareas based on selected mode + tone
- `setStatus(msg)` — shows temporary feedback text
- `PROMPT_CONFIG` — object with rules + output format per mode (portfolio/readme/linkedin/web)
- `TONE_CONFIG` — object with tone instructions (professional/recruiter/technical/beginner)

### localStorage Keys (PromptKit)
- `promptkit_draft` — autosaved form state
- `promptkit_prompts` — saved prompt cards array

---

## What NOT to Touch
- The clip-path shapes on `.brand-mark` and `.kicker i` — intentional angular geometry
- The `--ease` cubic-bezier — consistent motion feel
- The two-IIFE structure in script.js — keeps nav and PromptKit logic separated
- `escapeHtml()` and `escapeAttr()` functions — security, never remove

---

## Project Completion Workflow

When I say **"I finished [project name]"** or **"add [project] to my portfolio"**, run through ALL of the following steps in order. Ask me for any missing info before starting.

---

### Info to Collect First (ask if not provided)
- Project name
- One-line description (what it does, for who)
- Tech stack used (e.g. HTML, CSS, JS, React, Node, API used)
- Live URL (if deployed)
- GitHub repo name (your username is `chemicalwolf1836` — full URL will be `https://github.com/chemicalwolf1836/[repo-name]`)
- 5–7 bullet points of what I specifically built / implemented (lead with strong verbs)
- 1 closing sentence summarizing the project's focus
- Project type label (e.g. `Full Stack`, `AI Tool`, `Frontend`, `Front-End Workflow Tool`)
- Whether it should go on: portfolio only / GitHub only / LinkedIn only / all three

---

### Step 1 — Update Portfolio (`index.html`)
Add a new project card in the `#projects` section. Follow the existing `.card` pattern exactly:

```html
<article class="card">
  <div class="card-top">
    <span class="badge">[TYPE]</span>
    <h3>[PROJECT NAME]</h3>
    <p>[ONE-LINE DESCRIPTION]</p>
  </div>
  <ul class="card-bullets">
    <li>[BULLET 1]</li>
    <li>[BULLET 2]</li>
    <li>[BULLET 3]</li>
  </ul>
  <div class="actions">
    <a href="[CASE STUDY PAGE].html" class="btn">Case Study</a>
    <a href="[LIVE URL]" class="btn primary" target="_blank">Live Site ↗</a>
  </div>
</article>
```

---

### Step 2 — Update Portfolio (`projects.html`)
Add a new entry to the project case study list. Match the existing list item/card pattern in that file.

---

### Step 3 — Create Case Study Page
If the project doesn't have a dedicated HTML page yet, create `[project-slug].html` using the same structure as `tokyo-neon-kissa.html` or `promptkit-detail.html`:
- Hero section with project name + one-liner
- Stack badges
- Problem / Approach / Result sections
- Screenshots or demo links if available
- Link back to `projects.html`

---

### Step 4 — Update GitHub Profile README (`chemicalwolf1836/README.md`)
Add the new project under the `## 🚀 Projects` section. Match the Tokyo Neon Kissa format exactly — simple bullets, no sub-headers:

```markdown
### [EMOJI] [PROJECT NAME]

[1–2 sentence description: what it is, who it's for, what makes it notable.]

• [Specific feature or thing built — strong verb]
• [Specific feature or thing built]
• [Specific feature or thing built]
• [Specific feature or thing built]
• [Specific feature or thing built]

🔗 Live Demo: [LIVE URL]
💻 GitHub: https://github.com/chemicalwolf1836/[REPO-NAME]
```

Rules:
- Keep bullets simple — no sub-headers like "Core Features" (that's the PromptKit format, which is inconsistent — new projects should use the Tokyo Neon Kissa style)
- Pick an emoji that fits the project type (🌐 web app, ⭐ tool, 🍋 UI project, 🤖 AI, etc.)
- Always include both Live Demo and GitHub links
- 4–6 bullets is enough

If the project repo's own `README.md` also needs updating (not just the profile README), update that too with a short summary at the top plus stack/features list.

---

### Step 5 — Generate LinkedIn Content (copy only — do NOT post automatically)

Generate **both** outputs below. I'll copy-paste them myself.

#### 5A — LinkedIn Projects Section Entry
This goes under the **Projects** section on my LinkedIn profile. Match the exact format of my existing entries:

```
[PROJECT NAME] — [Type, e.g. Full-Stack Web Application]

[1–2 sentence overview: what it is, who it's for, what makes it notable.]

• [Specific thing built or implemented — lead with a strong verb]
• [Specific thing built or implemented]
• [Specific thing built or implemented]
• [Specific thing built or implemented]
• [Specific thing built or implemented]

[1 closing sentence: what the project was focused on — e.g. "Focused on clarity, usability, and building a practical tool rather than a static demo."]

Live Demo:
[LIVE URL]

GitHub:
https://github.com/chemicalwolf1836/[REPO-NAME]

Skills: [TECH 1] · [TECH 2] · [TECH 3] · [+N more if applicable]
```

Rules for bullets:
- Start each with a strong past-tense verb (Designed, Implemented, Built, Developed, Added, Created, Structured)
- Be specific — mention the exact feature or pattern, not vague claims
- 5–7 bullets is the sweet spot (match existing entries)
- No buzzwords — describe what it actually does

#### 5B — LinkedIn Post (optional, ask me if I want one)
If I say yes, draft a short post to announce the project:

```
🚀 Just shipped: [PROJECT NAME]

[2–3 sentences: what problem it solves, how I built it, what I learned — human tone, no corporate speak]

Tech: [STACK]

[Live link] · [GitHub link]

#buildinpublic #webdev #javascript #[relevant tag]
```

---

### Step 6 — Git Commit & Push
After all file edits are done:
```bash
git add .
git commit -m "feat: add [project name] to portfolio"
git push
```

Then confirm Netlify auto-deploy triggered (the live URL should update in ~1 min).

---

### What NOT to Do Automatically
- Do NOT post to LinkedIn directly — always give me the copy to review first
- Do NOT push to GitHub before showing me the diff
- Do NOT create the case study page unless I confirm I want one

---

## Profile Improvement Workflow

When I say **"improve my [LinkedIn / GitHub / portfolio]"**, **"update my profile"**, **"refresh my bio"**, or **"make my [X] better"** — run this workflow. Also run it automatically at the end of every Project Completion Workflow.

---

### Trigger Phrases
- "improve my LinkedIn" / "update my GitHub" / "refresh my portfolio"
- "make my profile look better"
- "update my bio / about section / skills"
- "my [X] is outdated"
- "review my profile"
- Or any combination — e.g. "update all three"

---

### Portfolio Improvements (`index.html`, `about.html`, `projects.html`)

Check and update the following:

**Hero / About copy:**
- Does the headline reflect my most recent and impressive work?
- Does the bio mention my current stack accurately? (HTML, CSS, JS, React, Next.js, TypeScript, Tailwind)
- Is the "currently building" or focus area still relevant?

**Project cards (`index.html`):**
- Are all shipped projects shown? Add any that are missing.
- Are descriptions accurate and specific — not vague?
- Do all Live Site and Case Study links work?

**Skills / About page (`about.html`):**
- Add any new tools or technologies I've used in recent projects
- Remove or downgrade anything I no longer use or haven't touched

**General:**
- Check for any broken links
- Ensure consistent tone across all pages — confident, specific, not "aspiring"

---

### GitHub Profile README Improvements (`chemicalwolf1836/README.md`)

Check and update the following:

**Bio line (top of README):**
- Reflects current focus — not "Aspiring" — use "Front-End Developer | Building full-stack web apps and AI workflow tools" or similar
- Mentions bilingual context (English & Japanese) if relevant

**What I Do section:**
- Update bullet points to reflect the most recent tools and skills
- Add Claude Code / AI-assisted development if relevant

**Projects section:**
- All completed projects listed with Live Demo + GitHub links
- All entries use consistent format (Tokyo Neon Kissa style — simple bullets, no sub-headers)
- PromptKit entry reformatted to match if not already done
- Little Lemon Menu and AI Workflow Examples have GitHub links added

**Skills section:**
- Add any new skills from recent projects
- Keep it honest — don't pad it

**Certifications:**
- Update CompTIA A+ Core 2 status when passed

---

### LinkedIn Profile Improvements (generate copy only — I'll paste it myself)

Check and suggest updates to:

**Headline:**
- Should not say "Aspiring" — use: *"Front-End Developer | Full-Stack Web Apps | AI Workflow Tools | Based in Tokyo"*
- Or tailor to whatever role I'm currently applying for

**About / Summary section:**
- 3–5 sentences: who I am, what I build, what I'm looking for
- Mention: bilingual (English/Japanese), based in Tokyo, CompTIA A+, open to IT Support + developer roles
- End with a call to action: "Open to opportunities in..."

**Projects section:**
- All projects present with accurate descriptions
- Consistent format matching existing entries (see Step 5A above)
- Missing GitHub or Live Demo links added

**Skills section:**
- Add skills used in new projects if not already listed
- Prioritize: HTML, CSS, JavaScript, React, Next.js, TypeScript, Tailwind CSS, Node.js, Git

**Featured section (if applicable):**
- Portfolio site pinned
- Most impressive project pinned

---

### Improvement Guardrails
- Do NOT post or publish anything to LinkedIn — always draft for review
- Do NOT push to GitHub without showing me the diff first
- Do NOT change the tone to corporate or buzzword-heavy — keep it human and specific
- Flag anything that sounds like "just another developer" — push for specificity
- If unsure what to update, ask: "What have you been working on lately?" before making changes

---

## LinkedIn Post Strategy (Get Hired)

When I say **"write me a LinkedIn post"**, **"create a post about [topic]"**, or **"help me post on LinkedIn"** — use this section. Goal: build an audience, stay visible to recruiters, and show I'm actively growing as a developer.

---

### Trigger Phrases
- "write me a LinkedIn post"
- "create a post about [X]"
- "I want to post about what I learned / built / struggled with"
- "help me stay active on LinkedIn"
- "generate this week's post"

---

### My LinkedIn Post Voice
- **Human, not corporate.** Write like I'm talking to someone, not presenting to a boardroom.
- **Specific, not vague.** "I built a live preview that updates on every keystroke using an input event listener" beats "I learned JavaScript."
- **Honest about being junior.** Vulnerability + progress = relatable. Recruiters respect it.
- **Tokyo angle is a differentiator.** Bilingual dev in Japan is a unique hook — use it when natural.
- **Short sentences. White space. No walls of text.** LinkedIn buries long posts — format for skimming.
- **Never use:** "excited to share", "thrilled to announce", "passionate about", "leveraging", "synergy", "growth mindset"

---

### Post Formats That Work

#### Format 1 — "What I Built" (ship post)
Use after completing a feature, project, or milestone.

```
I just built [SPECIFIC THING].

Here's what it does:
→ [RESULT 1]
→ [RESULT 2]
→ [RESULT 3]

The hardest part was [HONEST CHALLENGE].

Here's what I'd do differently next time:
[1 honest takeaway]

[Live link or GitHub link]

#buildinpublic #webdev #[relevant tag]
```

---

#### Format 2 — "What I Learned" (lesson post)
Use after figuring something out, fixing a bug, or understanding a concept.

```
I was stuck on [PROBLEM] for [TIME].

Turns out: [SIMPLE EXPLANATION OF THE FIX OR INSIGHT]

Before I understood this, I thought [WRONG ASSUMPTION].
Now I know [CORRECT UNDERSTANDING].

If you're learning [TOPIC], this might save you time:
[1–3 specific tips]

#learntocode #javascript #[relevant tag]
```

---

#### Format 3 — "Behind the Build" (process post)
Use to show thinking, decision-making, or design choices — not just the end result.

```
Most people show the finished product.

Here's what [PROJECT NAME] looked like at step 1:
[Honest description of the messy start]

And here's where it is now:
[What it became]

The turning point was [KEY DECISION OR MOMENT].

What changed:
→ [CHANGE 1]
→ [CHANGE 2]
→ [CHANGE 3]

Building in public keeps me honest.

[Link]

#buildinpublic #webdev #devjourney
```

---

#### Format 4 — "Tokyo Dev Life" (personal + location hook)
Use occasionally to show personality and stand out from generic dev posts.

```
Building web apps from Tokyo.

[1–2 sentence scene-setter — what's the day like, what are you working on]

Today I [WHAT YOU DID / SHIPPED / LEARNED].

[Short reflection on the experience — honest, not inspirational-quote energy]

[Optional link]

#tokyodev #webdev #buildinpublic
```

---

#### Format 5 — "Recruiter Magnet" (value + ask post)
Use every 2–3 weeks to stay visible to hiring managers.

```
I'm a front-end developer based in Tokyo.

Here's what I've shipped in the last [TIMEFRAME]:
→ [PROJECT 1] — [one-line description + link]
→ [PROJECT 2] — [one-line description + link]
→ [PROJECT 3] — [one-line description + link]

Stack: [LIST]

Open to: [ROLE TYPE] roles — remote, hybrid, or based in Tokyo/Japan.

If you're hiring or know someone who is, feel free to reach out.

[Portfolio link]

#opentowork #frontenddeveloper #tokyojobs #webdev
```

---

### Post Generation Rules
- Always write 2–3 variations and let me pick — different hooks, same content
- Never use a generic opener like "I'm excited to share..." — start with a statement, question, or contradiction
- The first line must be scroll-stopping — it's what shows before "see more"
- Keep posts under 200 words unless the content truly needs more
- Always end with 3–5 relevant hashtags — no more
- Ask me: "Do you want a version with a link, or a purely narrative post?" before generating
- Draft only — never post automatically

---

### Post Calendar Suggestion (if I ask)
If I ask "what should I post this week?", suggest a mix:

| Week | Post Type | Topic Idea |
|------|-----------|------------|
| Mon  | What I Built | Latest project or feature |
| Wed  | What I Learned | Bug fix, concept, or tool |
| Fri  | Behind the Build or Recruiter Magnet | Process or visibility post |

Rotating these keeps the feed varied and signals consistent activity to recruiters.

---

### LinkedIn Post Guardrails
- Do NOT post automatically — always draft for review
- Do NOT write anything that sounds fake, performative, or like AI wrote it
- If the topic is too vague, ask: "What specifically happened? Give me one concrete detail."
- Flag if I'm posting too often about the same thing — variety matters

---

## Common Tasks
```bash
# Serve locally
npx live-server

# Or just open index.html directly in browser
open index.html
```

## Deploy
Hosted on Netlify. Push to GitHub → auto-deploys.
