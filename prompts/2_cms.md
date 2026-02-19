# PORTFOLIO SYSTEM: 2_CMS

Defining the content management logic. The entire site is a render engine for Markdown files sourced from an Obsidian vault.

## 1. CONTENT COLLECTIONS (ASTRO)

Use Astro's Content Collections API to parse, validate, and type-check all `.md` files at build time.

## 2. FRONTMATTER SCHEMA

Every Markdown file must have a structured frontmatter for validation:

* **title** (string): The display title of the article/page.
* **order** (number): The strict primary sorting mechanism. Supports decimals (e.g., `1.0`, `1.1`, `2.0`) to allow precise ordering within subsections/groups.
* **date** (date): For chronological metadata, but `order` dictates the actual visual placement.
* **section** (string): The main X-axis category (e.g., "coding", "msc", "about").
* **group** (string enum): The sub-category for the left sidebar index.
* **`group` Validation Rule:** The `group` field MUST be validated as an enum in Astro's `defineCollection` schema using `z.enum([...])`. The allowed values are UPPERCASE strings defined at project start (e.g., `z.enum(["FREE TIME", "BECA", "UNI", "PERSONAL"])`). The build MUST FAIL if an unregistered group value is found. This prevents sidebar fragmentation from typos or case inconsistencies.
* **tag** (array or string, optional): Free-form labels for cross-section metadata. Not used for primary structural navigation. Leave undefined if unused.
* **status** (string): Workflow state (e.g., "published", "draft").

## 3. DATA FLOW & ROUTING

1. **Source:** The GitHub repo contains the Obsidian vault.
2. **Build:** Astro reads the `/src/content/` directory at build time.
3. **Primary Nav:** Files are grouped by `section` to build the top horizontal navigation.
4. **Secondary Nav:** Files within a section are grouped by `group`, then sorted strictly by the `order` float value to build the left sidebar index.
5. **Default Document (Zero-List Rule):** When navigating to a new `section` (X-axis), the system MUST automatically render the document with the lowest `order` value in that section. There is no intermediate "list", "index", or "card grid" view. You are always reading a document.

## 4. RENDER RULES

* The system must render standard Markdown cleanly (headings, lists, bold, links).
* No special MDX components unless strictly required for a technical demonstration within an article.
* Keep it vanilla Markdown to ensure portability and simplicity.