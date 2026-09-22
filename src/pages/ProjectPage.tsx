import { Link, useParams } from 'react-router'
import { site, topicLabel } from '../site.config'
import { projectBySlug, projectNeighbours, projects } from '../lib/content'
import { useReadingProgress } from '../lib/hooks'
import { LinkPills, ShareDial } from '../components/HeroActions'
import { Toc } from '../components/Toc'
import { ProjectCard } from '../components/ProjectCard'
import { NotFound } from './NotFound'

export function ProjectPage() {
  const { slug = '' } = useParams()
  const project = projectBySlug(slug)
  const progress = useReadingProgress()

  if (!project) return <NotFound />

  const { title, description, period, stack, topic, repo, link, status } = project.frontmatter
  // The cards at the foot are the way on: the projects either side of this
  // one in list order, so there is no separate Previous / Next row. At either
  // end of the list the missing side is made up from the rest.
  const { prev, next } = projectNeighbours(slug)
  const neighbours = [prev, next].filter((p): p is NonNullable<typeof p> => Boolean(p))
  const related = [
    ...neighbours,
    ...projects.filter((p) => p.slug !== slug && !neighbours.includes(p)),
  ].slice(0, 2)
  const Content = project.Content

  return (
    <>
      <div className="readbar" ref={progress} aria-hidden="true" />

      <main className="wrap page" id="main">
        <div className="art-layout">
          {/* `wide-back`: "All projects" is longer than "All posts", and the
              notch in the title card has to be cut to the button's width. */}
          <div className="art-main wide-back">
            <div className="hero-wrap">
              <Link className="close art-back" to="/projects">
                <i aria-hidden="true">&larr;</i>All projects
              </Link>
              <div className="card hero-t rv">
                <LinkPills link={link} repo={repo} />
                <div>
                  <h1>{title}</h1>
                  <p className="byline">
                    by <b>{site.name}</b>, {period}
                    {status && `, ${status}`}
                  </p>
                  <p className="dek">{description}</p>
                </div>
                <div className="hero-foot">
                  <div className="tags">
                    <Link className="topic" to={`/projects?topic=${topic}`}>
                      {topicLabel(topic)}
                    </Link>
                    {stack.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <ShareDial title={title} path={`/projects/${slug}`} />
            </div>

            {/* Under 900px there is no rail; the contents sit here instead. */}
            <Toc meta={project.meta} inline />

            <article className="prose rv">
              <Content />
            </article>
          </div>

          <aside className="art-side">
            <Toc meta={project.meta} />
          </aside>
        </div>

        <div className="end">
          {related.map((item) => (
            <ProjectCard key={item.slug} project={item} />
          ))}
          <div className="card cta-s rv">
            <h3>Questions about how this was built?</h3>
            <a
              className="btn"
              href={`mailto:${site.email}?subject=${encodeURIComponent(title)}`}
            >
              <i aria-hidden="true">&rarr;</i>Ask me
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
