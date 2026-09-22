import { Link } from 'react-router'
import type { Project } from '../lib/content-types'

/**
 * Bento slot: position class and background visual. Every tile is dark — the
 * texture is what distinguishes them, not a coloured fill (see tokens.css).
 */
const SLOTS = [
  { position: 't1', visual: 'v1', tone: '' },
  { position: 't2', visual: 'v2', tone: '' },
  { position: 't3', visual: 'v3', tone: 'deep' },
  { position: 't4', visual: 'v4', tone: '' },
  { position: 't5', visual: 'v5', tone: 'deep' },
] as const

export function ProjectTile({ project, index }: { project: Project; index: number }) {
  const slot = SLOTS[index] ?? SLOTS[SLOTS.length - 1]
  const { title, description, period, stack, tone, tile } = project.frontmatter

  const visual = tile ?? slot.visual
  const cardTone = tone && tone !== 'default' ? tone : slot.tone
  const className = ['card', 'mark', 'tile', slot.position, cardTone, 'rv']
    .filter(Boolean)
    .join(' ')

  return (
    <Link className={className} to={`/projects/${project.slug}`}>
      <div className={`vis ${visual}`} aria-hidden="true">
        {visual === 'v5' &&
          Array.from({ length: 18 }, (_, i) => <i key={i} />)}
      </div>
      <div className="top">
        <span className="tag">{[period, ...stack.slice(0, 2)].join(' | ')}</span>
        <span className="arrow" aria-hidden="true">
          &#8599;
        </span>
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}
