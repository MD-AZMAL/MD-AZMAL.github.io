import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { nav, site } from '../site.config'
import { useHideOnScroll } from '../lib/hooks'
import { posts } from '../lib/content'

const isActive = (to: string, pathname: string): boolean => {
  if (to === '/') return pathname === '/'
  if (to.startsWith('/#')) return false
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Nav() {
  const { pathname } = useLocation()
  const hidden = useHideOnScroll()
  // The phone menu. From 860px down the pill has no room for the links, so a
  // button in it opens them as a panel under the bar.
  const [open, setOpen] = useState(false)

  // A new page closes it; so does Escape.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // The blog only advertises itself once there is something to read.
  const items = nav.filter((item) => item.to !== '/blog' || posts.length > 0)

  const links = (onPick?: () => void) =>
    items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className={isActive(item.to, pathname) ? 'active' : undefined}
        onClick={onPick}
      >
        {item.label}
      </Link>
    ))

  return (
    // An open menu keeps the bar on screen even while the page scrolls.
    <header className={hidden && !open ? 'nav hidden' : 'nav'}>
      <div className="wrap">
        <div className="pill">
          <i className="logo" aria-hidden="true" />
          <Link to="/">{site.shortName}</Link>
          <nav aria-label="Primary">{links()}</nav>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <i aria-hidden="true" />
          </button>
        </div>

        <div className="nav-right">
          <a href={site.links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={site.links.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
        </div>
      </div>

      <div className="wrap">
        <nav id="site-menu" className="menu-panel" aria-label="Menu" hidden={!open}>
          {links(() => setOpen(false))}
        </nav>
      </div>
    </header>
  )
}
