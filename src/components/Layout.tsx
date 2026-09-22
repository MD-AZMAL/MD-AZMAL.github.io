import { Outlet } from 'react-router'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { useHeadSync, useReveal, useScrollRestoration } from '../lib/hooks'

export function Layout() {
  useHeadSync()
  useScrollRestoration()
  useReveal()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <Outlet />
      <Footer />
    </>
  )
}
