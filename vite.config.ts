import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'

// @ts-expect-error -- local .mjs plugins, typed loosely on purpose
import { remarkPostMeta } from './plugins/remark-post-meta.mjs'
// @ts-expect-error -- local .mjs theme
import { azmalDark } from './plugins/shiki-theme.mjs'

const BUILD_YEAR = new Date().getFullYear()

export default defineConfig(({ isSsrBuild }) => ({
  // Frozen at build time so the pre-rendered HTML and the hydrated client agree.
  define: { __BUILD_YEAR__: String(BUILD_YEAR) },

  plugins: [
    {
      // MDX must run before the React plugin so JSX in .mdx gets transformed.
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          remarkGfm,
          remarkPostMeta,
        ],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: azmalDark,
              keepBackground: false,
              defaultLang: 'text',
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],

  build: isSsrBuild
    ? {
        // Server bundle used only by scripts/prerender.mjs.
        outDir: '.ssr',
        ssr: true,
        emptyOutDir: true,
        rollupOptions: {
          input: 'src/entry-server.tsx',
          output: { format: 'es', entryFileNames: 'entry-server.js' },
        },
      }
    : {
        outDir: 'dist',
        emptyOutDir: true,
        assetsInlineLimit: 2048,
      },
}))
