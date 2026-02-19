# Utilitarian Portfolio System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Astro 5 + Tailwind v4 monochrome, markdown-first portfolio engine with 2D navigation, deterministic content sync, and Vercel-compatible Spotify proxy.

**Architecture:** A static Astro app renders all markdown content from `/src/content` via Astro Content Collections. A prebuild sync script generates sections and copies content/assets from a local vault source while enforcing deterministic freshness. Minimal JS is used: one base-layout script for Vim keys and navigation state, and React islands for clock, Spotify widget, and scroll-resistance navigation.

**Tech Stack:** Astro 5, React 19, Tailwind CSS v4 via `@tailwindcss/vite`, TypeScript, Node scripts.

---

### Task 1: Scaffold project config and dependencies
- Create Astro/TypeScript/Vite/Tailwind config files.
- Add package scripts for sync/build/dev and content freshness guard.

### Task 2: Implement deterministic content sync pipeline
- Create script to enumerate top-level sections from vault source.
- Emit `src/generated/sections.ts`.
- Copy markdown into `src/content/{section}` with frontmatter `section` injection.
- Rewrite wiki/relative image references to `/images/{section}/...` and copy assets into `public/images/{section}`.
- Add staleness marker and fail build when stale/missing.

### Task 3: Implement Astro 5 content collections and route generation
- Create `src/content.config.ts` using `glob()` loader.
- Add schema with strict `group` enum, `z.enum(SECTIONS)` validation, and draft filtering.
- Build routes `/{section}/{slug}` and section redirect behavior to lowest `order` doc.

### Task 4: Implement utilitarian layout + interactions
- Build base layout with strict grid, top 3-item carousel, sidebar, article footer prev/next.
- Implement Vim bare-key navigation (`h/j/k/l`) with input safety and `isNavigating` lock.
- Add Astro ClientRouter and direction-based view transitions.
- Add mobile `INDEX ↓` text trigger drawer behavior.

### Task 5: Implement required React islands
- Clock widget (IBM Plex Mono).
- Spotify now-playing widget (client load, proxy endpoint fetch).
- Scroll resistance island with 150px threshold + `navigate()` bridge + lock behavior.

### Task 6: Add Vercel Spotify proxy and placeholders
- Add server endpoint for now-playing with env vars and safe fallback.

### Task 7: Audit and verify against `prompts/6_audit.md`
- Run static checks for banned styles and interaction constraints.
- Run available validation commands.
- Produce checklist pass/fail report with evidence.
