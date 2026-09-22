import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { renderHeadTags, resolveHead } from './lib/head'
import { posts, projects } from './lib/content'
import { site } from './site.config'

export interface RenderResult {
  html: string
  head: string
}

export function render(url: string): RenderResult {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )

  return { html, head: renderHeadTags(resolveHead(url)) }
}

/** Every path written out as a static HTML file. `/404` becomes 404.html. */
export function staticPaths(): string[] {
  return [
    '/',
    '/projects',
    ...projects.map((project) => `/projects/${project.slug}`),
    '/blog',
    ...posts.map((post) => `/blog/${post.slug}`),
    '/404',
  ]
}

/**
 * Routes listed in sitemap.xml (everything except the 404), with a lastmod
 * only where the content has a real date. A made-up one - the build date on
 * every page, as this used to write - teaches crawlers to ignore the field.
 */
export function sitemapEntries(): { path: string; lastmod?: string }[] {
  const postDate = (p: (typeof posts)[number]) => p.frontmatter.updated ?? p.frontmatter.date
  const newest = posts.map(postDate).sort().at(-1)
  return staticPaths()
    .filter((path) => path !== '/404')
    .map((path) => {
      if (path === '/' || path === '/blog') return { path, lastmod: newest }
      const post = posts.find((p) => path === `/blog/${p.slug}`)
      return post ? { path, lastmod: postDate(post) } : { path }
    })
}

/** The blog as RSS items, newest first, for rss.xml. */
export function feedItems(): { title: string; description: string; path: string; date: string }[] {
  return posts.map((p) => ({
    title: p.frontmatter.title,
    description: p.frontmatter.description,
    path: `/blog/${p.slug}`,
    date: p.frontmatter.date,
  }))
}

export const siteName = site.name
export const siteDescription = site.description

/** Canonical origin, read by scripts/prerender.mjs when writing the sitemap. */
export const siteUrl = site.url
