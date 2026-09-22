import { site, topicLabel } from '../site.config'
import { posts, postBySlug, projectBySlug, projects, readingTime } from './content'

export interface HeadData {
  title: string
  description: string
  /** Absolute canonical URL. */
  canonical: string
  ogType: 'website' | 'article' | 'profile'
  image: string
  imageAlt: string
  robots: string
  keywords: string[]
  /** Open Graph article:* tags, on posts. */
  article?: {
    published?: string
    modified?: string
    section?: string
    tags?: string[]
  }
  /** Schema.org nodes for this page; the Person and WebSite join them. */
  schema: Record<string, unknown>[]
}

/* The og image's real size, so a platform can lay the card out before it has
   fetched the file. Must match scripts/make-og.mjs. */
const OG_W = 1200
const OG_H = 630

const abs = (path: string): string => new URL(path, site.url).toString()

/**
 * A page's public URL. Every route but the root is a folder on GitHub Pages
 * (blog/foo/index.html), which serves it at /blog/foo/ and 301s /blog/foo
 * there - so the canonical, og:url and every schema URL carry the slash. A
 * canonical that redirects is one search engines may not honour.
 */
export const pageUrl = (path: string): string => abs(path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`)

const normalise = (pathname: string): string => {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/* ------------------------------------------------------------------ *
 * Structured data. Every page carries the same Person and WebSite, and its
 * own nodes point at them by @id rather than repeating them.
 * ------------------------------------------------------------------ */

const PERSON_ID = `${site.url}/#person`
const WEBSITE_ID = `${site.url}/#website`
const personRef = { '@id': PERSON_ID }

const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.url}/`,
  image: abs(site.avatar),
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  worksFor: { '@type': 'Organization', name: site.company },
  address: { '@type': 'PostalAddress', addressLocality: site.location },
  knowsAbout: ['Agentic AI', 'AI agents', 'LLM evaluation', 'Kubernetes', 'Blockchain', 'Cybersecurity'],
  sameAs: [site.links.github, site.links.linkedin, site.links.x],
}

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${site.url}/`,
  name: site.name,
  description: site.description,
  inLanguage: 'en',
  author: personRef,
  publisher: personRef,
}

const ogImage = {
  '@type': 'ImageObject',
  url: abs(site.ogImage),
  width: OG_W,
  height: OG_H,
}

const breadcrumbs = (trail: [name: string, path: string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: pageUrl(path),
  })),
})

/**
 * Maps a pathname to the page's head. Shared by the pre-render step (which
 * writes the tags into the static HTML) and the client (which swaps them on
 * in-app navigation), so the two can never drift.
 */
export function resolveHead(pathname: string): HeadData {
  const path = normalise(pathname)

  const base: HeadData = {
    title: site.title,
    description: site.description,
    canonical: pageUrl(path),
    ogType: 'website',
    image: abs(site.ogImage),
    imageAlt: site.ogImageAlt,
    // Lets search show a large image and a full snippet.
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: [...site.keywords],
    schema: [],
  }

  if (path === '/') {
    return {
      ...base,
      ogType: 'profile',
      schema: [
        {
          '@type': 'ProfilePage',
          '@id': `${site.url}/#profile`,
          url: `${site.url}/`,
          name: site.title,
          isPartOf: { '@id': WEBSITE_ID },
          mainEntity: personRef,
        },
      ],
    }
  }

  if (path === '/projects') {
    return {
      ...base,
      title: `Projects — ${site.name}`,
      description:
        'Things I have built: agentic AI systems, blockchain engines, honeypots and developer tooling.',
      schema: [
        {
          '@type': 'CollectionPage',
          url: pageUrl(path),
          name: `Projects — ${site.name}`,
          isPartOf: { '@id': WEBSITE_ID },
          author: personRef,
          hasPart: projects.map((p) => ({
            '@type': 'CreativeWork',
            name: p.frontmatter.title,
            url: pageUrl(`/projects/${p.slug}`),
          })),
        },
        breadcrumbs([
          ['Home', '/'],
          ['Projects', '/projects'],
        ]),
      ],
    }
  }

  if (path === '/blog') {
    return {
      ...base,
      title: `Blog — ${site.name}`,
      description:
        'Essays, technical writeups and short notes on agentic AI, security, blockchain and distributed systems.',
      schema: [
        {
          '@type': 'Blog',
          '@id': `${site.url}/blog#blog`,
          url: pageUrl(path),
          name: `Blog — ${site.name}`,
          inLanguage: 'en',
          isPartOf: { '@id': WEBSITE_ID },
          author: personRef,
          blogPost: posts.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.frontmatter.title,
            url: pageUrl(`/blog/${p.slug}`),
            datePublished: p.frontmatter.date,
          })),
        },
        breadcrumbs([
          ['Home', '/'],
          ['Blog', '/blog'],
        ]),
      ],
    }
  }

  if (path.startsWith('/projects/')) {
    const project = projectBySlug(path.slice('/projects/'.length))
    if (project) {
      const { title, description, stack, topic, repo, link, year } = project.frontmatter
      const url = pageUrl(path)
      return {
        ...base,
        title: `${title} — ${site.name}`,
        description,
        ogType: 'article',
        keywords: [...stack, topicLabel(topic), site.name],
        article: { section: topicLabel(topic), tags: [...stack] },
        schema: [
          {
            // A project with a repository is source code; one without is
            // just a piece of work.
            '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork',
            name: title,
            description,
            url,
            mainEntityOfPage: url,
            image: ogImage,
            author: personRef,
            dateCreated: String(year),
            keywords: stack.join(', '),
            ...(repo ? { codeRepository: repo } : {}),
            ...(link ? { sameAs: link } : {}),
            isPartOf: { '@id': WEBSITE_ID },
          },
          breadcrumbs([
            ['Home', '/'],
            ['Projects', '/projects'],
            [title, path],
          ]),
        ],
      }
    }
  }

  if (path.startsWith('/blog/')) {
    const post = postBySlug(path.slice('/blog/'.length))
    if (post) {
      const { title, description, date, updated, topic, tags = [] } = post.frontmatter
      const url = pageUrl(path)
      return {
        ...base,
        title: `${title} — ${site.name}`,
        description,
        ogType: 'article',
        keywords: [...tags, topicLabel(topic), site.name],
        article: {
          published: date,
          modified: updated ?? date,
          section: topicLabel(topic),
          tags,
        },
        schema: [
          {
            '@type': 'BlogPosting',
            headline: title,
            description,
            url,
            mainEntityOfPage: url,
            image: ogImage,
            datePublished: date,
            dateModified: updated ?? date,
            author: personRef,
            publisher: personRef,
            articleSection: topicLabel(topic),
            keywords: tags.join(', '),
            wordCount: post.meta.wordCount,
            timeRequired: `PT${readingTime(post)}M`,
            inLanguage: 'en',
            isPartOf: { '@id': `${site.url}/blog#blog` },
          },
          breadcrumbs([
            ['Home', '/'],
            ['Blog', '/blog'],
            [title, path],
          ]),
        ],
      }
    }
  }

  return {
    ...base,
    title: `Not found — ${site.name}`,
    description: 'That page does not exist.',
    robots: 'noindex, follow',
  }
}

/* ------------------------------------------------------------------ *
 * Rendering. The same string goes into the static HTML at pre-render and is
 * swapped into <head> on client navigation (useHeadSync), so every tag here
 * carries `data-h` to mark it as per-page. Tags that never change live in
 * index.html instead.
 * ------------------------------------------------------------------ */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const meta = (key: 'name' | 'property', name: string, content: string) =>
  `<meta data-h ${key}="${name}" content="${escapeHtml(content)}" />`

export function renderHeadTags(head: HeadData): string {
  const imageType = head.image.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const tags = [
    `<title data-h>${escapeHtml(head.title)}</title>`,
    meta('name', 'description', head.description),
    meta('name', 'robots', head.robots),
    `<link data-h rel="canonical" href="${escapeHtml(head.canonical)}" />`,
    meta('name', 'author', site.name),
    meta('name', 'keywords', head.keywords.join(', ')),

    // Open Graph: WhatsApp, Telegram, Instagram and Messenger DMs, iMessage,
    // LinkedIn, Slack and Discord all build their link preview from these.
    meta('property', 'og:site_name', site.name),
    meta('property', 'og:locale', site.locale),
    meta('property', 'og:type', head.ogType),
    meta('property', 'og:title', head.title),
    meta('property', 'og:description', head.description),
    meta('property', 'og:url', head.canonical),
    meta('property', 'og:image', head.image),
    meta('property', 'og:image:secure_url', head.image),
    meta('property', 'og:image:type', imageType),
    meta('property', 'og:image:width', String(OG_W)),
    meta('property', 'og:image:height', String(OG_H)),
    meta('property', 'og:image:alt', head.imageAlt),
  ]

  if (head.ogType === 'profile') {
    const [first, ...rest] = site.name.split(' ')
    tags.push(
      meta('property', 'profile:first_name', first),
      meta('property', 'profile:last_name', rest.join(' ')),
      meta('property', 'profile:username', 'MD-AZMAL'),
    )
  }

  if (head.article) {
    const { published, modified, section, tags: articleTags = [] } = head.article
    if (published) tags.push(meta('property', 'article:published_time', published))
    if (modified) tags.push(meta('property', 'article:modified_time', modified))
    tags.push(meta('property', 'article:author', `${site.url}/`))
    if (section) tags.push(meta('property', 'article:section', section))
    for (const tag of articleTags) tags.push(meta('property', 'article:tag', tag))
  }

  // X, and anything else that reads the twitter:* set first.
  tags.push(
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:site', site.twitter),
    meta('name', 'twitter:creator', site.twitter),
    meta('name', 'twitter:title', head.title),
    meta('name', 'twitter:description', head.description),
    meta('name', 'twitter:image', head.image),
    meta('name', 'twitter:image:alt', head.imageAlt),
  )

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [person, website, ...head.schema],
  }
  // JSON-LD is script content, so only `<` needs neutralising.
  const json = JSON.stringify(graph).replace(/</g, '\\u003c')
  tags.push(`<script data-h type="application/ld+json">${json}</script>`)

  return tags.join('\n    ')
}
