import { Link } from 'react-router'
import { topicLabel } from '../site.config'
import { formatMonth, readingTime } from '../lib/content'
import { Hud } from './Hud'
import { TopicThumb } from './TopicThumb'
import type { Post } from '../lib/content-types'

interface PostCardProps {
  post: Post
  /** Renders the wide, tall variant used for the lead post in the archive. */
  big?: boolean
  reveal?: boolean
}

export function PostCard({ post, big, reveal = true }: PostCardProps) {
  const { title, topic, date } = post.frontmatter
  const className = [
    'card',
    'post',
    big ? 'big' : '',
    reveal ? 'rv' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link className={className} to={`/blog/${post.slug}`}>
      <TopicThumb post={post} />
      <div className="meta">
        {/* The topic, as on a project card - posts have no kind any more. */}
        <span className="kind">{topicLabel(topic)}</span>
        <span className="date">
          {formatMonth(date)} | {readingTime(post)} min
        </span>
      </div>
      <h3>{title}</h3>
      <Hud />
    </Link>
  )
}
