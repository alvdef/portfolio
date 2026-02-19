# PORTFOLIO SYSTEM: 4_INTERACTION

Defining the interaction layer, animations, and keyboard navigation.

## 1. NAVIGATION PARADIGM & CONTROLS

### A. Section Navigation (X-Axis)
Moves between major categories. Rotates the Header Carousel.

* **Click/Touch:** Tap the 'Prev' or 'Next' item in the header carousel.
* **Keyboard:** Bare keys `h` (Left) and `l` (Right). Vim style.
* **Scroll/Gesture:** Horizontal trackpad swipe or touch swipe left/right. This is a **progressive enhancement only** — on Safari (macOS/iOS) and most mobile browsers, edge swipes are reserved by the browser for back/forward navigation and may not reach the JS layer. The carousel tap targets (`[PREV]` / `[NEXT]`) are the primary mobile controls.

### B. Article Navigation (Y-Axis)
Moves through the content of the current article, and jumps between articles.

* **Reading (Inside Article):** All Arrow keys (`Up`, `Down`, `Left`, `Right`) strictly scroll the text. They **DO NOT** change sections.
* **Keyboard (Article Jump):** Bare keys `j` (Next Article) and `k` (Prev Article). Vim style.
* **Input Safety Rule:** Disable all bare-key listeners (`h, j, k, l`) when the event target is `input`, `textarea`, `select`, or `[contenteditable="true"]`, and when `Meta`, `Ctrl`, or `Alt` modifiers are pressed.
* **Transition Lock Rule:** All bare-key listeners MUST check the shared `isNavigating` flag (see §2). If `isNavigating === true`, ignore the keypress entirely. This prevents stacking multiple `navigate()` calls during an active View Transition.
* **Modifier Shortcuts Policy:** This system defines ONLY bare Vim keys (`h`, `j`, `k`, `l`). Do NOT implement custom `Cmd+`, `Ctrl+`, or `Alt+` shortcuts. Native browser/system shortcuts must never be intercepted or modified.

## 2. THE SCROLL RESISTANCE MECHANIC (PULL-TO-NEXT)

When reaching the absolute top or bottom of an article, further vertical scrolling encounters "friction". Overscrolling past a physical threshold triggers the next/prev article.

* **Implementation Anchor (Mandatory):** This MUST be implemented via a React Island (`client:load`). 
* Use `wheel` and `touchmove` event listeners on the article container. 
* Track accumulated overscroll delta when `scrollTop === 0` (top) or `scrollTop + clientHeight >= scrollHeight` (bottom). 
* When the accumulated delta exceeds a strict threshold of `150px`, fire the article navigation event (next/prev) and reset the accumulator immediately. 
* **DO NOT** use purely CSS `overscroll-behavior` as a solution, as it cannot trigger article route jumps.
* **Touch Action (Mandatory):** The article scroll container MUST have `touch-action: pan-y` set via CSS. Without it, the browser intercepts vertical gestures for native overscroll behaviors (Chrome pull-to-refresh, Safari elastic bounce), preventing the JS listeners from receiving touch events reliably.
* **Navigation Bridge (Mandatory):** When the scroll resistance threshold is exceeded, the React Island MUST NOT use `window.location.href`. It MUST call Astro's `navigate()` function (imported from `astro:transitions/client`) to trigger the route change. This is the ONLY way to ensure ViewTransitions fire correctly from within a React Island.
* **Navigation Lock (Mandatory):** Immediately upon calling `navigate()`, set `isNavigating = true` and ignore all wheel/touch accumulation while true. Reset `isNavigating = false` only in the `astro:after-swap` listener. This flag is shared with the Vim keyboard listeners (see §1B).

## 3. THE "DISCARDED PAPER" TRANSITION

Moving between sections or articles should feel heavy, physical, and weighted.

* **Outgoing Page:** Animate like a sheet of paper being discarded: slightly scaling down, fading, and sliding away in the direction of movement (up/down for Y-axis, left/right for X-axis).
* **Incoming Page:** Slides in sharply and decisively.
* **Constraints:** DO NOT use bouncy spring physics. DO NOT use Framer Motion's `spring` type. Use ONLY CSS `transition` or `animation` properties. The easing function MUST be a custom cubic-bezier. Specifically use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out) for incoming elements and `cubic-bezier(0.55, 0, 1, 0.45)` (ease-in) for outgoing. Duration: 180ms maximum. Nothing slower.
* **Direction Class (Mandatory):** Before calling `navigate()`, set `document.documentElement.dataset.navDir = 'up' | 'down' | 'left' | 'right'`. View transition CSS must read this attribute to determine outgoing/incoming direction.
* **Browser Back/Forward Fallback (Mandatory):** Listen to the `astro:before-preparation` event on `document`. If `event.navigationType === 'traverse'` (browser back/forward button), set `document.documentElement.dataset.navDir = 'none'`. Define a `[data-nav-dir="none"]` CSS rule that uses a simple crossfade (opacity only) as a safe neutral fallback, since direction is unknown.
