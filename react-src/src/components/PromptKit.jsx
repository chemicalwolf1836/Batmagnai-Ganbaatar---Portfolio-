import { useState, useEffect, useRef } from 'react'
import { PROMPT_CONFIG, TONE_CONFIG } from '../config.js'
import { buildPrompt } from '../utils.js'
import { useDraftField, useJsonStorage } from '../hooks/useLocalStorage.js'
import PreviewCard from './PreviewCard.jsx'
import SavedPrompts from './SavedPrompts.jsx'

const SAVED_KEY = 'promptkit_saved_prompts_v2'
const DRAFT_FIELDS = ['badge', 'title', 'problem', 'actions', 'result', 'tools', 'repo', 'demo', 'writeup']

export default function PromptKit() {
  // --- Draft form fields (each saved individually to localStorage) ---
  const [badge, setBadge] = useDraftField('badge', 'Front End')
  const [title, setTitle] = useDraftField('title', '')
  const [problem, setProblem] = useDraftField('problem', '')
  const [actions, setActions] = useDraftField('actions', '')
  const [result, setResult] = useDraftField('result', '')
  const [tools, setTools] = useDraftField('tools', '')
  const [repo, setRepo] = useDraftField('repo', '')
  const [demo, setDemo] = useDraftField('demo', '')
  const [writeup, setWriteup] = useDraftField('writeup', '')

  // --- Prompt configuration ---
  const [promptMode, setPromptMode] = useState('portfolio')
  const [promptTone, setPromptTone] = useState('professional')
  const [customRules, setCustomRules] = useState('')
  const [customOutput, setCustomOutput] = useState('')

  // --- Output & status ---
  const [output, setOutput] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // --- Saved prompts ---
  const [savedPrompts, setSavedPrompts] = useJsonStorage(SAVED_KEY, [])
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // --- Ref to skip loading defaults on first render ---
  const isFirstRender = useRef(true)

  // Load defaults when mode or tone changes (not on initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    applyDefaults(promptMode, promptTone)
  }, [promptMode, promptTone])

  function applyDefaults(mode, tone) {
    const config = PROMPT_CONFIG[mode]
    const toneRules = TONE_CONFIG[tone] || ''
    if (!config) return
    setCustomRules(`${config.rules}\n${toneRules}`.trim())
    setCustomOutput(config.output.trim())
  }

  // --- Status helpers ---
  function showSaveStatus(msg) {
    setSaveStatus(msg)
    if (msg) setTimeout(() => setSaveStatus(''), 2000)
  }

  function showCopyStatus(msg) {
    setCopyStatus(msg)
    if (msg) setTimeout(() => setCopyStatus(''), 2000)
  }

  // --- The form as a plain object (used by buildPrompt and PreviewCard) ---
  const form = {
    badge, title, problem, actions, result, tools, repo, demo, writeup,
    promptMode, promptTone, customRules, customOutput
  }

  // --- Generate ---
  function handleGenerate() {
    if (isGenerating) { showCopyStatus('Please wait...'); return }

    if (!actions.trim()) { showCopyStatus('Please add at least one action.'); return }
    const lines = actions.trim().split('\n').filter(Boolean)
    if (lines.length < 3 || lines.length > 6) {
      showCopyStatus('Please add between 3 and 6 action bullets.')
      return
    }

    setIsGenerating(true)
    setOutput(buildPrompt(form))
    showCopyStatus('Prompt generated.')
    setTimeout(() => setIsGenerating(false), 1000)
  }

  // --- Clear form ---
  function handleClear() {
    setBadge('Front End'); setTitle(''); setProblem(''); setActions('')
    setResult(''); setTools(''); setRepo(''); setDemo(''); setWriteup('')
    setOutput('')
    setEditingId(null)
  }

  // --- Clear saved draft ---
  function handleClearDraft() {
    if (!confirm('Are you sure you want to clear the saved draft? This cannot be undone.')) return
    const toClear = ['problem', 'actions', 'result', 'tools', 'repo', 'demo', 'writeup']
    toClear.forEach(key => localStorage.removeItem(key))
    setProblem(''); setActions(''); setResult(''); setTools('')
    setRepo(''); setDemo(''); setWriteup('')
    setOutput('')
    showSaveStatus('Saved draft cleared.')
  }

  // --- Copy prompt to clipboard ---
  async function handleCopyPrompt() {
    if (!output.trim()) { showCopyStatus('Nothing to copy.'); return }
    try {
      await navigator.clipboard.writeText(output)
      showCopyStatus('Prompt copied to clipboard.')
    } catch {
      showCopyStatus('Copy failed — please select and copy manually.')
    }
  }

  // --- Save / update prompt ---
  function handleSave() {
    if (!title.trim() && !problem.trim() && !result.trim()) {
      showSaveStatus('Add some content first.')
      return
    }

    const entry = {
      id: editingId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      badge: badge.trim() || 'Workflow',
      title: title.trim() || 'Untitled project',
      problem: problem.trim(),
      actions: actions.trim(),
      result: result.trim(),
      tools: tools.trim(),
      createdAt: new Date().toISOString()
    }

    const wasEditing = Boolean(editingId)
    const updated = wasEditing
      ? savedPrompts.map(p => p.id === editingId ? entry : p)
      : [...savedPrompts, entry]

    setSavedPrompts(updated)
    setEditingId(null)
    showSaveStatus(wasEditing ? '🔄 Prompt updated.' : '✅ Prompt saved.')
  }

  // --- Load a saved prompt into the form ---
  function handleLoad(id) {
    const p = savedPrompts.find(x => x.id === id)
    if (!p) return
    setBadge(p.badge || ''); setTitle(p.title || '')
    setProblem(p.problem || ''); setActions(p.actions || '')
    setResult(p.result || ''); setTools(p.tools || '')
    setEditingId(id)
    showSaveStatus('Prompt loaded.')
  }

  // --- Copy a saved prompt's raw data to clipboard ---
  async function handleCopyCard(id) {
    const p = savedPrompts.find(x => x.id === id)
    if (!p) return
    setEditingId(p.id)
    const text = [
      `Badge: ${p.badge || ''}`,
      `Title: ${p.title || ''}`,
      '',
      'Problem:', p.problem || '',
      '',
      'Actions:', p.actions || '',
      '',
      'Result:', p.result || '',
      '',
      'Tools:', p.tools || ''
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      showSaveStatus('Copied to clipboard.')
    } catch {
      showSaveStatus('Copy failed.')
    }
  }

  // --- Delete a saved prompt ---
  function handleDelete(id) {
    setSavedPrompts(savedPrompts.filter(p => p.id !== id))
    showSaveStatus('Prompt deleted.')
  }

  // --- Export JSON ---
  function handleExport() {
    const blob = new Blob([JSON.stringify(savedPrompts, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'promptkit-backup.json'
    link.click()
    URL.revokeObjectURL(url)
    showSaveStatus('📤 Prompts exported.')
  }

  // --- Import JSON ---
  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result)
        if (!Array.isArray(imported)) { showSaveStatus('Invalid JSON file.'); return }
        const cleaned = imported.map(item => ({
          id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
          badge: item.badge || 'Workflow',
          title: item.title || 'Untitled project',
          problem: item.problem || '',
          actions: item.actions || '',
          result: item.result || '',
          tools: item.tools || '',
          createdAt: item.createdAt || new Date().toISOString()
        }))
        setSavedPrompts(cleaned)
        setEditingId(null)
        showSaveStatus('📥 Prompts imported.')
      } catch {
        showSaveStatus('❌ Import failed.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const draftIsEmpty = !problem && !actions && !result && !tools && !repo && !demo && !writeup
  const editingTitle = editingId
    ? savedPrompts.find(p => p.id === editingId)?.title || 'Untitled project'
    : null

  return (
    <>
      {/* Input section */}
      <section className="section">
        <h2>Input</h2>
        <h3 className="section-title">Prompt Setup</h3>
        <p className="section-subtext">Auto-filled based on your selections. You can edit if needed.</p>

        <div className="formish" aria-label="PromptKit inputs">

          <div className="field">
            <label htmlFor="promptMode">Prompt mode</label>
            <select id="promptMode" value={promptMode} onChange={e => setPromptMode(e.target.value)}>
              <option value="portfolio">Portfolio Card</option>
              <option value="readme">README Section</option>
              <option value="linkedin">LinkedIn Post</option>
              <option value="web">Web Project Builder</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="promptTone">Tone</label>
            <select id="promptTone" value={promptTone} onChange={e => setPromptTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="recruiter">Recruiter-friendly</option>
              <option value="technical">Technical</option>
              <option value="beginner">Beginner-friendly</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="customRules">Rules</label>
            <textarea
              id="customRules"
              rows={8}
              placeholder="Prompt rules will appear here..."
              value={customRules}
              onChange={e => setCustomRules(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="customOutput">Output format</label>
            <textarea
              id="customOutput"
              rows={8}
              placeholder="Output format will appear here..."
              value={customOutput}
              onChange={e => setCustomOutput(e.target.value)}
            />
          </div>

          <div className="actions">
            <button type="button" className="btn" onClick={() => applyDefaults(promptMode, promptTone)}>
              Reset defaults
            </button>
          </div>

          <hr className="section-divider" />

          <h3 className="section-title">Project Details</h3>

          <div className="field">
            <label htmlFor="badge">Badge</label>
            <input id="badge" type="text" placeholder="e.g. Front End, AI, DevOps"
              value={badge} onChange={e => setBadge(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" placeholder="Project title"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="problem">Problem</label>
            <textarea id="problem" placeholder="What problem were you solving?"
              value={problem} onChange={e => setProblem(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="actions">Actions (3–6 bullets, one per line)</label>
            <textarea id="actions" placeholder={'- Did X\n- Did Y\n- Did Z'}
              value={actions} onChange={e => setActions(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="result">Result</label>
            <textarea id="result" placeholder="What changed? What was the outcome?"
              value={result} onChange={e => setResult(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="tools">Tools (comma-separated)</label>
            <input id="tools" placeholder="HTML, CSS, JavaScript"
              value={tools} onChange={e => setTools(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="repo">Reference: Repo URL (optional)</label>
            <input id="repo" placeholder="https://github.com/..."
              value={repo} onChange={e => setRepo(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="demo">Reference: Demo URL (optional)</label>
            <input id="demo" placeholder="https://..."
              value={demo} onChange={e => setDemo(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="writeup">Reference: Write-up URL (optional)</label>
            <input id="writeup" placeholder="https://..."
              value={writeup} onChange={e => setWriteup(e.target.value)} />
          </div>

          <div className="btn-group">
            <div className="actions">
              <button className="btn primary" type="button" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Prompt'}
              </button>
              <button className="btn" type="button" onClick={handleSave}>
                {editingId ? 'Update Prompt' : 'Save Prompt'}
              </button>
              <button className="btn" type="button" onClick={handleClear}>Clear</button>
              <button className="btn" type="button" onClick={handleClearDraft} disabled={draftIsEmpty}>
                Clear Saved Draft
              </button>
            </div>
            {saveStatus && <span id="saveStatus">{saveStatus}</span>}
            <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Tip: if you click twice while generating, you'll see "Please wait…".
            </p>
          </div>

          {editingTitle && (
            <p className="muted">✏️ Editing: {editingTitle}</p>
          )}

        </div>
      </section>

      {/* Generated prompt section */}
      <section className="section">
        <h2>Generated prompt</h2>
        <p>Copy this prompt and paste it into ChatGPT.</p>

        <div className="formish">
          <div className="field">
            <label htmlFor="output">Prompt</label>
            <textarea id="output" readOnly placeholder="Your generated prompt will appear here." value={output} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn primary"
              type="button"
              onClick={handleCopyPrompt}
              style={{ width: '100%', borderRadius: '999px', justifyContent: 'flex-start' }}
            >
              Copy Prompt
            </button>
            {copyStatus && <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{copyStatus}</p>}
          </div>
        </div>
      </section>

      {/* Preview section */}
      <section className="section">
        <h2>Preview</h2>
        <p>Preview of how your prompt will be structured.</p>
        <PreviewCard form={form} />
      </section>

      {/* Saved prompts section */}
      <SavedPrompts
        prompts={savedPrompts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoad={handleLoad}
        onCopy={handleCopyCard}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        saveStatus={saveStatus}
      />
    </>
  )
}
