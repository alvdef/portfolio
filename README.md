# portfolio

Personal portfolio at [alvdef.com](https://alvdef.com).

Markdown-first, statically generated site built on Next.js. Content is authored in an Obsidian vault and compiled at build time — write in Obsidian, deploy to the web.

## How it works

Articles live as `.md` files in `vault/`, organized by section folders. The file path determines the route: `vault/coding/spot-predictor.md` becomes `/coding/spot-predictor`. Frontmatter controls ordering and grouping. Files prefixed with `_` are drafts and excluded from the build.

All articles in a section are rendered on a single scrollable page. An intersection observer syncs the URL and sidebar as you scroll between them.

Navigation is keyboard-driven (vim-style: `h`/`l` for sections, `j`/`k` for articles) with view transitions between pages.

## Integrations

- **Spotify** — shows what's currently playing via the Spotify API
- **YouTube** — renders a playlist table from the YouTube Data API, configured via frontmatter

## Stack

Next.js, React, next-mdx-remote, TypeScript. Monochrome design — no rounded corners, no shadows, no gradients.
