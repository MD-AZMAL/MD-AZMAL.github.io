# md-azmal.github.io

Personal site and blog — **https://md-azmal.github.io**

React 19 + Vite + TypeScript, with posts and project pages written in MDX.
Every route is pre-rendered to static HTML at build time, so the site is fully
client-side: no server, no database, nothing to keep running.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

---

## Deploying to GitHub Pages

The site deploys itself on every push to `master`. **You only have to do the
one-time setup below once.**

### One-time setup

1. Push this repository to `MD-AZMAL/MD-AZMAL.github.io` on the `master` branch.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
   *(Not "Deploy from a branch" — that would try to serve the source files.)*
4. Done. There is nothing else to configure.

### Every deploy after that

```bash
git add .
git commit -m "Add a post"
git push
```

That's it. The push triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which installs dependencies, runs `pnpm build`, and publishes the generated
`dist/` folder to Pages. It takes about a minute. Watch it under the repo's
**Actions** tab; when the `deploy` job goes green the site is live.

You can also re-deploy without pushing: **Actions → Deploy to GitHub Pages →
Run workflow**.

### Things worth knowing

- **`dist/` is never committed.** It is built fresh by CI on every push. Do not
  commit it, and do not deploy by hand.
- **Deep links work.** Because every route is pre-rendered to its own
  `index.html`, `md-azmal.github.io/projects/voicebox` is a real file. Hard
  refreshes, shared links and search-engine crawlers all get proper HTML — not
  an empty shell and not a 404.
- **There is no `CNAME` file**, which is correct for a `username.github.io`
  site. Only add one if you set up a custom domain such as `azmal.me` — put
  the bare domain in `public/CNAME`, update `site.url` in
  [`src/site.config.ts`](src/site.config.ts), and point your DNS at GitHub.
- **`public/.nojekyll`** stops GitHub from running Jekyll over the output.
  Leave it there.

### If a deploy fails

| Symptom | Cause |
| --- | --- |
| Workflow fails at "Install dependencies" | `pnpm-lock.yaml` is out of sync — run `pnpm install` locally and commit the lockfile. |
| Workflow fails at "Build and pre-render" | Run `pnpm build` locally; you will get the same error with better output. |
| Deploy succeeds but the site 404s | Pages source is still set to a branch. Set it to **GitHub Actions**. |
| A new page 404s on refresh but works when clicked | The route is missing from `staticPaths()` in [`src/entry-server.tsx`](src/entry-server.tsx). |

---

## Writing a blog post

1. Copy the template:

   ```bash
   cp content/blog/TEMPLATE.mdx content/blog/my-post.mdx
   ```

   The filename becomes the URL — `my-post.mdx` → `/blog/my-post`.

2. Edit the frontmatter at the top:

   ```yaml
   ---
   title: Agent runtimes need contracts, not prompts
   description: One sentence. Used as the summary and the social-card text.
   date: 2026-09-20        # ISO. Newest sorts first.
   topic: ai               # ai | security | blockchain | platform | craft
   tags: [agents, evals]   # optional
   draft: false            # set to false to publish
   ---
   ```

3. Write. Plain markdown works, and so do the custom components — callouts,
   figures, comparison panels, stat rows, key-takeaway boxes. `TEMPLATE.mdx`
   demonstrates every one of them. Read it as source: it is kept out of the
   site in every build, dev included, so it never shows up as a post.

4. `git push`. The post is live in about a minute.

**Drafts:** a post with `draft: true` shows up in `pnpm dev` but is stripped out
of the deployed site, so unfinished writing is safe to commit. The blog link
only appears in the navigation once at least one post is published.

The table of contents, the reading time, and the previous/next links are all
derived from the file — there is nothing to maintain by hand.

### Adding a project

Same idea, in `content/projects/`. The extra frontmatter fields are `period`,
`year`, `stack`, and optionally `repo`, `link`, `status`, plus `featured: true`
with an `order` of 1–5 to place it on the home-page grid.

---

## Editing the site itself

Almost everything personal — name, role, email, social links, the headline word,
the stat numbers, the skills marquee, the contact copy — lives in one file:
[`src/site.config.ts`](src/site.config.ts). Start there.

Colours, spacing and type are custom properties in
[`src/styles/tokens.css`](src/styles/tokens.css).

To regenerate the social-share card after changing your name or role:

```bash
pnpm og     # rewrites public/og.jpg and the icons
```

---

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload; drafts visible |
| `pnpm build` | Typecheck, bundle, and pre-render every route into `dist/` |
| `pnpm preview` | Serve `dist/` exactly as GitHub Pages will |
| `pnpm typecheck` | TypeScript only |
| `pnpm og` | Regenerate `public/og.jpg` and the icons from `avatar.png` |

## Licence

Code is free to reuse. The writing and project content are not.
