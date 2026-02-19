# PORTFOLIO SYSTEM: 7_CONTENT

Defining the content taxonomy and Markdown rendering rules.

## 1. TAXONOMY (THE SECTIONS)

Sections are **not hardcoded**. They are derived from the top-level directory structure of the Obsidian vault. Each top-level directory = one section. Adding or renaming a directory in the vault automatically creates or renames a section at the next build.

The current vault directories serve as the authoritative list. Example directories (for reference only, not prescriptive):

* **about_me/** — The entry point; contains external links (see §2).
* **coding/** — Technical projects. Groups use UPPERCASE enum values (e.g., `BECA`, `FREE TIME`, `UNI`).
* **msc/** — Miscellaneous reads and articles.
* **other_projects/** — Creative or non-coding work.

Do NOT hardcode these names in application logic. Read them from the generated `src/generated/sections.ts` constant (see `2_cms.md`).

## 2. EXTERNAL LINKS RULE

* **Constraint:** External links (X/Twitter, GitHub, LinkedIn, Email) are strictly confined to the `about_me` document.
* **Forbidden:** Do not create floating social bars, footer icon rows, or header links for socials. Keep it document-driven.

## 3. IMAGE RENDERING

* **Standard:** The system must seamlessly parse standard Markdown images: `![Alt text](/path/to/img.jpg)`.
* **Inline Link Styling:** Links within rendered Markdown MUST use `color: inherit` and underlines; no accent colors. Hover state can only reduce opacity.
* **Aesthetic Rule for Images:** Images must render full width of the text column grid.
* **Zero Border Radius:** Images MUST have `border-radius: 0`. Absolutely no rounded corners.
* **No Borders or Shadows:** No borders and no drop shadows.
* **Caption Rule:** No styling for captions beyond a simple muted text block below.
* **Embedding Rule:** Images must feel embedded in a raw text document, not framed in a modern UI gallery.
