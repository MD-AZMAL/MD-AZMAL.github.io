import { useActiveHeading } from '../lib/hooks'
import type { PostMeta } from '../lib/content-types'

/**
 * The contents, in one of two places:
 * - the rail (default), pinned to the window's left edge. Each section is a
 *   dash with its heading beside it; the section being read takes the accent
 *   and a longer dash. Where the margin is too narrow for the headings, only
 *   the dashes show and the headings open on hover or focus (see article.css).
 * - `inline`, for screens too narrow for any rail (under 900px): a collapsed
 *   "On this page" between the title card and the text, where a reader on a
 *   phone meets it before the piece rather than after it.
 * Each page renders both; CSS shows the one that fits.
 */
export function Toc({
  meta,
  title = 'On this page',
  inline = false,
}: {
  meta: PostMeta
  title?: string
  inline?: boolean
}) {
  const headings = meta.headings
  const active = useActiveHeading(headings.map((h) => h.id))

  if (headings.length < 2) return null

  const list = (
    <nav className="toc" aria-label={title}>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={[heading.depth === 2 ? '' : 'sub', active === heading.id ? 'on' : '']
            .filter(Boolean)
            .join(' ')}
          aria-current={active === heading.id ? 'location' : undefined}
        >
          <i aria-hidden="true" />
          <span>{heading.text}</span>
        </a>
      ))}
    </nav>
  )

  if (!inline) return list

  return (
    <details className="toc-inline">
      <summary>{title}</summary>
      {list}
    </details>
  )
}
