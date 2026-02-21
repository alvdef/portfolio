# UI Overhaul Design

Date: 2026-02-21

## Header Carousel

- All sections visible at all times (dynamically rendered from `sections` array, any length)
- Items rotate/slide so the **active section is always centered** (circular list, wraps modulo N)
- Active section: larger font (~1.1em), foreground color
- Inactive sections: smaller font (~0.8em), muted color
- No underline on any section
- Vertically centered alignment (align-items: center, not baseline)
- Smooth horizontal slide animation (~250ms ease) when active changes
- Items at far edges fade out (opacity) if many sections crowd the header

## Article Layout

- Title pushed further down (~15vh from top) for breathing room
- Article title: larger font size than current
- Medium-style centering: max-width 76ch, generous vertical padding
- Remove prev/next buttons from article footer entirely

## Article Transitions: Peek + Snap

- On overscroll past article bottom, a **preview strip** appears at the bottom edge
- Strip shows the next article's title and group/date meta
- Slides up proportionally to overscroll distance (max ~80px visible)
- Subtle background shade difference to distinguish from current article
- If overscroll exceeds threshold (~150px): navigates to next article with enhanced slide transition
- If released before threshold: strip springs back with elastic motion
- Same behavior inverted at the top for previous article

## Index Toggle

- Replace "INDEX" text with `≡` hamburger icon
- Always visible on both desktop and mobile
- Click toggles sidebar in/out with a slide animation (translateX from left, ~200ms)
- Desktop: sidebar slides in from left, overlaying content
- Mobile: same drawer behavior, triggered by `≡`

## Theme Toggle

- Move from header left (next to clock) to **header right, after Spotify/Silence widget**
- Larger clickable surface area (bigger hit target around the icon)
- Keeps ☀/☾ icons and localStorage persistence
- Subtle crossfade between icons on toggle

## Status Line (Desktop Only)

- Persistent bar at bottom-left of viewport
- Format: `section/article [position/total] — h/l sections · j/k articles`
- Example: `about_me/home [1/3] — h/l sections · j/k articles`
- Muted text, small font (~0.7rem), monospace
- Hidden on mobile (max-width: 960px)

## Footer

- Minimal credit line at bottom of article content (scrolls with content, not fixed)
- Muted, small, centered text
- Example: `© 2026 Name` or similar

## Motion & Transitions

- Page transitions: 250ms duration, 35px translate, 0.97 scale (enhanced from 180ms/20px/0.985)
- Header carousel: items slide with 250ms ease on active change
- Sidebar toggle: translateX-based slide from left (~200ms), not max-height collapse
- Peek + snap: elastic rubber-band feel, proportional to scroll distance, overshoot on spring-back
- Theme toggle: crossfade between icons
- No pure fades — every transition has a directional component (slide, scale, or both)
