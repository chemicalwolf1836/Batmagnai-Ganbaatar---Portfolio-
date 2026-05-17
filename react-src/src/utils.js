import { PROMPT_CONFIG, TONE_CONFIG } from './config.js'

export function sanitizeBadge(v) {
  const x = (v || '').trim()
  return x || 'Front End'
}

export function formatUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

export function splitBullets(text) {
  return (text || '')
    .split(/\r?\n/)
    .map(s => s.replace(/^\s*[-•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

export function buildReferences(repo, demo, writeup) {
  const lines = []
  if (repo) lines.push(`- Repo: ${repo}`)
  if (demo) lines.push(`- Live demo: ${demo}`)
  if (writeup) lines.push(`- Write-up: ${writeup}`)
  return lines.length ? lines.join('\n') : ''
}

export function buildPrompt(form) {
  const { promptMode, promptTone, customRules, customOutput,
          badge, title, problem, actions, result, tools, repo, demo, writeup } = form

  const config = PROMPT_CONFIG[promptMode]
  const toneRules = TONE_CONFIG[promptTone] || ''
  if (!config) return ''

  const finalRules = customRules || `${config.rules}\n${toneRules}`.trim()
  const finalOutput = customOutput || config.output.trim()

  const refs = buildReferences(repo, demo, writeup)
  const data = {
    badge: sanitizeBadge(badge),
    title, problem, actions, result, tools, refs,
    tone: promptTone,
    rules: finalRules,
    output: finalOutput
  }

  if (promptMode === 'readme') return buildReadmePrompt(data)
  if (promptMode === 'linkedin') return buildLinkedInPrompt(data)
  if (promptMode === 'web') return buildWebPrompt(data)
  return buildPortfolioPrompt(data)
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
${data.refs || '(none)'}

Rules:
${data.rules}

Output:
${data.output}`
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
${data.refs || '(none)'}

Rules:
${data.rules}

Output:
${data.output}`
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
${data.refs || '(none)'}

Rules:
${data.rules}

Output:
${data.output}`
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
${data.refs || '(none)'}

Rules:
${data.rules}

Output:
${data.output}`
}
