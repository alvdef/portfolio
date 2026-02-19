# PORTFOLIO SYSTEM: 2_CMS

Defining the content management logic. The entire site is a render engine for Markdown files sourced from an Obsidian vault.

## 1. CONTENT COLLECTIONS (ASTRO)

Use Astro's Content Collections API to parse, validate, and type-check all `.md` files at build time.

## 2. FRONTMATTER SCHEMA

Every Markdown file must have a structured frontmatter for validation:

* **title** (string): The display title of the article/page.
* **order** (number): The strict primary sorting mechanism. Supports decimals (e.g., `1.0`, `1.1`, `2.0`) to allow precise ordering within subsections/groups.
* **date** (date): For chronological metadata, but `order` dictates the actual visual placement.
* **section** (string): The main X-axis category. Derived from the top-level directory name in the vault (e.g., `coding/my-project.md` → `section: "coding"`). The field MAY be omitted in the source `.md` file; the pre-build sync script MUST inject it automatically from the file's parent directory name before writing to `/src/content/`, so that `section` is always present and valid by the time Astro runs schema validation.
* **`section` Validation Rule:** Because sections are vault-directory-driven, the allowed values are NOT a static enum. At build time, the pre-build content sync script MUST enumerate the top-level directories in the vault source and emit a `sections.ts` constant (e.g., `export const SECTIONS = ["about_me", "coding", ...] as const`). Astro's `defineCollection` schema MUST import and use this generated constant to validate the `section` field as `z.enum(SECTIONS)`. The build MUST fail if `sections.ts` is missing or empty. New sections are added by creating a new top-level directory in the vault — no code changes required.
* **group** (string enum): The sub-category for the left sidebar index.
* **`group` Validation Rule:** The `group` field MUST be validated as an enum in Astro's `defineCollection` schema using `z.enum([...])`. The allowed values are UPPERCASE strings defined at project start (e.g., `z.enum(["FREE TIME", "BECA", "UNI", "PERSONAL"])`). The build MUST FAIL if an unregistered group value is found. This prevents sidebar fragmentation from typos or case inconsistencies.
* **tag** (array or string, optional): Free-form labels for cross-section metadata. Not used for primary structural navigation. Leave undefined if unused.
* **status** (string): Workflow state (e.g., "published", "draft").

## 3. DATA FLOW & ROUTING

1. **Source:** The GitHub repo contains the Obsidian vault. Top-level directories in the vault define the available sections.
2. **Pre-Build Sync:** A deterministic pre-build script scans the vault's top-level directories, enumerates them as the section list, emits `src/generated/sections.ts`, then copies `.md` files into `src/content/` preserving directory structure. During copy, it injects the `section` frontmatter field from the directory name if not already present. It also copies all image assets (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`) into `/public/images/{section}/` and rewrites image references in the `.md` content from relative or Obsidian wiki-link syntax (`![[img.png]]`) to absolute web paths (`![alt](/images/{section}/img.png)`). The build MUST fail if this step is skipped or if the output is stale.
3. **Build:** Astro reads the `/src/content/` directory at build time. Each subdirectory corresponds to one section.
4. **Primary Nav:** Files are grouped by `section` (inferred from directory) to build the top horizontal navigation.
5. **Secondary Nav:** Files within a section are grouped by `group`, then sorted strictly by the `order` float value to build the left sidebar index.
6. **Default Document (Zero-List Rule):** When navigating to a new `section` (X-axis), the system MUST automatically render the document with the lowest `order` value in that section. There is no intermediate "list", "index", or "card grid" view. You are always reading a document.
7. **Route Pattern:** Every document MUST define a unique `slug`; route pattern is `/{section}/{slug}`.
8. **Draft Filtering Rule:** Documents with `status: "draft"` MUST be excluded from production routes, sidebar, carousel sequencing, and next/prev links.

## 4. RENDER RULES

* The system must render standard Markdown cleanly (headings, lists, bold, links).
* No special MDX components unless strictly required for a technical demonstration within an article.
* Keep it vanilla Markdown to ensure portability and simplicity.
* **Code Block Syntax Highlighting:** Configure syntax highlighting as strictly monochromatic. Either disable highlighting (`syntaxHighlight: false`) or use a CSS-variables theme where every token maps only to the allowed monochrome palette.
