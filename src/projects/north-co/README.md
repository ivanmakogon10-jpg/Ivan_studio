# NORTH & CO. — premium business landing page

Demonstration business landing page built with plain HTML5, CSS3 and vanilla
JavaScript (no framework, no build step). Designed to be shown as a studio
portfolio piece and adapted to almost any client vertical.

## 1. Run it

No build tools needed. Two options:

**A. Just open it**
Double-click `index.html` — it works directly in a browser.

**B. Local server (recommended, needed if you add fetch/API calls later)**

```bash
# Python 3
python3 -m http.server 8080

# or Node
npx serve .
```

Then visit `http://localhost:8080`.

## 2. Project structure

```
index.html      all markup + copy
style.css       full visual system (tokens at the top of the file)
script.js       all interactivity, self-contained, no dependencies
images/         favicon.svg, og-cover.svg (social preview placeholder)
README.md       this file
```

## 3. Where to edit text

Everything lives in `index.html`, in plain Russian copy, section by section
(look for the `<!-- ============ SECTION NAME ============ -->` comments):

- Hero headline / subtitle → `.hero__title`, `.hero__subtitle`
- "What changes" list items → `.changes__item` (label + one-line description)
- Services (Strategy / Design / Development / Content / Growth) → `.services__item`
- Case study copy, client name, metrics → `.case` section
- Process steps → `.process__step`
- Testimonial quotes → `.trust` section
- Final CTA headline / button label → `.finale` section
- Contact form sentence + placeholders → `.convo-form`
- Footer tagline / links → `<footer class="site-footer">`

## 4. Where to change images / graphics

There are no stock photos by design — visuals are drawn with CSS/SVG so the
page stays fast and on-brand. To customize:

- `images/favicon.svg` — browser tab icon / brand mark
- `images/og-cover.svg` — social share preview (referenced in the `<meta
  property="og:image">` tag). For best compatibility on platforms that don't
  render SVG previews, export this as a 1200×630 PNG/JPG and update the
  `og:image` / `twitter:image` tags in `index.html`.
- Hero visual object (`.hero__object` in `index.html`) and the case-study
  "before/after" browser mockup (`.case__frame`) are built from HTML + CSS,
  not images — edit the markup/CSS directly, or swap in your own SVG/image.

## 5. Where to change colors

All colors are CSS custom properties at the top of `style.css`, inside `:root`:

```css
--ivory        /* main warm background */
--graphite     /* primary text */
--cobalt       /* accent: buttons, links, highlights */
--greige       /* muted secondary text / borders */
--near-black   /* rare — used only for the final CTA/contact + footer */
```

Change these five values and the whole site re-themes consistently. Fonts
(`--serif`, `--sans`) are set right below the colors — the site pulls
**Fraunces** (serif, editorial) and **Inter** (grotesk, UI) from Google Fonts
via the `<link>` tags in `<head>`.

## 6. Where to change contact details

The contact form (`#convoForm` in `index.html`) is a front-end-only demo: it
validates the four fields client-side and shows a "Thank you" state
(`#convoThanks`) on submit — it does **not** send data anywhere yet. To wire
it up for real use, replace the `submit` handler in `script.js`
(`form.addEventListener("submit", ...)`) with a `fetch()` call to your
form endpoint, CRM, or mailer (Formspree, a serverless function, your own
API, etc.), or swap the `<form>` for a plain POST to your backend.

The footer's Instagram link (`.site-footer__nav`) points to a placeholder
`https://instagram.com` — update it to a real handle.

## 7. Notes

- Case-study metrics (`+38% inquiries`, `+52% engagement`, `2.4× faster
  decision`) are illustrative demo numbers for the fictional "AURA" case —
  clearly labelled "Concept project / illustrative results" on the page.
- Respects `prefers-reduced-motion` (all reveal/parallax/hover motion is
  disabled for users who request it).
- Custom cursor and magnetic buttons are automatically disabled on touch
  devices and coarse pointers.
- No external JS libraries — everything (smooth reveal, custom cursor,
  magnetic buttons, scroll-linked case study wipe, process timeline) is
  hand-written vanilla JS in `script.js`.
