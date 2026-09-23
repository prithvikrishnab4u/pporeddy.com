# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Hugo static site — the personal blog of Prithvi Poreddy at https://iam.ninja/, on Identity Security / IAM / AI governance topics. Content is prose, not code: nearly all changes are Markdown posts in [content/posts/](content/posts/) plus the occasional theme override.

## Setup and commands

The PaperMod theme is a git submodule. Nothing builds until it is checked out:

```bash
git submodule update --init --recursive   # required after a fresh clone
```

Hugo must be the **extended** build (the theme compiles SCSS): `brew install hugo`.

```bash
hugo server -D          # local dev at :1313, includes drafts
hugo --minify           # production build into ./public (gitignored)
hugo new content posts/my-post.md   # scaffolds from archetypes/default.md (draft: true)
```

There are no tests or linters. `hugo --minify` completing without ERROR is the check — run it after any layout or config change.

No CI config lives in this repo; deployment is wired up outside it. Pushing to `main` is the publish action, so treat commits to `main` as going live.

## Architecture

Stock PaperMod plus a deliberately thin override layer. Hugo resolves `layouts/` and `assets/` here before the theme's, and these overrides exist:

- [layouts/partials/extend_footer.html](layouts/partials/extend_footer.html) — the two client-side features PaperMod lacks: Mermaid rendering and click-to-zoom for images and diagrams. Both are handled by one IIFE:
  - Zoom uses a **single delegated `click` listener on `document`**, so it covers images that don't exist at load time (notably Mermaid's generated SVG). Don't replace this with per-element listeners bound on `DOMContentLoaded` — that's what forced the old fragile `setTimeout` race.
  - Mermaid is **lazy-loaded**: the script tag is only injected on pages that actually contain a `code.language-mermaid` block, because the bundled library is 3.3MB. The URL comes from `resources.Get` in the template, published to `/js/mermaid.min.js`. Theme (dark/default) is read from PaperMod's `pref-theme` localStorage key.
- [layouts/partials/post_meta.html](layouts/partials/post_meta.html) — overrides PaperMod's byline to add word count alongside date/reading time/author, plus a blue topic pill: "Series · Part N/M" for posts in a series, otherwise the first tag. It's a `<span>`, not a link, because list cards are covered by PaperMod's full-card `a.entry-link` overlay.
- [layouts/partials/home_info.html](layouts/partials/home_info.html) — the home hero (avatar, eyebrow, CTA buttons, "Latest writing" label), driven by `homeInfoParams` in hugo.yaml.
- [layouts/shortcodes/series.html](layouts/shortcodes/series.html) — `{{< series >}}` renders the part list for a post's `series` term, ordered by date. The `series` taxonomy is enabled in hugo.yaml; PaperMod also emits `og:see_also` for series siblings. To add a series, set `series: [Name]` on each part and drop `{{< series >}}` into the body. Same-date parts need distinct times (e.g. `T12:00:00Z`) to order correctly.

Analytics were deliberately removed (`119ebcb`, `943c40a`); the dead GoatCounter partial and the `historic_views` front-matter key it read are now gone too. Leave analytics off unless asked. The built site currently makes **zero third-party requests** — no CDN, no web fonts, no trackers. Keep it that way: vendor anything new into `assets/` or `static/`.

**Don't add an `extend_head.html` for favicons.** PaperMod already emits the full icon set pointing at the files in [static/](static/); a hand-rolled partial just duplicates every tag.

[assets/css/extended/custom.css](assets/css/extended/custom.css) is the site's entire design layer — PaperMod auto-loads everything under `assets/css/extended/` after its own styles, so no import wiring is needed. It covers reading typography, pull quotes, section rules, code, images, Mermaid frames, the ToC, list-entry and search-result cards, tag pills, and the footer.

Three rules when editing it:

- Build on PaperMod's variables (`--entry`, `--border`, `--primary`, `--secondary`, `--content`, `--code-bg`, `--radius`) instead of hard-coded colors, so both themes track automatically. The one addition is `--accent` / `--accent-soft`, defined once per theme at the top of the file — **change those two values to restyle the site's accent everywhere.** The dark block also replaces PaperMod's grey dark palette with a navy one; tune dark colours there.
- Dark-mode overrides must use `:root[data-theme="dark"]`, the same selector PaperMod's own variables use. A `.dark` class selector silently does nothing.
- Keep new hover/transform effects inside the `@media (prefers-reduced-motion: reduce)` guard at the bottom, which disables them.

Search is PaperMod's Fuse.js search. The page template is the theme's own (no layout override), but the script is overridden: [assets/js/fastsearch.js](assets/js/fastsearch.js) shadows `themes/PaperMod/assets/js/fastsearch.js` to de-duplicate results by permalink and show a keyword-context snippet instead of the full summary. Diff it against the theme's copy after a submodule bump. It works because `outputs.home` in [hugo.yaml](hugo.yaml) includes `JSON`, which emits the index that script fetches. Removing that JSON output silently breaks search.

The same `assets/` shadowing applies to any theme asset. `assets/js/mermaid.min.js` is the vendored Mermaid bundle. It's not a theme file.

`markup.goldmark.renderer.unsafe: true` is on, so raw HTML in Markdown posts renders — posts rely on this.

## Writing posts

Front matter is YAML and far richer than the archetype suggests. Copy the shape of a recent post — [content/posts/continuous_ZT_with_ssf_caep_risc_scim.md](content/posts/continuous_ZT_with_ssf_caep_risc_scim.md) is the current reference — rather than starting from `hugo new`:

- `title`, `description` (meta/SEO), and `summary` (list-page blurb) are three distinct fields, all filled in; don't collapse them.
- `date` and `lastmod` are RFC3339 with an explicit `T00:00:00Z`.
- `author` is a list. `tags` and `categories` both drive taxonomy pages.
- `slug` is set explicitly — **the URL does not follow the filename**. Renaming a file is safe; changing `slug` breaks links.
- `canonicalURL` points at the LinkedIn Pulse original when a post was published there first.
- Per-post display flags (`ShowReadingTime`, `ShowShareButtons`, `ShowWordCount`, `UseHugoToc`, …) are repeated in every post even where they duplicate the site defaults in hugo.yaml. Redundant but harmless — a post that sets none still inherits the defaults.
- Table of contents is on site-wide (`ShowToc: true`, collapsed via `TocOpen: false`), so posts don't need to set it. Note `UseHugoToc` alone renders nothing — it only picks the generator, not whether a ToC displays.
- Cover images: `cover.image` is a path *relative to* `static/`, written without a leading slash, with `relative: true` — e.g. `images/ssf_caep_risc_scim.png`. Always set `cover.alt`.
- `buildFuture: false`, so a post dated in the future will not appear in the build.

Images go in [static/images/](static/images/) and are referenced as `/images/...` from post bodies. Site-level image params in hugo.yaml need the `/images/` prefix too — a bare `/name.jpg` silently 404s in OG/Twitter cards.

Never put non-content Markdown (notes, scratch files, this file) inside `content/` — Hugo will publish any `.md` there as a page, front matter or not.
