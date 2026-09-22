/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { Frontmatter, PostMeta } from './lib/content-types'

  export const frontmatter: Frontmatter
  export const meta: PostMeta
  const MDXContent: ComponentType<{ components?: Record<string, unknown> }>
  export default MDXContent
}

declare const __BUILD_YEAR__: number
