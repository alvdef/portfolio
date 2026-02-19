# PORTFOLIO SYSTEM: 3_LAYOUT

Defining the spatial layout and visual hierarchy. Refer to `0_philosophy.md` for aesthetic constraints (Yeezy-style, minimal, brutalist).

## 1. GLOBAL ANATOMY

The layout consists of three permanent zones:

1. **Top Header (The 3-Item Carousel):**
   * Displays a maximum of 3 main sections at a time: `[PREVIOUS]` `[CURRENT]` `[NEXT]`.
   * **Center:** Current active section (solid text).
   * **Left/Right of Center:** Adjacent X-axis sections (dimmed text).
   * **Hidden:** Other sections do not exist visually until rotated into the Next/Prev slots.
   * **Circular Wrapping (Mandatory):** The carousel MUST wrap around circularly. If the current section is the first one (e.g., `about_me`), `[PREVIOUS]` displays the LAST section (e.g., `other_projects`). If current is the last, `[NEXT]` displays the first. There is NEVER an empty slot or a disabled state in the carousel.
   * **Corners:** Utility widgets (Clock on the far-left, Spotify "Now Playing" on the far-right).
2. **Left Sidebar (Index):** A structural table of contents for the current section.
3. **Main Content Area:** The rendered `.md` file. Always displays a full article, never a truncated card, snippet, or expansion accordion. Content must strictly align to the severe mathematical grid; it must not be centrally floated like a traditional blog.

## 2. THE LEFT SIDEBAR LOGIC

* **Grouping:** Groups articles by the `group` frontmatter tag (e.g., "FREE TIME", "BECA").
* **Function:** Acts as a fast-jump menu within the active section.
* **Desktop:** Fixed to the left margin. Clickable titles.
* **Mobile Drawer Trigger Strict Spec:** Hidden inside a vertical drawer. MUST be triggered by a bare text label (e.g., `INDEX ↓`) fixed to the top-left or integrated seamlessly into the header. The trigger element MUST be rendered as a plain `<button>` or `<span>` containing ONLY raw text. It MUST have: `background: transparent`, `border: none`, `padding: 0`, `font-family: inherit`. NO icons, NO SVGs, NO emoji substitutes for the arrow. Use a literal Unicode text arrow (↓) or the string "v". The drawer slides down vertically (Y-axis), NOT from the side, to avoid conflicting with the horizontal swipe gesture used for X-axis section navigation. Do NOT use a hamburger icon.

## 3. ARTICLE FOOTER (PAGINATION)

* **Sequential Links:** Include "Next / Prev" text links at the absolute bottom of every rendered article (HackerNews style).
* **Purpose:** Encourage sequential reading within the current section.
* **Aesthetic:** Purely utilitarian. No bulky buttons, just formatted text links.