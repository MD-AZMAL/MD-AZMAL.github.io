import type {
  BlogFrontmatter,
  Doc,
  Frontmatter,
  MdxModule,
  Post,
  Project,
  ProjectFrontmatter,
} from './content-types'

/**
 * Every .mdx file under content/ is pulled in eagerly at build time. Eager is
 * deliberate: pages are pre-rendered to static HTML, so there is no request
 * waterfall to avoid, and it keeps the routing layer free of async boundaries.
 */
// TEMPLATE.mdx is a file to copy from, not a post: it stays out of the site in
// every build, dev included, so it can never show up as a dummy entry.
const blogModules = import.meta.glob<MdxModule<BlogFrontmatter>>(
  ['/content/blog/*.mdx', '!/content/blog/TEMPLATE.mdx'],
  { eager: true },
)
const projectModules = import.meta.glob<MdxModule<ProjectFrontmatter>>('/content/projects/*.mdx', {
  eager: true,
})

/** Drafts are visible while running `pnpm dev`, never in a production build. */
const showDrafts = import.meta.env.DEV

const slugFromPath = (path: string): string =>
  path.split('/').pop()!.replace(/\.mdx$/, '')

function toDocs<F extends Frontmatter>(
  modules: Record<string, MdxModule<F>>,
): Doc<F>[] {
  return Object.entries(modules)
    .map(([path, mod]) => ({
      slug: slugFromPath(path),
      frontmatter: mod.frontmatter,
      meta: mod.meta,
      Content: mod.default,
    }))
    .filter((doc) => showDrafts || !doc.frontmatter.draft)
}

/* ------------------------------------------------------------------ *
 * Blog
 * ------------------------------------------------------------------ */

export const posts: Post[] = toDocs(blogModules).sort((a, b) =>
  b.frontmatter.date.localeCompare(a.frontmatter.date),
)

export const postBySlug = (slug: string): Post | undefined =>
  posts.find((p) => p.slug === slug)

/** Previous/next in reading order (newer post first in `posts`). */
export function postNeighbours(slug: string): { prev?: Post; next?: Post } {
  const i = posts.findIndex((p) => p.slug === slug)
  if (i < 0) return {}
  return { prev: posts[i + 1], next: posts[i - 1] }
}

/** Up to `count` other posts, preferring the same topic. */
export function relatedPosts(slug: string, count = 2): Post[] {
  const current = postBySlug(slug)
  if (!current) return posts.slice(0, count)
  const others = posts.filter((p) => p.slug !== slug)
  const sameTopic = others.filter((p) => p.frontmatter.topic === current.frontmatter.topic)
  return [...sameTopic, ...others.filter((p) => !sameTopic.includes(p))].slice(0, count)
}

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

export const projects: Project[] = toDocs(projectModules).sort((a, b) => {
  const ao = a.frontmatter.order ?? 99
  const bo = b.frontmatter.order ?? 99
  if (ao !== bo) return ao - bo
  return b.frontmatter.year - a.frontmatter.year
})

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug)

/** The five projects that fill the home-page bento, in tile order. */
export const featuredProjects: Project[] = projects
  .filter((p) => p.frontmatter.featured)
  .slice(0, 5)

export function projectNeighbours(slug: string): { prev?: Project; next?: Project } {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i < 0) return {}
  return { prev: projects[i - 1], next: projects[i + 1] }
}

/* ------------------------------------------------------------------ *
 * Formatting helpers
 * ------------------------------------------------------------------ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * "2026-04-12" -> "Apr 2026". Parsed by hand rather than via Date so the
 * output is identical during pre-render and in the browser, whatever the
 * machine's locale or timezone happens to be.
 */
export function formatMonth(iso: string): string {
  const [year, month] = iso.split('-')
  const index = Number(month) - 1
  return `${MONTHS[index] ?? month} ${year}`
}

export function formatDay(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!day) return formatMonth(iso)
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? month} ${year}`
}

export const readingTime = (post: Post): number =>
  post.frontmatter.readingTime ?? post.meta.readingTime

/** Deterministic thumbnail when the author did not pick one. */
const THUMBS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const
export function thumbFor(doc: { slug: string; frontmatter: Frontmatter }): string {
  if (doc.frontmatter.thumb) return doc.frontmatter.thumb
  let hash = 0
  for (const char of doc.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return THUMBS[hash % THUMBS.length]
}
