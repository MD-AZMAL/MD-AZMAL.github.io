import type { ComponentType } from 'react'
import type { TopicId } from '../site.config'

/** Thumbnail styles defined in src/styles/archive.css (.thumb.g1 … .g6). */
export type ThumbId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6'

/** Bento tile visuals defined in src/styles/home.css (.v1 … .v5). */
export type TileId = 'v1' | 'v2' | 'v3' | 'v4' | 'v5'

export type Tone = 'default' | 'deep' | 'orange'

/** Frontmatter shared by every MDX document. */
export interface Frontmatter {
  title: string
  description: string
  draft?: boolean
  topic?: TopicId
  thumb?: ThumbId
  [key: string]: unknown
}

export interface BlogFrontmatter extends Frontmatter {
  /** ISO date, e.g. 2026-04-12. Drives sorting and the displayed month. */
  date: string
  /** Optional ISO date shown as "Updated …". */
  updated?: string
  topic: TopicId
  tags?: string[]
  thumb?: ThumbId
  /** Overrides the computed reading time when set. */
  readingTime?: number
  series?: { name: string; index: number }
  /** A live demo, shown as the orange pill at the top right of the title card. */
  link?: string
  /** The source, shown as the outlined pill beside it. */
  repo?: string
}

export interface ProjectFrontmatter extends Frontmatter {
  /** Year or range shown on the tile, e.g. "2019" or "2019 – 2021". */
  period: string
  /** Used for sorting; higher is newer. */
  year: number
  stack: string[]
  topic: TopicId
  repo?: string
  link?: string
  /** Promotes the project onto the home page bento. */
  featured?: boolean
  /** Position within the home bento, 1-5. Lower comes first. */
  order?: number
  tile?: TileId
  tone?: Tone
  status?: string
}

/** Injected by plugins/remark-post-meta.mjs. */
export interface PostMeta {
  headings: { id: string; text: string; depth: 2 | 3 }[]
  wordCount: number
  readingTime: number
}

export interface MdxModule<F extends Frontmatter> {
  frontmatter: F
  meta: PostMeta
  default: ComponentType<{ components?: Record<string, unknown> }>
}

export interface Doc<F extends Frontmatter> {
  slug: string
  frontmatter: F
  meta: PostMeta
  Content: ComponentType<{ components?: Record<string, unknown> }>
}

export type Post = Doc<BlogFrontmatter>
export type Project = Doc<ProjectFrontmatter>
