export default function SavedPrompts({
  prompts,
  searchQuery,
  onSearchChange,
  onLoad,
  onCopy,
  onDelete,
  onExport,
  onImport,
  saveStatus
}) {
  const filtered = prompts.filter(p => {
    const q = searchQuery.toLowerCase()
    return [p.title, p.badge, p.problem, p.result, p.tools].join(' ').toLowerCase().includes(q)
  })

  const countLabel = `Saved Prompts (${filtered.length})`

  return (
    <section className="section">
      <h2>{countLabel}</h2>
      <p className="sub">Save, reload, and reuse structured prompts.</p>

      <input
        type="text"
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search prompts..."
        className="search-input"
      />

      <div className="saved-tools">
        <button className="btn" type="button" onClick={onExport} disabled={prompts.length === 0}>
          Export JSON
        </button>
        <label className="btn" htmlFor="importInput">Import JSON</label>
        <input type="file" id="importInput" accept=".json" hidden onChange={onImport} />
      </div>

      <div className="saved-prompts-grid">
        {prompts.length === 0 && (
          <p className="empty-state">No saved prompts yet.<br />Start building your first workflow 🚀</p>
        )}
        {prompts.length > 0 && filtered.length === 0 && (
          <p className="empty-state">No matching prompts found.<br />Try a different keyword.</p>
        )}
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div className="meta">
              <span className="badge">{p.badge}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.result || 'No outcome yet.'}</p>
            <p className="muted">{p.tools || ''}</p>
            <div className="saved-actions">
              <button className="btn" type="button" onClick={() => onLoad(p.id)}>Load</button>
              <button className="btn" type="button" onClick={() => onCopy(p.id)}>Copy</button>
              <button className="btn" type="button" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {saveStatus && (
        <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>{saveStatus}</p>
      )}
    </section>
  )
}
