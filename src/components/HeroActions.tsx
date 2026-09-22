import { useState } from 'react'
import { pageUrl } from '../lib/head'

/**
 * The live and source links, top right of an article's title card. Live takes
 * the orange fill; Source is the same pill outlined. Renders nothing when the
 * piece has neither.
 */
export function LinkPills({ link, repo }: { link?: string; repo?: string }) {
  if (!link && !repo) return null
  return (
    <div className="hero-links">
      {link && (
        <a className="pill-link live" href={link} target="_blank" rel="noopener noreferrer">
          Live
          <i aria-hidden="true">&#8599;</i>
        </a>
      )}
      {repo && (
        <a className="pill-link" href={repo} target="_blank" rel="noopener noreferrer">
          Source
          <i aria-hidden="true">&#8599;</i>
        </a>
      )}
    </div>
  )
}

/**
 * A round dial in the notch cut from the title card's bottom-right corner.
 * Opens the platform's own share sheet where there is one (phones, Safari,
 * Chromium on Windows and ChromeOS); everywhere else — Firefox on the desktop, mostly — it copies the
 * link instead, and the icon turns into a check for a moment to say so.
 *
 * The markup is the same on the server and the client; `navigator` is only
 * touched inside the click handler, so this cannot cause a hydration mismatch.
 */
export function ShareDial({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false)
  // The canonical URL, so a shared link and its preview agree.
  const url = pageUrl(path)

  const share = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        // Closing the sheet rejects with AbortError. That is the reader saying
        // no, not a failure, so it must not fall through to a clipboard write.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // No share sheet and no clipboard (insecure context, denied permission):
      // the address bar still has the link, so there is nothing to recover.
    }
  }

  return (
    <button
      type="button"
      className={copied ? 'share-dial done' : 'share-dial'}
      onClick={share}
      aria-label="Share this page"
      title={copied ? 'Link copied' : 'Share'}
    >
      <svg
        viewBox="0 0 16 16"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M3 8.5l3.2 3L13 4.5" />
        ) : (
          // The three-node share mark: one node on the left, two on the right.
          <>
            <circle cx="11.5" cy="3.5" r="1.9" />
            <circle cx="4.5" cy="8" r="1.9" />
            <circle cx="11.5" cy="12.5" r="1.9" />
            <path d="M6.2 7l3.6-2.4M6.2 9l3.6 2.4" />
          </>
        )}
      </svg>
      {/* The icon cannot say it copied; this does, to a screen reader. */}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied' : ''}
      </span>
    </button>
  )
}
