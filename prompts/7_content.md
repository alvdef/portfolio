# PORTFOLIO SYSTEM: 7_CONTENT

Defining the content taxonomy and Markdown rendering rules.

## 1. TAXONOMY (THE SECTIONS)

The top-level categories (X-Axis) are:

* **about_me:** The entry point.
* **coding:** Technical projects (Grouped by tags like: `Beca`, `Free time`, `Uni`).
* **msc:** Miscellaneous (Recommended reads, articles).
* **other_projects:** Creative or non-coding work.

## 2. EXTERNAL LINKS RULE

* **Constraint:** External links (X/Twitter, GitHub, LinkedIn, Email) are strictly confined to the `about_me` document.
* **Forbidden:** Do not create floating social bars, footer icon rows, or header links for socials. Keep it document-driven.

## 3. IMAGE RENDERING

* **Standard:** The system must seamlessly parse standard Markdown images: `![Alt text](/path/to/img.jpg)`.
* **Aesthetic Rule for Images:** * Images must render **full width** of the text column grid.
  * **Zero Border Radius:** Images MUST have `border-radius: 0`. Absolutely no rounded corners.
  * **No borders**, no drop shadows.
  * No styling for captions beyond a simple muted text block below.
  * Images must feel embedded in a raw text document, not framed in a modern UI gallery.