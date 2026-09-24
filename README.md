# iam.ninja

Source for **[iam.ninja](https://iam.ninja/)**, Prithvi Poreddy's blog on identity security, IAM, and AI governance.

Built with [Hugo](https://gohugo.io/) and the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme. No analytics, no web fonts, no third-party requests.

> **Pushing to `main` publishes the site.** There is no staging branch.

---

## Quick start

```bash
brew install hugo                          # must be the "extended" build (Homebrew's is)
git submodule update --init --recursive    # fetch the theme — nothing builds without it
hugo server -D                             # http://localhost:1313, drafts included
```

| Command | What it does |
|---|---|
| `hugo server -D` | Local preview with live reload, including drafts |
| `hugo --minify` | Production build into `public/`. **No `ERROR` lines = good to push.** |
| `hugo new content posts/my-post.md` | New post with the full front matter, as a draft |

---

## Writing a post

1. `hugo new content posts/my-post.md`
2. Fill in the front matter (the template has comments explaining each field).
3. Write, preview with `hugo server -D`.
4. Set `draft: false`, commit, push.

### Front matter rules

| Field | Rule |
|---|---|
| `title` / `description` / `summary` | Three different things: page title, SEO text, list-page blurb. Fill in all three. |
| `slug` | **This is the URL.** Changing it after publishing breaks links. Renaming the file is safe. |
| `date` | A future date hides the post until that day. |
| `categories` | Exactly one **topic** (see below). It's shown as the blue pill on cards. |
| `tags` | Free-form keywords. They get their own pages but aren't in the menu. |
| `canonicalURL` | Set it if the post was first published on LinkedIn. |
| `cover.image` | Path relative to `static/` with no leading slash (e.g. `images/foo.png`), plus `relative: true` and an `alt`. |

**Images** go in `static/images/` and are referenced as `/images/foo.png` in the post body.

**Diagrams:** a ```` ```mermaid ```` code block renders as a diagram. Images and diagrams zoom on click.

### Topics

Every post has one topic, set in `categories`. The Topics page lists them with a short description:

| Topic | For |
|---|---|
| Continuous Access | SSF, CAEP, RISC, Zero Trust in practice |
| AI Agents | Identity and governance for agents, MCP, non-human identity |
| Identity Governance | Access reviews, provisioning, onboarding |
| IAM Architecture | Identifiers, authentication, tooling, strategy |
| Other Writing | Anything outside identity security |

To add a topic, create `content/categories/<slug>/_index.md` with a `title` and `description`. Old category URLs are redirected with `aliases` in those files, so keep them when renaming a topic.

### Series

To group posts into a numbered series (like *CAEP Explained*):

1. Add `series: ["Series Name"]` to each part's front matter.
2. Put `{{< series >}}` in each part's body where the part list should appear.

Parts are ordered by `date`. If two parts share a date, give them different times (`T00:00:00Z`, `T12:00:00Z`).

---

## How the site is put together

This is stock PaperMod plus a small override layer. A file here with the same path as a theme file replaces the theme's version.

| File | Purpose |
|---|---|
| `hugo.yaml` | Site config: menu (About · Posts · Topics · search icon), home page hero text, taxonomies |
| `assets/css/extended/custom.css` | **All visual styling** (colours, cards, typography, dark mode) |
| `layouts/_partials/home_info.html` | Home page hero (avatar, intro, buttons) |
| `layouts/_partials/post_meta.html` | Byline: date · read time · words · author, plus the topic pill |
| `layouts/_partials/extend_footer.html` | Mermaid diagrams (loaded only on pages that use them) and click-to-zoom |
| `layouts/_shortcodes/series.html` | The `{{< series >}}` box |
| `layouts/categories/taxonomy.html` | The Topics page (cards with descriptions) |
| `layouts/_shortcodes/topics.html` | `{{< topics >}}`: the topic pill row at the top of the Posts page |
| `layouts/_partials/extend_post_content.html` | End of every post: author box (from `homeInfoParams`) and "Keep reading" (ranked by `related` in `hugo.yaml`) |
| `assets/js/fastsearch.js` | Search with de-duplicated results and keyword snippets (replaces the theme's) |
| `archetypes/posts.md` | Template for `hugo new` |
| `themes/PaperMod/` | The theme, as a git submodule. Don't edit it. Override instead. |

### Changing the look

- **Accent colour:** change `--accent` and `--accent-soft` at the top of `custom.css`. Light and dark each have their own pair.
- **Dark theme colours:** the `:root[data-theme="dark"]` block right below that.
- **Home page text and buttons:** `homeInfoParams` in `hugo.yaml`.

---

## Updating the theme

```bash
git -C themes/PaperMod pull origin master
hugo --minify          # check for errors
```

Then check two overrides against the theme's new versions:

- `assets/js/fastsearch.js` vs `themes/PaperMod/assets/js/fastsearch.js`. If the theme changed its search page, ours may need the same change.
- `layouts/_partials/post_meta.html` and `home_info.html` vs the theme's copies in `themes/PaperMod/layouts/_partials/`.

Test search, the home page, and a post in both light and dark mode before pushing.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails with "theme not found" | Run `git submodule update --init --recursive` |
| SCSS / `TOCSS` error | Hugo isn't the extended build |
| New post doesn't show up | `draft: true`, or `date` is in the future |
| Search returns nothing | `JSON` was removed from `outputs.home` in `hugo.yaml` |
| Social preview image missing | Image paths in `hugo.yaml` need the `/images/` prefix |
| A stray page appeared on the site | A non-post `.md` file ended up in `content/`. Hugo publishes every `.md` there. |
| `WARN deprecated: .Language.LanguageDirection` | Comes from the theme itself. Harmless until the theme fixes it. |
