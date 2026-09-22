import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { topics } from '../site.config'
import { posts } from '../lib/content'
import { useDragScroll, useHydrated } from '../lib/hooks'
import { PostCard } from '../components/PostCard'

export function Blog() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const hydrated = useHydrated()
  const topicRow = useDragScroll<HTMLDivElement>()
  const tagRow = useDragScroll<HTMLDivElement>()

  // Two independent filters, applied together: the topic (one per post) and a
  // tag (any number per post). Both live in the URL so a filtered view can be
  // linked to - the tags on a post's title card point here.
  const topic = hydrated ? (params.get('topic') ?? '') : ''
  const tag = hydrated ? (params.get('tag') ?? '') : ''

  const usedTopics = useMemo(
    () => topics.filter((t) => posts.some((p) => p.frontmatter.topic === t.id)),
    [],
  )

  // Most-used first, then alphabetical.
  const usedTags = useMemo(() => {
    const counts = new Map<string, number>()
    posts.forEach((p) => (p.frontmatter.tags ?? []).forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name)
  }, [])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return posts.filter((post) => {
      const fm = post.frontmatter
      if (topic && fm.topic !== topic) return false
      if (tag && !(fm.tags ?? []).includes(tag)) return false
      if (!needle) return true
      const haystack = [fm.title, fm.description, ...(fm.tags ?? [])].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [topic, tag, query])

  const setParam = (key: 'topic' | 'tag', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <main className="wrap page" id="main">
      <div className="arch-hero">
        <div className="title rv">
          <h1>
            Blog<span aria-hidden="true" />
          </h1>
          <p className="lede">
            Essays, technical writeups and short notes from building at the edge of agentic AI,
            security and distributed systems.
          </p>
        </div>

        {/* Just the field, no panel: it sits on the page, its bottom level with
            the caption's under the title. */}
        <div className="search bare rv">
          <div className="field">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
              aria-label="Search posts"
            />
            <i aria-hidden="true">&#8981;</i>
          </div>
        </div>
      </div>

      <div className="toolbar rv">
        <div className="filter-rows">
          <div
            className="filters scroller"
            ref={topicRow}
            role="group"
            aria-label="Filter by topic"
          >
            <button
              type="button"
              className={!topic ? 'on' : undefined}
              onClick={() => setParam('topic', '')}
              aria-pressed={!topic}
            >
              All
            </button>
            {usedTopics.map((item) => (
              <button
                key={item.id}
                type="button"
                className={topic === item.id ? 'on' : undefined}
                onClick={() => setParam('topic', item.id)}
                aria-pressed={topic === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          {usedTags.length > 0 && (
            <div
              className="filters tag-filters scroller"
              ref={tagRow}
              role="group"
              aria-label="Filter by tag"
            >
              {usedTags.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={tag === name ? 'on' : undefined}
                  // A second click on the active tag clears it.
                  onClick={() => setParam('tag', tag === name ? '' : name)}
                  aria-pressed={tag === name}
                >
                  <i aria-hidden="true">#</i>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="mono">
          showing {visible.length} of {posts.length}
        </span>
      </div>

      {/* Rows of three; a short last row shares its width - see .fill-rows. */}
      <div className="arch fill-rows">
        {visible.length === 0 ? (
          <div className="card empty">
            {posts.length === 0 ? (
              <>
                <b>Nothing published yet.</b>
                Posts live in <code>content/blog/*.mdx</code>. Copy{' '}
                <code>TEMPLATE.mdx</code>, set <code>draft: false</code>, and push.
              </>
            ) : (
              <>
                <b>Nothing matches that yet.</b>
                Try another topic or tag, or clear the search.
              </>
            )}
          </div>
        ) : (
          visible.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>
    </main>
  )
}
