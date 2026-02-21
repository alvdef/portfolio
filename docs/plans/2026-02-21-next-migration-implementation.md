# Next Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Astro with Next.js App Router while preserving portfolio behavior and API paths.

**Architecture:** The app uses Next App Router routes for section/article navigation, Contentlayer for markdown/MDX content loading, and Next Route Handlers for Spotify/YouTube APIs. Existing client controllers and CSS are reused to keep interaction parity.

**Tech Stack:** Next.js 13 App Router, React 18, TypeScript, Contentlayer.

---

Completed in this migration:
- Switched runtime from Astro to Next App Router (`app/` routes and root layout).
- Replaced Astro content loading with Contentlayer-backed `content/` documents.
- Ported layout/UI shell from Astro templates to React components.
- Preserved keyboard and overscroll navigation by adapting controllers to Next navigation.
- Migrated API handlers to `app/api/*` route handlers.
- Removed Astro routes/config/scripts and updated project docs/configs.
