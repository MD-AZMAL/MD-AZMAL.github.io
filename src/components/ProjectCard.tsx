import { Link } from 'react-router'
import { topicLabel } from '../site.config'
import { thumbFor } from '../lib/content'
import { Hud } from './Hud'
import type { Project } from '../lib/content-types'

export function ProjectCard({ project, big }: { project: Project; big?: boolean }) {
  const { title, description, period, stack, topic, status } = project.frontmatter
  const className = ['card', 'post', big ? 'big' : '', 'rv'].filter(Boolean).join(' ')

  return (
    <Link className={className} to={`/projects/${project.slug}`}>
      <div className={`thumb ${thumbFor(project)}`} aria-hidden="true" />
      <div className="meta">
        <span className="kind">{topicLabel(topic)}</span>
        <span className="date spaced">
          <span>{period}</span>
          {status && <span>{status}</span>}
        </span>
      </div>
      <div>
        <h3>{title}</h3>
        {big && <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 8 }}>{description}</p>}
        <div className="proj-meta">
          {stack.slice(0, big ? 6 : 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <Hud />
    </Link>
  )
}
