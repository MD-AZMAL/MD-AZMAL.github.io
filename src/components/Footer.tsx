import { site } from '../site.config'

export function Footer() {
  const toTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer>
      <div className="wrap">
        <span>
          &copy; {__BUILD_YEAR__} {site.name}
        </span>
        <span>
          {site.role} - {site.location}
        </span>
        <a href="#top" onClick={toTop}>
          Back to top &uarr;
        </a>
      </div>
    </footer>
  )
}
