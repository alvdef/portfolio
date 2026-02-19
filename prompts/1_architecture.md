# PORTFOLIO SYSTEM: 1_ARCHITECTURE

Defining the technical architecture for the utilitarian portfolio system using Astro and React.

## 1. CORE STACK

* **Framework:** Astro (Static Site Generation - SSG).
* **UI Library:** React (used strictly for interactive Astro Islands, e.g., Spotify widget, Clock, Complex navigation state).
* **Styling:** Tailwind CSS (preferred for utility-class minimal styling). No bloated component libraries (no Material UI, no Bootstrap).
* **Tailwind Constraint (Non-negotiable):** Disable the entire `borderRadius`, `boxShadow`, and `ringWidth` scales in `tailwind.config.js`. Set them all to `none` or `0`. The LLM must not be allowed to use Tailwind's default rounded corners or shadows by accident.
* **Tailwind Palette Lock (Non-negotiable):** In `tailwind.config.js`, override the color palette entirely. Whitelist ONLY these tokens: `black`, `white`, `gray-100`, `gray-200`, `gray-400`, `gray-700`, `gray-900`. ALL other default Tailwind colors (especially `blue-*`, `indigo-*`, `purple-*`, `red-*`) are FORBIDDEN. The UI must remain strictly monochromatic and cold.
* **Tailwind Typography Plugin (Non-negotiable):** Do NOT install or use `@tailwindcss/typography`. Do NOT use the `prose` class anywhere. Markdown styling must be manual and scoped to the article container, using only permitted tokens and zero border radius.
* **Focus State Rule:** All interactive elements MUST define custom `:focus-visible` styles using `outline: 2px solid currentColor` and monochrome colors only. Never rely on the browser's default blue outline.

## 2. RENDERING STRATEGY

* **SSG Strictly:** The site is pre-rendered at build time.
* **Deployment Flow (Mandatory: Vercel or Netlify ONLY):** A push to the private GitHub repository triggers a build process on Vercel or Netlify. GitHub Pages is NOT a valid target for this system because Spotify requires a serverless runtime.
* **Zero-JS by Default:** Send zero client-side JavaScript unless an interactive React component explicitly requires it (using `client:load` or `client:idle`).
* **View Transitions:** You MUST use Astro transitions with `<ClientRouter />` from `astro:transitions` in the document `<head>`. This is required to maintain the state of the Header Carousel and execute the "Discarded Paper" transitions without full browser reloads between sections.
* **Architecture Exception (Spotify):** The Spotify "Now Playing" widget is the ONLY component that bypasses SSG. It must be a React Island (`client:load`) that fetches from a serverless proxy (Edge Function) at runtime. The backend proxy must hold the Spotify OAuth token securely. Do NOT expose credentials client-side.
* **Content Sync Gate:** Before `astro build`, run a deterministic content sync step to populate `/src/content/` from the private vault source. The build MUST fail if `/src/content/` is missing or stale.

## 3. DIRECTORY STRUCTURE (ASTRO STANDARD)

* `/src/content/`: Where all the Obsidian `.md` files will reside.
* `/src/layouts/`: The base structural layouts (Global, Section, Article).
* `/src/components/`: Reusable UI elements (Sidebar, Header, React widgets).
* `/src/pages/`: Routing logic.

## 4. STATE MANAGEMENT

Do not over-engineer the state management. React context or signals should only be used if globally necessary (e.g., managing the currently playing Spotify track across page transitions).
