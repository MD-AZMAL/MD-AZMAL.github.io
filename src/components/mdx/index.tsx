import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router'

/* ------------------------------------------------------------------ *
 * Authoring components — available in every .mdx file without importing
 * ------------------------------------------------------------------ */

/**
 * Opening paragraph — the article's standfirst, set a size up from body copy.
 *
 * Renders a <div>, not a <p>: MDX wraps block-level children in their own
 * <p>, and a <p> inside a <p> is invalid HTML. The browser's parser would
 * split it, the DOM would stop matching what React rendered on the server,
 * and hydration would fail. The styling handles both shapes.
 */
export function Lead({ children }: { children: ReactNode }) {
  return <div className="lead">{children}</div>
}

/** Boxed aside. `tone` tints the little diamond: note | tip | warn. */
export function Callout({
  tone = 'note',
  children,
}: {
  tone?: 'note' | 'tip' | 'warn'
  children: ReactNode
}) {
  return (
    <div className={`callout ${tone}`}>
      <i aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

/**
 * Figure wrapper for hand-written SVG diagrams. Children are placed on a black
 * panel; pass `draw` to have the strokes animate in on scroll (each drawn
 * element needs `pathLength="1"`).
 */
export function Figure({
  caption,
  label,
  draw = true,
  children,
}: {
  caption?: ReactNode
  label?: string
  draw?: boolean
  children: ReactNode
}) {
  return (
    <figure className="fig-block">
      <div className={draw ? 'fig draw' : 'fig'}>{children}</div>
      {caption && (
        <figcaption>
          {label && <b>{label} </b>}
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Neutral "key takeaways" panel with an orange label and numerals. Wrap an ordered or unordered list. */
export function Keys({ title = 'Key takeaways', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="keys">
      <div className="k">{title}</div>
      {children}
    </div>
  )
}

/** Two-up comparison. Use with <Side kind="bad"> / <Side kind="good">. */
export function Compare({ children }: { children: ReactNode }) {
  return <div className="two">{children}</div>
}

export function Side({
  kind = 'good',
  label,
  children,
}: {
  kind?: 'bad' | 'good'
  label: string
  children: ReactNode
}) {
  return (
    <div className={`card ${kind}`}>
      <div className="k">{label}</div>
      {children}
    </div>
  )
}

/** Floating margin note. Renders inline on narrow screens. */
export function Note({ children }: { children: ReactNode }) {
  // A <div> for the same reason as <Lead> above.
  return <div className="aside-note">{children}</div>
}

/** Row of numbers under the article hero. */
export function Stats({ children }: { children: ReactNode }) {
  return <div className="strip-stats">{children}</div>
}

export function Stat({
  value,
  label,
  tone,
}: {
  value: ReactNode
  label: string
  /** `accent` keeps the card neutral and sets the figure in orange. */
  tone?: 'accent'
}) {
  // MDX props are not type-checked, so an old `tone="mint"` or `"orange"` in a
  // post would otherwise reach the class list and paint the card. Only the one
  // allowed value gets through.
  return (
    <div className={tone === 'accent' ? 'card accent' : 'card'}>
      <b>{value}</b>
      <small>{label}</small>
    </div>
  )
}

/** Small coloured pill, handy inside tables. */
/** Small pill for tables. Neutral by default; `tone="o"` marks the row that matters. */
export function Chip({ tone, children }: { tone?: 'o'; children: ReactNode }) {
  return <span className={tone === 'o' ? 'chip o' : 'chip'}>{children}</span>
}

/** Numbered notes at the foot of a post. Wrap an ordered list. */
export function Footnotes({ children }: { children: ReactNode }) {
  return (
    <div className="fn">
      <hr />
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Element overrides
 * ------------------------------------------------------------------ */

function MdxLink({ href = '', children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const isInternal = href.startsWith('/') && !href.startsWith('//')
  if (isInternal) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    )
  }
  const isExternal = /^https?:/.test(href)
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

/** Markdown tables get the article table styling plus horizontal scroll. */
function MdxTable(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="tbl-wrap">
      <table className="tbl" {...props} />
    </div>
  )
}

export const mdxComponents = {
  a: MdxLink,
  table: MdxTable,
  Lead,
  Callout,
  Figure,
  Keys,
  Compare,
  Side,
  Note,
  Stats,
  Stat,
  Chip,
  Footnotes,
}
