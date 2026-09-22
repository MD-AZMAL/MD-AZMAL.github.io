import { Link } from 'react-router'
import { home, site } from '../site.config'
import { featuredProjects, posts } from '../lib/content'
import { useCountUp } from '../lib/hooks'
import { ProjectTile } from '../components/ProjectTile'
import { PostCard } from '../components/PostCard'

function Ring() {
  return (
    <div className="ring">
      <img src={site.avatar} alt={site.name} width={240} height={240} />
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(243,243,241,.35)" strokeWidth="1" />
        {/* The same circle again, in orange, drawn along its own path on hover.
            Nothing moves — the line simply arrives. */}
        <circle
          className="tr"
          cx="100"
          cy="100"
          r="96"
          pathLength={1}
          fill="none"
          stroke="var(--orange)"
          strokeWidth="1.5"
        />
        <circle
          className="r1"
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="#F3F3F1"
          strokeWidth="2"
          strokeDasharray="120 40 20 40 8 40"
          strokeLinecap="round"
        />
        <circle
          className="r2"
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="rgba(243,243,241,.7)"
          strokeWidth="1.5"
          strokeDasharray="6 10"
        />
      </svg>
    </div>
  )
}

function Badge() {
  return (
    <div className="badge" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id="badge-curve" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text>
          {/* The ring holds about 76 characters at this size, so the phrase is
              repeated as often as it takes to go round once. */}
          <textPath href="#badge-curve">
            {home.badgeText.repeat(Math.max(1, Math.round(76 / home.badgeText.length)))}
          </textPath>
        </text>
      </svg>
    </div>
  )
}

/**
 * The isometric stack behind the featured card.
 *
 * At rest the three layers sit flush, 80 units apart, in grey. Hovering the
 * card lifts them to 104 apart and runs an orange copy of each outline along
 * its own path (`pathLength="1"` plus one `stroke-dashoffset`, see `.tr`), so
 * the stack opens and takes the accent at the same time.
 *
 * Each layer is its own `<g>` — grey outline, orange twin and the dots that
 * belong to it — so all of a layer's parts travel together. The dashed guides
 * are one path per line because each has to stretch by a different amount to
 * stay pinned to the layers it connects.
 */
function FeatureVisual() {
  const layers = [
    { d: 'M40 300 L130 250 L220 300 L130 350Z', dots: [{ cx: 40, cy: 300, r: 4, fill: '#F3F3F1' }] },
    {
      d: 'M40 220 L130 170 L220 220 L130 270Z',
      dots: [
        { cx: 130, cy: 170, r: 5, fill: '#FF5A1F' },
        { cx: 220, cy: 220, r: 4, fill: '#F3F3F1' },
      ],
    },
    { d: 'M40 140 L130 90 L220 140 L130 190Z', dots: [] },
  ]

  return (
    <div className="vis" aria-hidden="true">
      <svg viewBox="0 0 260 340" fill="none" strokeWidth="1">
        <g stroke="rgba(255,255,255,.35)" strokeDasharray="3 5">
          <path className="fv-ax fv-ax-s" d="M40 140V300" />
          <path className="fv-ax fv-ax-s" d="M220 140V300" />
          <path className="fv-ax fv-ax-c" d="M130 90V350" />
        </g>
        {layers.map((layer, i) => (
          <g key={layer.d} className={`fv-l fv-l${3 - i}`}>
            <path d={layer.d} stroke="rgba(255,255,255,.35)" />
            <path
              className={`tr tr${i + 1}`}
              d={layer.d}
              pathLength={1}
              stroke="var(--orange)"
              strokeWidth="1.5"
            />
            {layer.dots.map((dot) => (
              <circle key={`${dot.cx}-${dot.cy}`} {...dot} stroke="none" />
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}

/**
 * The dial behind a stat: three arc segments clipped into the card's lower-right
 * corner, which sweep different distances on hover.
 */
function StatDial() {
  const arcs = [
    { r: 52, dash: '120 207' },
    { r: 38, dash: '60 179' },
    { r: 24, dash: '90 61' },
  ]

  return (
    <div className="dial" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" strokeWidth="1" strokeLinecap="round">
        {arcs.map((a) => (
          <circle key={a.r} cx="60" cy="60" r={a.r} stroke="currentColor" strokeDasharray={a.dash} />
        ))}
      </svg>
    </div>
  )
}

function Counter({ value }: { value: number }) {
  return <span ref={useCountUp(value)}>{value}</span>
}

export function Home() {
  const { primary, secondary } = home.stats
  const recentPosts = posts.slice(0, 4)

  return (
    <main className="wrap" id="main">
      {/* ---------------- hero ---------------- */}
      <section className="hero" id="top">
        <div className="bento">
          <div className="card deep profile">
            <div className="tab">
              <i aria-hidden="true" />
              About
            </div>
            <Ring />
            <div>
              <h1>
                <small>I&rsquo;m</small>
                <b>Azmal</b>
              </h1>
              <p className="role">
                {home.intro} Previously service mesh and Kubernetes at IMESH, cybersecurity
                research at IIT Kanpur.
              </p>
              <div className="bottom">
                <a className="mail" href={`mailto:${site.email}`}>
                  {/* If the column is too narrow for one line, break at the @
                      rather than mid-word. */}
                  {site.email.split('@')[0]}@<wbr />
                  {site.email.split('@')[1]}
                </a>
                <Badge />
              </div>
            </div>
          </div>

          <div className="display">
            <h2>{home.display}</h2>
            <span className="corner" aria-hidden="true" />
            <p className="sub">{home.displaySub}</p>
          </div>

          <Link className="card mark feature" to={home.featured.href}>
            <FeatureVisual />
            <div className="head">
              <span className="mono" style={{ color: 'var(--ink-2)' }}>
                {home.featured.eyebrow}
              </span>
              <span className="play" aria-hidden="true">
                &#8599;
              </span>
            </div>
            <div>
              <h3>{home.featured.title}</h3>
              <p>{home.featured.body}</p>
            </div>
          </Link>

          <div className="card mark stat s1">
            <StatDial />
            <div className="n">
              <Counter value={primary.value} />
              {primary.suffix}
            </div>
            <div className="l">{primary.label}</div>
          </div>

          <div className="card orange mark stat s2">
            <StatDial />
            <div className="n">
              <Counter value={secondary.value} />
              {secondary.suffix}
            </div>
            <div className="l">{secondary.label}</div>
          </div>

          <div className="card mark wide">
            <div className="sphere-box" aria-hidden="true">
              {/* The tilt needs its own element: `.sphere` already spends its
                  transform on the spin. */}
              <div className="sphere-tilt">
                <div className="sphere">
                  {Array.from({ length: 7 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
              </div>
            </div>
            <div className="txt">
              <div className="l">Built with</div>
              <div className="row">
                {home.builtWith.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="strip" aria-hidden="true">
          <div className="track">
            {[...home.marquee, ...home.marquee].map((item, i) => (
              <span key={`${item}-${i}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- work ---------------- */}
      <section className="block" id="work">
        <div className="block-head rv">
          <h2>Featured Work</h2>
          <Link className="btn ghost" to="/projects">
            <i aria-hidden="true">&#8599;</i>All projects
          </Link>
        </div>
        <div className="work">
          {featuredProjects.map((project, index) => (
            <ProjectTile key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* ---------------- writing ---------------- */}
      {recentPosts.length > 0 && (
        <section className="block" id="writing">
          <div className="block-head rv">
            <h2>Blogs</h2>
            <Link className="btn ghost" to="/blog">
              <i aria-hidden="true">&#8599;</i>All blogs
            </Link>
          </div>
          {/* The blog page's grid, same rules: rows of three, a short last row
              shares the width. */}
          <div className="arch fill-rows">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- contact ---------------- */}
      <section className="card cta rv" id="contact">
        <div className="tiles" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <h2>{home.cta.title}</h2>
        <p>{home.cta.body}</p>
        <div className="btns">
          <a className="btn" href={`mailto:${site.email}`}>
            <i aria-hidden="true">&rarr;</i>Get in touch
          </a>
          <a
            className="btn ghost"
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i aria-hidden="true">&#8599;</i>GitHub
          </a>
          <a
            className="btn ghost"
            href={site.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i aria-hidden="true">&#8599;</i>LinkedIn
          </a>
        </div>
      </section>
    </main>
  )
}
