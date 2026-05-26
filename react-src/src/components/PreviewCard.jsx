import { sanitizeBadge, splitBullets, formatUrl } from '../utils.js'

export default function PreviewCard({ form }) {
  const { badge, title, problem, actions, result, tools, repo, demo, writeup } = form

  const displayBadge = sanitizeBadge(badge)
  const displayTitle = title.trim() || 'Untitled project'
  const displayResult = result.trim() || 'Outcome will appear here.'
  const displayProblem = problem.trim() || 'What problem were you solving?'
  const displayTools = tools.trim() || 'HTML, CSS, JavaScript'
  const bullets = splitBullets(actions)
  const status = result.trim() ? 'Ready' : 'Draft'

  const links = []
  if (repo.trim()) links.push({ label: 'Repo', href: formatUrl(repo.trim()) })
  if (demo.trim()) links.push({ label: 'Demo', href: formatUrl(demo.trim()) })
  if (writeup.trim()) links.push({ label: 'Write-up', href: formatUrl(writeup.trim()) })

  return (
    <article className="card">
      <div className="meta">
        <span className="badge">{displayBadge}</span>
        <span className="muted">{status}</span>
      </div>
      <h3>{displayTitle}</h3>

      <div className="section-block">
        <p><strong>Problem</strong></p>
        <p>{displayProblem}</p>
      </div>

      <div className="section-block">
        <p><strong>Actions</strong></p>
        {bullets.length > 0
          ? <p>{bullets.map((b, i) => <span key={i}>• {b}{i < bullets.length - 1 && <br />}</span>)}</p>
          : <p style={{ opacity: 0.8 }}>• Add 3–6 action bullets to preview.</p>
        }
      </div>

      <p><strong>Result:</strong> {displayResult}</p>
      <p><strong>Tools:</strong> {displayTools}</p>

      <div className="links">
        {links.length > 0
          ? links.map(l => (
              <a key={l.label} className="link" href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ))
          : <span className="link" style={{ opacity: 0.6 }}>No references yet</span>
        }
      </div>
    </article>
  )
}
