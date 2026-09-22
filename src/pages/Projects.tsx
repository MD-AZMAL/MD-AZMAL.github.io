import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { site, topics } from '../site.config'
import { projects } from '../lib/content'
import { useDragScroll, useHydrated } from '../lib/hooks'
import { ProjectCard } from '../components/ProjectCard'

export function Projects() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')

  // Read only after hydration: the page is pre-rendered without a query
  // string, so honouring ?topic= on the first pass would mismatch the HTML.
  const topic = useHydrated() ? (params.get('topic') ?? '') : ''
  const topicRow = useDragScroll<HTMLDivElement>()

  const usedTopics = useMemo(
    () => topics.filter((t) => projects.some((p) => p.frontmatter.topic === t.id)),
    [],
  )

  const stackCount = useMemo(
    () => new Set(projects.flatMap((p) => p.frontmatter.stack)).size,
    [],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      const fm = project.frontmatter
      if (topic && fm.topic !== topic) return false
      if (!needle) return true
      const haystack = [fm.title, fm.description, ...fm.stack].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [topic, query])

  const unfiltered = !topic && !query.trim()

  const setTopic = (next: string) => {
    const params2 = new URLSearchParams(params)
    if (next) params2.set('topic', next)
    else params2.delete('topic')
    setParams(params2, { replace: true })
  }

  return (
    <main className="wrap page" id="main">
      <div className="arch-hero">
        <div className="title rv">
          <h1>
            Work<span aria-hidden="true" />
          </h1>
          <p className="lede">
            Agentic systems, blockchain engines, honeypots and developer tooling &mdash; from
            research prototypes to things running in production.
          </p>
        </div>

        <div className="card mark search rv">
          <div className="field">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
            />
            <i aria-hidden="true">&#8981;</i>
          </div>
          <div className="counts">
            <div>
              <b>{projects.length}</b>
              <small>projects</small>
            </div>
            <div>
              <b>{usedTopics.length}</b>
              <small>areas</small>
            </div>
            <div>
              <b>{stackCount}</b>
              <small>technologies</small>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar rv">
        <div className="filters scroller" ref={topicRow}>
          <button
            type="button"
            className={!topic ? 'on' : undefined}
            onClick={() => setTopic('')}
            aria-pressed={!topic}
          >
            All
          </button>
          {usedTopics.map((item) => (
            <button
              key={item.id}
              type="button"
              className={topic === item.id ? 'on' : undefined}
              onClick={() => setTopic(item.id)}
              aria-pressed={topic === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="mono">
          showing {visible.length} of {projects.length}
        </span>
      </div>

      <div className="arch">
        {visible.length === 0 ? (
          <div className="card empty">
            <b>Nothing matches that yet.</b>
            Try another area or clear the search.
          </div>
        ) : (
          visible.map((project, index) => (
            <ProjectCard key={project.slug} project={project} big={index === 0 && unfiltered} />
          ))
        )}
        {unfiltered && (
          <div className="card subscribe rv">
            <h3>More of it lives on GitHub.</h3>
            <a
              className="btn"
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i aria-hidden="true">&#8599;</i>MD-AZMAL
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
