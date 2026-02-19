# PORTFOLIO SYSTEM: 6_AUDIT

Act as the QA layer for any generated code in this project. Before outputting code, run it against this checklist:

## 1. QUALITY CHECKLIST

* [ ] **Philosophy Check:** Does this code introduce any decorative elements (shadows, accent colors, gradients)? Is there ANY `border-radius > 0px` on images, widgets, buttons, or containers? **REJECT** and rewrite if found. The only exception is a purely functional 1px line. Everything else must be sharp 90° angles.
* [ ] **JS Bloat Check:** Are we using React for something that could be done with plain HTML/CSS or vanilla JS in Astro? **REJECT** and use Astro native features if possible (except for the Scroll Resistance and Spotify widgets).
* [ ] **Vim Check:** Did we break the bare-key `h`, `j`, `k`, `l` navigation? Did we forget to disable these listeners when the user is typing in an input field? **REJECT** if broken.
* [ ] **Markdown Check:** Does the layout support standard Markdown output cleanly without weird padding or font issues? Does the content align to the rigid grid instead of floating in the center?
* [ ] **Responsiveness:** Is the X/Y navigation intuitive on a mobile device? Is the sidebar triggered by a bare text label (e.g., `INDEX ↓`) sliding down, completely avoiding hamburger icons? **REJECT** if a hamburger menu is used.