# amsterdamski.me

Static rebuild of the personal site, moved off Squarespace. Plain HTML/CSS/JS, no build step — every push to `main` is deployed by GitHub Pages (`.github/workflows/pages.yml`).

## Layout

```
index.html        the single page
css/site.css      styles (mirrors Squarespace's Fluid Engine grid math so the layout matches the original)
js/site.js        mobile menu, audio players, self-hosted video players, YouTube background video
assets/img        client logos and photos
assets/audio      radio ads (mp3)
assets/video      self-hosted video ads (mp4 + poster jpg)
CNAME             custom domain for GitHub Pages
```

## Editing

The page is one `index.html`. Each section is a `<section class="page-section">` with its own CSS grid (`.fluid-engine`) — the `<style>` block at the top of each section positions its blocks with `grid-area: row-start / col-start / row-end / col-end` (24 columns on desktop, 8 on mobile). Text lives in `.sqs-html-content`; swap an image by replacing the file in `assets/img` and the `src`.

## Local preview

Any static server works, e.g. `python3 -m http.server` and open <http://localhost:8000>.
