import { Link } from 'react-router'

export function NotFound() {
  return (
    <main className="wrap page" id="main">
      <div className="arch-hero">
        <div className="title">
          <h1>
            404<span aria-hidden="true" />
          </h1>
          <p className="lede">
            That page does not exist &mdash; it may have been renamed, or the link that brought
            you here was never right in the first place.
          </p>
        </div>
        <div className="card mark search">
          <div>
            <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>Try one of these instead.</p>
          </div>
          <div className="counts">
            <div>
              <Link className="btn ghost" to="/">
                <i aria-hidden="true">&rarr;</i>Home
              </Link>
            </div>
            <div>
              <Link className="btn ghost" to="/projects">
                <i aria-hidden="true">&rarr;</i>Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
