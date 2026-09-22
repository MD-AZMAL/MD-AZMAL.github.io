/**
 * Renders the images made from public/avatar.png:
 *   public/og.jpg                the 1200x630 card WhatsApp, Telegram,
 *                                LinkedIn, X and Slack show when a page from
 *                                this site is shared. JPEG: WhatsApp drops
 *                                the image above roughly 300 kB, and the PNG
 *                                was 278 kB
 *   public/favicon.png           64x64, head and shoulders on an orange disc
 *   public/apple-touch-icon.png  180x180, full-bleed (iOS rounds it itself)
 *   public/icon-192.png, 512     full-bleed, for manifest.webmanifest (Android
 *                                masks them to its own shape)
 *
 * Type is set in system fonts, not the site's webfonts: the renderer has no
 * access to those, and a missing family here would be substituted silently.
 * Re-run with `pnpm og` after changing the avatar or the wording below, and
 * look at the PNGs.
 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const publicDir = join(root, 'public')
const AVATAR = join(publicDir, 'avatar.png')

const W = 1200
const H = 630

const BG = '#0A0A0C'
const CARD = '#141417'
const CARD_2 = '#1C1C21'
const INK = '#F3F3F1'
const INK_2 = '#B8B8C0'
const ORANGE = '#FF5A1F'
const CARD_3 = '#24242A'

/* ------------------------------------------------------------------ *
 * Icons: head and shoulders on an orange disc - it holds up on both a dark
 * and a light tab bar, where an ink or a dark disc disappears into one of
 * them. The crop is the avatar's top square (the whole width), scaled to
 * SCALE of the icon and set on its bottom edge, so there is orange above the
 * hair and round the head and the shoulders run out through the disc's rim.
 * A tighter head-only crop read as too zoomed in.
 * ------------------------------------------------------------------ */
const CROP = { left: 0, top: 0, width: 580, height: 580 }
const SCALE = 0.86

async function headOn(size, { round }) {
  const inner = Math.round(size * SCALE)
  const bust = await sharp(AVATAR).extract(CROP).resize(inner, inner).png().toBuffer()
  const head = await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: bust, left: Math.round((size - inner) / 2), top: size - inner }])
    .png()
    .toBuffer()
  const shape = round
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${ORANGE}"/>`
    : `<rect width="${size}" height="${size}" fill="${ORANGE}"/>`
  const layers = [{ input: head }]
  if (round) {
    // Trim the head's own edges to the disc, so nothing pokes past it.
    layers.push({
      input: Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
      ),
      blend: 'dest-in',
    })
  }
  return sharp(Buffer.from(`<svg width="${size}" height="${size}">${shape}</svg>`))
    .composite(layers)
    .png()
}

await (await headOn(64, { round: true })).toFile(join(publicDir, 'favicon.png'))
await (await headOn(180, { round: false })).toFile(join(publicDir, 'apple-touch-icon.png'))
await (await headOn(192, { round: false })).toFile(join(publicDir, 'icon-192.png'))
await (await headOn(512, { round: false })).toFile(join(publicDir, 'icon-512.png'))

/* ------------------------------------------------------------------ *
 * Share card. The avatar is a cut-out, so instead of being cropped into a
 * circle it stands in the card: the head inside the ringed disc, the
 * shoulders running down past the disc to sit on the card's bottom edge.
 * ------------------------------------------------------------------ */
const CARD_BOTTOM = H - 48
const AV_H = 400
const avatar = await sharp(AVATAR).resize({ height: AV_H }).png().toBuffer()
const { width: AV_W } = await sharp(avatar).metadata()
const CX = 920 // centre of the rings, and of the avatar
const CY = 315

const background = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="30%" r="55%">
      <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="1.4" cy="1.4" r="1.4" fill="#ffffff" fill-opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- card frame -->
  <rect x="48" y="48" width="${W - 96}" height="${H - 96}" rx="30"
        fill="${CARD}" fill-opacity="0.55" stroke="#ffffff" stroke-opacity="0.09"/>

  <!-- rings and the disc the head sits in -->
  <g transform="translate(${CX} ${CY})">
    <circle r="190" fill="none" stroke="#ffffff" stroke-opacity="0.16"/>
    <circle r="162" fill="none" stroke="${INK}" stroke-opacity="0.5" stroke-width="2"
            stroke-dasharray="120 40 20 40 8 40" stroke-linecap="round"/>
    <circle r="134" fill="${CARD_2}" stroke="#ffffff" stroke-opacity="0.24" stroke-dasharray="6 10"/>
  </g>

  <!-- rail: one accent, the rest monochrome -->
  <g transform="translate(110 470)">
    <rect width="54" height="54" rx="27" fill="${ORANGE}"/>
    <rect x="66" width="54" height="54" rx="14" fill="${CARD_3}"/>
    <rect x="132" width="54" height="54" rx="27" fill="${CARD_3}"/>
    <rect x="198" width="54" height="54" rx="14" fill="${CARD_3}"/>
  </g>

  <!-- logo mark -->
  <g transform="translate(110 118) rotate(-45)">
    <path d="M0 -21a21 21 0 0 1 0 42z" fill="${INK}"/>
    <path d="M0 -21a21 21 0 0 0 0 42z" fill="${ORANGE}"/>
  </g>
</svg>`

const text = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .name  { font: 700 78px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
             letter-spacing: -3px; fill: ${INK}; }
    .role  { font: 400 30px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
             fill: ${INK_2}; }
    .kicker{ font: 500 20px ui-monospace, "Consolas", monospace;
             letter-spacing: 3px; fill: ${ORANGE}; }
  </style>
  <text class="kicker" x="152" y="126">MD-AZMAL.GITHUB.IO</text>
  <text class="name" x="110" y="300">Md Azmal</text>
  <text class="role" x="110" y="352">Tech Lead, Agentic AI CoE</text>
  <text class="role" x="110" y="394">Tech Mahindra</text>
</svg>`

await sharp(Buffer.from(background))
  .composite([
    { input: Buffer.from(text), top: 0, left: 0 },
    { input: avatar, top: CARD_BOTTOM - AV_H, left: Math.round(CX - AV_W / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(join(publicDir, 'og.jpg'))

for (const file of ['og.jpg', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  const { length } = await readFile(join(publicDir, file))
  console.log(`public/${file} written - ${(length / 1024).toFixed(1)} kB`)
}
