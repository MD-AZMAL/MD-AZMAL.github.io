/**
 * Turns the built SPA into one static HTML file per route.
 *
 * Runs after both Vite builds:
 *   dist/        the client bundle, with index.html as the template
 *   .ssr/        the server bundle exporting render() and staticPaths()
 *
 * Every route ends up as real HTML with its own <title>, meta tags and
 * JSON-LD, so GitHub Pages serves a crawlable, shareable page rather than an
 * empty shell — and the client bundle then hydrates it in place.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const distDir = join(root, 'dist')
const ssrDir = join(root, '.ssr')

const template = await readFile(join(distDir, 'index.html'), 'utf8')

for (const marker of ['<!--head-->', '<!--app-->']) {
  if (!template.includes(marker)) {
    throw new Error(`index.html is missing the ${marker} placeholder`)
  }
}

const { render, staticPaths, sitemapEntries, feedItems, siteUrl, siteName, siteDescription } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
)

/** '/blog/foo' -> 'blog/foo/index.html'; '/404' -> '404.html'; '/' -> 'index.html'. */
const fileFor = (routePath) => {
  if (routePath === '/') return 'index.html'
  if (routePath === '/404') return '404.html'
  return join(routePath.replace(/^\//, ''), 'index.html')
}

const paths = staticPaths()
let written = 0

for (const routePath of paths) {
  const { html, head } = render(routePath)
  const page = template.replace('<!--head-->', head).replace('<!--app-->', html)

  const outFile = join(distDir, fileFor(routePath))
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, page, 'utf8')
  written += 1
  console.log(`  ${routePath.padEnd(40)} -> dist/${fileFor(routePath).replace(/\\/g, '/')}`)
}

/* ---------- sitemap + robots ---------- */

const origin = String(siteUrl).replace(/\/+$/, '')
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapEntries().map(({ path: routePath, lastmod }) => {
    const loc = `${origin}${routePath === '/' ? '/' : `${routePath}/`}`
    return lastmod
      ? `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
      : `  <url><loc>${loc}</loc></url>`
  }),
  '</urlset>',
  '',
].join('\n')

await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8')

/* ---------- rss ---------- */

const xml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
// RSS wants RFC 822 dates; posts carry ISO days, read as midnight UTC.
const rfc822 = (isoDay) => new Date(`${isoDay}T00:00:00Z`).toUTCString()
const items = feedItems()
const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  `  <title>${xml(`${siteName} — Blog`)}</title>`,
  `  <link>${origin}/blog/</link>`,
  `  <description>${xml(siteDescription)}</description>`,
  '  <language>en</language>',
  `  <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />`,
  ...(items.length ? [`  <lastBuildDate>${rfc822(items[0].date)}</lastBuildDate>`] : []),
  ...items.map((item) =>
    [
      '  <item>',
      `    <title>${xml(item.title)}</title>`,
      `    <link>${origin}${item.path}/</link>`,
      `    <guid isPermaLink="true">${origin}${item.path}/</guid>`,
      `    <description>${xml(item.description)}</description>`,
      `    <pubDate>${rfc822(item.date)}</pubDate>`,
      '  </item>',
    ].join('\n'),
  ),
  '</channel>',
  '</rss>',
  '',
].join('\n')

await writeFile(join(distDir, 'rss.xml'), rss, 'utf8')

await writeFile(
  join(distDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n'),
  'utf8',
)

// The server bundle is a build artefact, not something to deploy.
await rm(ssrDir, { recursive: true, force: true })

console.log(`\nPre-rendered ${written} pages + sitemap.xml + rss.xml + robots.txt`)
