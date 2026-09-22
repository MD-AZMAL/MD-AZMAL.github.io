/**
 * Shiki theme matching the site palette (see src/styles/tokens.css).
 *
 * Orange is the only hue on the site, code included: keywords take the full
 * orange, callables and literals a lighter tint of it, and everything else is
 * a step on the grey ramp. Strings are the brightest grey so they still stand
 * apart from identifiers without borrowing a second colour.
 */
const orange = '#FF5A1F'
const orangeSoft = '#FF9A73'
const bright = '#F3F3F1'
const ink = '#BDBDC6'
const muted = '#85858F'
const dim = '#A0A0A9'

export const azmalDark = {
  name: 'azmal-dark',
  type: 'dark',
  colors: {
    'editor.background': '#000000',
    'editor.foreground': ink,
  },
  tokenColors: [
    { settings: { background: '#000000', foreground: ink } },
    { scope: ['comment', 'punctuation.definition.comment', 'string.comment'], settings: { foreground: muted, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'variable.language.this', 'variable.language.super'], settings: { foreground: orange } },
    { scope: ['string', 'string.quoted', 'string.template', 'constant.other.symbol', 'meta.embedded.line'], settings: { foreground: bright } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function'], settings: { foreground: orangeSoft } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'keyword.other.unit'], settings: { foreground: orangeSoft } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class'], settings: { foreground: orangeSoft, fontStyle: 'italic' } },
    { scope: ['variable', 'variable.other', 'meta.definition.variable'], settings: { foreground: ink } },
    { scope: ['variable.parameter', 'meta.parameter'], settings: { foreground: dim } },
    { scope: ['entity.name.tag', 'punctuation.definition.tag'], settings: { foreground: orange } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: orangeSoft } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: dim } },
    // Also matched by `support.type` above, whose italic would otherwise leak
    // through — an explicit empty fontStyle clears it.
    { scope: ['support.type.property-name', 'meta.object-literal.key'], settings: { foreground: ink, fontStyle: '' } },
    { scope: ['markup.inserted'], settings: { foreground: bright } },
    { scope: ['markup.deleted'], settings: { foreground: orange } },
    { scope: ['invalid'], settings: { foreground: orange } },
  ],
}

export default azmalDark
