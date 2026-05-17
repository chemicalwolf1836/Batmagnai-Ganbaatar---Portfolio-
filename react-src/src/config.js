export const PROMPT_CONFIG = {
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
}

export const TONE_CONFIG = {
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
}
