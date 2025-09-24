# StreamFlix (HTML/CSS/JS only)

A lightweight, Netflix‑style front-end built with semantic HTML, modern CSS, and a touch of vanilla JS. Mobile‑first, responsive, and accessible. No backend required.

## Highlights
- Two pages: Homepage (`index.html`) and Movie details (`movie.html`).
- Three themes: Dark (default), Light, and Cinema. Theme persists via localStorage.
- Horizontal “Netflix-style” rows with scroll-snap and smooth wheel/trackpad scroll.
- Animated skeleton loaders (no-API mode by default).
- Top 10 ranking row with large stroked numbers behind posters.
- Minimal JS: sticky/shrinking header, section highlight, tabs indicator, lazy images.
- Accessibility: keyboard focus parity for hover, prefers-reduced-motion respected.

## Project structure
```
./
├─ index.html                 # Homepage: hero + horizontal rows
├─ movie.html                 # Movie details + tabs + similar row
└─ assets/
   ├─ css/
   │  ├─ variables.css        # Design tokens + 3 themes (dark/light/cinema)
   │  ├─ base.css             # Reset, base typography, scrollbar styles
   │  ├─ layout.css           # Layout, header, hero, horizontal rows
   │  ├─ components.css       # Cards, tabs, Top 10, skeletons, buttons
   │  └─ animations.css       # Micro-interactions & keyframes
   └─ js/
      ├─ theme-toggle.js      # Theme cycle + persistence
      ├─ nav.js               # Sticky header shrink + section highlight
      ├─ utils/
      │  └─ dom.js            # Small DOM helpers
      ├─ services/
      │  └─ api.js            # Mock data service (optional)
      └─ pages/
         ├─ home.js           # Homepage rendering (optional)
         └─ movie.js          # Movie page rendering (optional)
```

## Run locally (Windows)
No build needed — just open `index.html` or `movie.html` in your browser.
- Double-click `index.html`, or
- Right‑click the file → Open With → your browser.

Tip: For the best results with module scripts and lazy images, serve over a local server. If you use VS Code:
- Install “Live Server” (optional) and click “Go Live” on `index.html`.

## Themes
- Toggle with the button in the header.
- Available: dark, light, cinema.
- Persists in `localStorage` under the key `streamflix-theme`.

## No-API mode vs mock API
- By default, sections render animated skeleton posters only. This is controlled via `data-skeleton-only="true"` on each row container in `index.html` and `movie.html`.
- To try the mock API data:
  1) Remove `data-skeleton-only="true"` from a row you want to populate.
  2) Ensure the page’s module script (pages/home.js or pages/movie.js) is included.
  3) Reload: the row should fill with mock posters after a short simulated delay.

## Hover behavior (requested spec)
- Hover widens cards horizontally and pushes siblings to the right; height stays fixed.
- Skeleton cards behave exactly like loaded cards.
- Implementation notes:
  - Each row item defines a card width variable `--card-w` and height `--card-h` responsive to breakpoints.
  - On hover/focus, width becomes `calc(var(--card-w) + min(2vw, 16px))`.
  - Rows use `flex: 0 0 var(--card-w)` so expansion is relative and bounded.

## Scrollbars
- Themed gray thumb; transparent track per theme.
- Uses modern `scrollbar-color` and WebKit fallback styles.

## Accessibility & motion
- Focus styles mirror hover widening for keyboard users.
- Honors `prefers-reduced-motion` to reduce animations.

## Mapping to brief & bonuses
- Mobile‑first responsive layout: DONE (clamp typography, 5+ breakpoints).
- CSS variables & theming: DONE (three themes; persist & early init fallback).
- Elegant navigation + sticky/shrink: DONE (nav.js + CSS).
- Hero section with impact: DONE (responsive hero with parallax touch).
- Hover/animation effects: DONE (cards, tabs indicator, subtle transforms).
- Skeleton loaders: DONE (animated gradient; instant display).
- Top 10 Netflix‑style: DONE (rank numbers with stroke & shadow fallback).
- Horizontal rows, push‑on‑hover: DONE (flex rows, width-only growth).
- Scrollbar gray & transparent: DONE (theme‑aware colors).
- No backend dependency: DONE (static with optional mock service).

## Troubleshooting
- Theme doesn’t change: clear localStorage or ensure header button is present.
- Hover expands too much: tune the increment in `assets/css/components.css` where `min(2vw, 16px)` is defined.
- Images don’t show: ensure you removed `data-skeleton-only` if you expect mock data; otherwise skeletons are intentional.

## License
MIT — for learning and demo purposes.
