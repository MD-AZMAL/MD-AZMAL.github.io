import GithubSlugger from 'github-slugger'
import { valueToEstree } from 'estree-util-value-to-estree'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

const WORDS_PER_MINUTE = 200

/**
 * Derives per-document metadata from the MDX source and injects it as
 * `export const meta`, so pages get a table of contents and a reading time
 * without the author hand-maintaining either.
 *
 * Heading ids are produced with the same GithubSlugger sequence rehype-slug
 * uses, so `meta.headings[].id` always matches the rendered anchors.
 */
export function remarkPostMeta() {
  return (tree) => {
    const slugger = new GithubSlugger()
    const headings = []
    let words = 0

    visit(tree, (node) => {
      if (node.type === 'heading') {
        // Slug every heading, not just the ones we keep: rehype-slug walks all
        // of them, and its duplicate counter depends on the full sequence.
        const text = toString(node)
        const id = node.data?.hProperties?.id ?? slugger.slug(text)
        if (node.depth === 2 || node.depth === 3) {
          headings.push({ id, text, depth: node.depth })
        }
        return
      }
      if (node.type === 'text' || node.type === 'inlineCode') {
        words += toString(node).split(/\s+/u).filter(Boolean).length
      }
    })

    const meta = {
      headings,
      wordCount: words,
      readingTime: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    }

    tree.children.unshift({
      type: 'mdxjsEsm',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          comments: [],
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [],
              source: null,
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'meta' },
                    init: valueToEstree(meta),
                  },
                ],
              },
            },
          ],
        },
      },
    })
  }
}

export default remarkPostMeta
