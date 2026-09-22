import { Link, useParams } from 'react-router'
import { site, topicLabel } from '../site.config'
import {
  formatMonth,
  postBySlug,
  postNeighbours,
  readingTime,
  relatedPosts,
} from '../lib/content'
import { useReadingProgress } from '../lib/hooks'
import { LinkPills, ShareDial } from '../components/HeroActions'
import { Toc } from '../components/Toc'
import { PostCard } from '../components/PostCard'
import { NotFound } from './NotFound'

export function BlogPost() {
  const { slug = '' } = useParams()
  const post = postBySlug(slug)
  const progress = useReadingProgress()

  if (!post) return <NotFound />

  const { title, description, date, updated, topic, tags, link, repo } = post.frontmatter
  const { prev, next } = postNeighbours(slug)
  const related = relatedPosts(slug, 2)
  const Content = post.Content

  return (
    <>
      <div className="readbar" ref={progress} aria-hidden="true" />

      <main className="wrap page" id="main">
        <div className="art-layout">
          <div className="art-main">
            {/* The back button and the share dial sit in notches cut out of
                the title card's top-left and bottom-right corners. */}
            <div className="hero-wrap">
              <Link className="close art-back" to="/blog">
                <i aria-hidden="true">&larr;</i>All posts
              </Link>
              <div className="card hero-t rv">
                <LinkPills link={link} repo={repo} />
                <div>
                  <h1>{title}</h1>
                  <p className="byline">
                    by <b>{site.name}</b>, {formatMonth(date)}, {readingTime(post)} min read
                    {updated && `, updated ${formatMonth(updated)}`}
                  </p>
                  <p className="dek">{description}</p>
                </div>
                <div className="hero-foot">
                  {/* The topic leads the row, outlined; the tags follow. Each
                      links to the blog filtered by it. */}
                  <div className="tags">
                    <Link className="topic" to={`/blog?topic=${topic}`}>
                      {topicLabel(topic)}
                    </Link>
                    {(tags ?? []).map((tag) => (
                      <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <ShareDial title={title} path={`/blog/${slug}`} />
            </div>

            {/* Under 900px there is no rail; the contents sit here instead. */}
            <Toc meta={post.meta} inline />

            <article className="prose rv">
              <Content />
            </article>
          </div>

          <aside className="art-side">
            <Toc meta={post.meta} />
          </aside>
        </div>

        {(prev || next) && (
          <div className="prev-next">
            {prev && (
              <Link className="card" to={`/blog/${prev.slug}`}>
                <small>&larr; Previous</small>
                <b>{prev.frontmatter.title}</b>
              </Link>
            )}
            {next && (
              <Link className="card r" to={`/blog/${next.slug}`}>
                <small>Next &rarr;</small>
                <b>{next.frontmatter.title}</b>
              </Link>
            )}
          </div>
        )}

        <div className="end">
          {related.map((item) => (
            <PostCard key={item.slug} post={item} />
          ))}
          <div className="card cta-s rv">
            <h3>Working on something similar? Let&rsquo;s compare notes.</h3>
            <a
              className="btn"
              href={`mailto:${site.email}?subject=${encodeURIComponent(title)}`}
            >
              <i aria-hidden="true">&rarr;</i>Get in touch
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
