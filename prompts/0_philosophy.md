# PORTFOLIO SYSTEM: 0_PHILOSOPHY

You are building a personal portfolio and digital garden. Before writing any code, you must strictly internalize the core rules of this system.

This is a utilitarian, text-first, structure-driven web system.

## 1. CORE IDENTITY & INSPIRATION

* **Visual Anchor:** yeezy.com. Severe minimalism, utilitarian interfaces.
* **Data Anchor:** Obsidian/Markdown. The entire site is a render engine for `.md` files hosted on a private GitHub repo.
* **Typography:** IBM Plex Sans (primary, all body text). IBM Plex Mono (secondary, ONLY for telemetry widgets: Clock, Spotify widget, YouTube log rows). No other typefaces are permitted.
* **Vibe:** A terminal interface translated into a modern browser. Sparse, cold, but highly functional.

## 2. THE GOLDEN RULES

1. **Markdown is the Source of Truth:** Everything is driven by `.md` files. There are no "special" page layouts. A project page, an about page, and an article page must all use the exact same underlying Markdown-rendering system.
2. **No Decorative UI:** No shadows, no gradients, no borders unless absolutely necessary for grouping, no "cards", no accent colors.
3. **Color Palette:** Strictly Black, White, and utility Greys. Dark mode and Light mode must be 1:1 inversions (Notion-style).
4. **Uniformity:** If a feature or layout only exists for one specific section, discard it. The system must be unified.
5. **Zero Border Radius:** Absolute 90° angles. `border-radius: 0` is strictly mandatory for all elements (images, containers, buttons, interactive widgets). No exceptions.
6. **Strict Grid Alignment:** Do not center content like a traditional blog (`mx-auto max-w-3xl`). The layout must align to a severe, mathematical 2D grid. Elements should lock to grid lines, not float in the center of the viewport.

## 3. THE SPATIAL CONCEPT (MATRIX NAVIGATION)

The site operates on a rigid 2D grid logic:
* **X-Axis (Horizontal):** Moving between major categories (Coding, Other Projects, Msc, About Me).
* **Y-Axis (Vertical):** Scrolling through the actual content/articles within a category.

## 4. MICRO-INTERACTIONS & MOTION

Animations must simulate physical, weighted properties, not digital playfulness.
* **Allowed:** Heavy/weighted scrolling (resistance), page-flip transitions (like discarding a piece of paper), opacity changes on hover.
* **Forbidden:** Parallax, cursor trails, bouncy spring animations, visual noise.

## 5. WHAT TO OPTIMIZE FOR

When faced with a design or technical decision, prioritize in this exact order:
1. Information clarity and hierarchy.
2. Typography and spacing (macro and micro-whitespace).
3. System uniformity (can this apply to all Markdown files?).
4. Technical simplicity.
