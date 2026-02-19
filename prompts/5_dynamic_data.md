# PORTFOLIO SYSTEM: 5_DYNAMIC_DATA

Defining the integration of external APIs (Spotify, YouTube).

## 1. SPOTIFY "NOW PLAYING" (HEADER WIDGET)

* **Position:** Top corner (as defined in layout).
* **Aesthetic:** Raycast menu-bar extension style. Raw text, not a styled component.
* **Data Fetching:** Must bypass SSG. Use a React Island (`client:load`) that fetches from a secure serverless Edge Function proxy to protect OAuth tokens.
* **UI & Marquee Constraints:** * Simple scrolling marquee if the text is long, otherwise static text.
  * **Format:** `[Icon/Dot] Artist - Song`.
  * **Fallback:** If offline or nothing playing, display "Silence" or hide the widget.
  * **Strict Styling:** The marquee animation MUST use `animation-timing-function: linear`. No easing. The container must have zero background fill, zero border-radius, and zero border. It is raw monospace/utility text, absolutely NOT a styled "badge" or "pill".

## 2. YOUTUBE API (AUTO-GENERATED PAGES)

* **Concept:** A server-log aesthetic (IBM server style).
* **Data:** Fetch videos from specific playlists to generate `.md` equivalent pages at build time.
* **UI:** Render as a raw data list.
  * **Columns:** `[DATE_PUBLISHED] | [VIDEO_ID] | TITLE`.
* **Interaction:** Hovering or clicking reveals the video iframe inline.
* **Iframe Container Constraints:** The `<iframe>` element MUST have `border: none`, `border-radius: 0`, and `box-shadow: none`. It must expand to the full width of the text column grid. It must be rendered inline within the document flow, never in a floating modal or overlay.
* **YouTube Parameters:** Strictly barebones. No YouTube red buttons; use `modestbranding=1`, `rel=0`, and `controls=1` (minimal).
* **Scroll Conflict Prevention (Mandatory):** When an iframe is revealed inline, the parent article container's scroll resistance listener MUST be temporarily disabled (or the overscroll accumulator locked/reset to 0) until the iframe loses focus or is collapsed. This prevents accidental article jumps due to sudden `scrollHeight` changes while the user is interacting with the video player.