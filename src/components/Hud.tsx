/**
 * The affordance in the footer of a card, in place of a text caption.
 *
 * At rest it is a small mark: a node and a short dash. Hovering the card draws
 * the line out of the node, left to right across the full width.
 *
 * Purely decorative: the card's heading already names the link, so this is
 * hidden from assistive tech, and it is driven by the card's `:hover` and
 * `:focus-visible` — no JavaScript, and nothing reflows.
 */
export function Hud() {
  return (
    <span className="hud" aria-hidden="true">
      <i className="hud-node" />
      <i className="hud-line" />
    </span>
  )
}
