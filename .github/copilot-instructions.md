# Copilot instructions — Funk Culture

Purpose: short, action-first guidance to help AI coding agents be productive in this repo.

## Big picture ✅
- This is a small static website (single-page-ish) served from `index.html`.
- `index.html` performs client-side navigation by fetching fragments from `partials/*.html` and inserting the HTML into `<main id="content">` (see `static/js/main.js`).
- Static assets live under `static/` (`css/`, `js/`, `img/`, `fonts/`, `video/`). Full pages that should be indexable are present at repo root (e.g. `impressum.html`, `datenschutz.html`).

## Developer workflows & important commands 🔧
- Run a local static server (recommended; fetches fail under `file://`):
  - `npx http-server` or `python -m http.server 8000` or VS Code Live Server extension.
- There is **no** build step, package.json, or test harness in the repo. Don’t assume Node/Flask runtime unless added explicitly.

## Conventions & patterns to follow 💡
- Partial pages: files in `partials/` are HTML fragments intended for injection into `#content`. They normally contain a single `<section class="section fade-in">` and often end with a `<footer>`.
  - Example: to add a nav page `neues`:
    1. Add `<a href="#" data-page="neues">Neues</a>` to the nav in `index.html`.
    2. Create `partials/neues.html` containing a `<section class="section fade-in">`.
- Interactivity and scripts: do NOT rely on inline `<script>` tags inside partials — they will not execute when the fragment is inserted via `element.innerHTML`.
  - Instead, add page-specific initializer functions in `static/js/main.js` and call them from `loadPage()` after the HTML is inserted. Example:

```js
// in static/js/main.js
function initKontakt() {
  const user = 'funkculture';
  const domain = 'gmx.de';
  const link = document.getElementById('mail-link');
  if (link) link.href = `mailto:${user}@${domain}`;
}

// in loadPage() after content.innerHTML = html
if (page === 'kontakt') initKontakt();
```

- Asset paths are relative and must remain so (`static/css/style.css`, `static/img/...`).
- SEO: partials are not crawlable. If you need a page to be discoverable, add a standalone HTML page at repo root (copy the structure of `impressum.html`). Also update `sitemap.xml` accordingly.
- Navigation behavior: current client-side nav uses `data-page` and does not manage History API/back-buttons or deep links — add History handling if deep-linking is required.
- Common CSS utility classes: `.fade-in`, `.visible`, `.section`, `.video-container`, `.band-grid` — reuse these for consistency.

## Files worth checking during edits 🔎
- `index.html` — SPA shell and navigation
- `partials/*.html` — page fragments
- `static/js/main.js` — client-side router / initializers
- `static/css/style.css` — visual system and utility classes
- `impressum.html`, `datenschutz.html` — examples of full, indexable pages
- `sitemap.xml` — keep in sync for deployed site

## Do / Don’t short list ✅/❌
- ✅ Add new content as a partial + nav link for SPA behavior.
- ✅ For interactive behavior, add initializers in `static/js/main.js` and call them after `loadPage()`.
- ✅ Use a local static server when testing.
- ❌ Don’t assume partials execute inline scripts when injected.
- ❌ Don’t add server-only code unless you add the corresponding server files and instructions (e.g., Flask app, package.json).

---
If anything is missing or you want examples for modifying `main.js` or adding deep-link support, tell me which area to expand. What should I clarify or add next?