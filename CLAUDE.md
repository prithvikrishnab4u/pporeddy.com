# CLAUDE.md

Guidance for Claude Code in this repo. **Read [README.md](README.md) first.** It covers setup, commands, writing posts, the file map, and theme updates. This file only lists the rules and pitfalls that aren't obvious from it.

## Ground rules

- **Pushing to `main` deploys to production.** Make small, focused commits so each one can be reverted on its own. Run `git pull --rebase` before pushing, because other sessions publish posts.
- **The check:** `hugo --minify` finishes with no `ERROR`. There are no tests. For visual changes, look at light *and* dark mode.
- **Zero third-party requests.** No CDNs, web fonts, analytics or trackers. Vendor any new asset into `assets/` or `static/`. Analytics were removed on purpose, so don't add them back.
- Never edit `themes/PaperMod/` (a submodule). Override by path instead.
- Never put non-post Markdown in `content/`. Hugo publishes it.

## Overrides: things that break quietly

- **`assets/js/fastsearch.js`** replaces the theme's search script completely. The theme's search page ships its input `disabled`, and the script has to re-enable it. If our copy falls behind the theme's, search dies with no build error. Diff it against the theme's copy after any submodule bump.
- **Search needs `JSON` in `outputs.home`** (hugo.yaml). Without it the index isn't generated.
- **`layouts/_partials/extend_footer.html`**: image zoom uses one delegated `click` listener on `document`, so it also covers Mermaid SVGs that render later. Don't switch to per-element listeners. Mermaid (3.3MB, vendored at `assets/js/mermaid.min.js`) loads only on pages containing `code.language-mermaid`.
- **`layouts/_partials/post_meta.html`**: the topic pill is a `<span>`, not a link, because PaperMod's `a.entry-link` overlay covers the whole card.
- **Don't add `extend_head.html` for favicons.** PaperMod already outputs them from `static/`.
- Override folders use Hugo's current names (`layouts/_partials/`, `layouts/_shortcodes/`), matching the theme. An override only takes effect if its path mirrors the theme file's.

## CSS (`assets/css/extended/custom.css`)

It loads automatically after the theme's CSS.

- Use theme variables (`--entry`, `--border`, `--primary`, `--secondary`, `--content`, `--code-bg`, `--radius`) plus `--accent` / `--accent-soft`, not hard-coded colours.
- Dark mode selector: `:root[data-theme="dark"]`. A `.dark` class does nothing.
- Any new transition or transform must also go in the `prefers-reduced-motion` block at the bottom.
- Theme selectors can outrank ours (for example `.searchResults li` beats `.search-result`). Check computed styles, not just the rule you wrote.

## Content conventions

- Start new posts from `hugo new content posts/<name>.md` (archetype: `archetypes/posts.md`).
- `slug` is the URL. Never change it on a published post.
- Dates are RFC3339 with an explicit time: `2026-01-01T00:00:00Z`.
- `markup.goldmark.renderer.unsafe: true` is on, and posts depend on raw HTML.
- Series order follows `date`, so same-day parts need different times.
- Site-level image params in hugo.yaml need the `/images/` prefix. A bare `/name.jpg` 404s in social cards.
