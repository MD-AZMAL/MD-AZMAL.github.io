import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import { renderHeadTags, resolveHead } from './head'

const noSubscribe = () => () => {}

/**
 * false while React is hydrating the pre-rendered HTML, true on every render
 * after that — including a page mounted by client-side navigation, which
 * never hydrates and so gets true straight away, with no flash.
 *
 * The archives are pre-rendered without a query string. A filter read from
 * `?topic=` / `?tag=` during hydration would render a different list than the
 * HTML holds — a hydration mismatch — so the filters wait for this.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  )
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Keeps <head> in step during client-side navigation. The first paint already
 * has the right tags baked in by the pre-render step; after that, every route
 * change swaps the per-page tags (those marked `data-h`) for the ones the
 * pre-render would have written for the new path - the same renderHeadTags
 * output, so the client can never carry a different set than the HTML.
 */
export function useHeadSync(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    const template = document.createElement('template')
    template.innerHTML = renderHeadTags(resolveHead(pathname))
    document.head.querySelectorAll('[data-h]').forEach((el) => el.remove())
    // Inserting a <title> updates document.title; a JSON-LD script parsed
    // this way never executes, which is right - it is data.
    document.head.append(template.content)
  }, [pathname])
}

const REVEAL = '.rv, .draw'
type Revealable = HTMLElement | SVGElement

/**
 * Sets `data-in` on every `.rv` (fade-up) and `.draw` (SVG stroke) element as
 * it scrolls into view. Mounted once, for the life of the app.
 *
 * Two things it has to survive, both of which once left a blank, card-sized
 * gap on the blog index:
 * - React rewrites `className` whenever a component's classes change — a
 *   post card dropping `big` when a filter applies — so a revealed *class*
 *   got wiped and the card went back to invisible. `data-in` is an attribute
 *   React does not manage, so it stays.
 * - Elements mount without a navigation: filtering, clearing a search. A
 *   MutationObserver hands every `.rv` / `.draw` to the IntersectionObserver
 *   as it is added, instead of a one-off scan per route.
 */
export function useReveal(): void {
  useEffect(() => {
    const reduced = prefersReducedMotion()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-in', '')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )

    const collect = (root: Element): Revealable[] => {
      const found = [...root.querySelectorAll<Revealable>(REVEAL)]
      if (root.matches(REVEAL)) found.unshift(root as Revealable)
      return found.filter((el) => !el.hasAttribute('data-in'))
    }

    // Each batch staggers on its own, so a filtered grid ripples in the same
    // way a freshly loaded page does.
    const watch = (els: Revealable[]) => {
      els.forEach((el, i) => {
        if (reduced) {
          el.setAttribute('data-in', '')
          return
        }
        if (el.classList.contains('rv')) el.style.transitionDelay = `${(i % 4) * 70}ms`
        io.observe(el)
      })
    }

    watch(collect(document.body))

    const mo = new MutationObserver((records) => {
      const added: Revealable[] = []
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) added.push(...collect(node))
        })
        record.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          io.unobserve(node)
          node.querySelectorAll(REVEAL).forEach((el) => io.unobserve(el))
        })
      }
      if (added.length) watch(added)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])
}

/**
 * For a one-line row that can overflow sideways (the archive filter pills).
 * Touch and trackpads scroll it natively; this lets a mouse drag it, and
 * flags which edges have more past them (`data-more-left` / `-right`) so the
 * CSS can fade just those.
 *
 * A drag that moved must not also click the pill it started on. Pointer
 * capture is only taken once the pointer has moved past a few pixels —
 * capturing on press would retarget every plain click to the row — and the
 * click that ends a drag is swallowed in the capture phase, before React's
 * root listener hands it to the button.
 */
export function useDragScroll<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const edges = () => {
      const max = el.scrollWidth - el.clientWidth
      el.toggleAttribute('data-scrollable', max > 1)
      el.toggleAttribute('data-more-left', el.scrollLeft > 1)
      el.toggleAttribute('data-more-right', el.scrollLeft < max - 1)
    }

    let pointer: number | null = null
    let startX = 0
    let startLeft = 0
    let dragged = false

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      if (el.scrollWidth <= el.clientWidth) return
      pointer = e.pointerId
      startX = e.clientX
      startLeft = el.scrollLeft
      dragged = false
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      const dx = e.clientX - startX
      if (!dragged) {
        if (Math.abs(dx) < 5) return
        dragged = true
        el.setPointerCapture(e.pointerId)
        el.setAttribute('data-dragging', '')
      }
      el.scrollLeft = startLeft - dx
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      pointer = null
      el.removeAttribute('data-dragging')
      // The click that follows a drag fires right after this, in the same
      // turn; reset once it has been swallowed.
      if (dragged) setTimeout(() => (dragged = false), 0)
    }
    const click = (e: MouseEvent) => {
      if (!dragged) return
      e.preventDefault()
      e.stopPropagation()
    }

    edges()
    document.fonts?.ready.then(edges)
    const resize = new ResizeObserver(edges)
    resize.observe(el)
    el.addEventListener('scroll', edges, { passive: true })
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)

    return () => {
      resize.disconnect()
      el.removeEventListener('scroll', edges)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('click', click, true)
    }
  }, [])

  return ref
}

/** Drives the 2px orange progress bar at the top of an article. */
export function useReadingProgress(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return ref
}

/** Returns the id of the heading currently nearest the top of the viewport. */
export function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const headingIds = key ? key.split('|') : []
    if (!headingIds.length) return

    const update = () => {
      let current: string | null = null
      for (const id of headingIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 140) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [key])

  return active
}

/**
 * Counts an already-rendered number up from zero once it scrolls into view.
 * The final value is what React renders, so the pre-rendered HTML is correct
 * and the animation is a pure enhancement.
 */
export function useCountUp(value: number): React.RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()

        const duration = 1400
        let start: number | null = null
        const step = (now: number) => {
          if (start === null) start = now
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = String(Math.round(value * eased))
          if (t < 1) frame = requestAnimationFrame(step)
        }
        el.textContent = '0'
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value])

  return ref
}

/** Restores scroll to the top on navigation, but honours in-page #anchors. */
export function useScrollRestoration(): void {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

/**
 * Hides the fixed nav while the page scrolls down and brings it straight back
 * on any upward scroll, so the header never sits on top of what you are
 * reading but is always one flick away.
 */
export function useHideOnScroll(): boolean {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)

    let last = window.scrollY

    // Runs straight off the scroll event rather than through requestAnimationFrame:
    // the work is a couple of comparisons, and React bails out of a setState that
    // does not change the value, so there is nothing to throttle.
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - last

      // Ignore sub-pixel jitter and rubber-band overscroll; `last` only moves
      // once the reader has committed to a direction.
      if (Math.abs(delta) < 6) return
      last = y

      // The top of the page always shows the nav, whichever way you came.
      setHidden(y > 96 && delta > 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return hidden
}
