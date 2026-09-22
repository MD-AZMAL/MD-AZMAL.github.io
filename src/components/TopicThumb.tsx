import type { ReactNode } from 'react'
import type { TopicId } from '../site.config'
import type { Post } from '../lib/content-types'
import { thumbFor } from '../lib/content'

/**
 * Thumbnail art for a post card, by topic: every post in a topic shares one
 * picture, so a topic reads at a glance across the archive. A topic gets its
 * art when its first post does; one without falls back to the generated
 * textures (.thumb.g1-g6, picked from the slug). A post's own `thumb`
 * frontmatter still wins over both.
 *
 * Each piece keeps to the house style: a monochrome texture (the CSS on
 * .thumb.topic-<id>), one simple motif, orange as a single mark, and a hover
 * that moves the motif along its own shape with an orange trace (.tr) run
 * along it - never a reshape. See "topic art" in archive.css.
 */
const ART: Partial<Record<TopicId, ReactNode>> = {
  // Agentic AI: the agent loop. The model at the centre, three steps on the
  // ring around it, the current one orange. On hover the ring marches, the
  // steps orbit, and the ring is traced in orange from the top.
  ai: (
    <svg className="topic-art" viewBox="0 0 120 96" width="120" height="96">
      <circle className="loop" cx="60" cy="48" r="30" />
      <circle
        className="loop-tr tr"
        cx="60"
        cy="48"
        r="30"
        pathLength={1}
        transform="rotate(-90 60 48)"
      />
      <g className="orbit">
        <circle className="step on" cx="60" cy="18" r="4.5" />
        <circle className="step" cx="85.98" cy="63" r="4.5" />
        <circle className="step" cx="34.02" cy="63" r="4.5" />
      </g>
      <circle className="core" cx="60" cy="48" r="3" />
    </svg>
  ),
}

export function TopicThumb({ post }: { post: Post }) {
  const { thumb, topic } = post.frontmatter
  const art = thumb ? null : ART[topic]
  if (art) {
    return (
      <div className={`thumb topic-${topic}`} aria-hidden="true">
        {art}
      </div>
    )
  }
  return <div className={`thumb ${thumbFor(post)}`} aria-hidden="true" />
}
