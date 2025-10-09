# HimeFilter: An Unofficial Companion Tool for Anime Discovery

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=vercel)](https://himefilter.vercel.app/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Available-green?style=for-the-badge&logo=googlechrome)](https://github.com/1syunus/HimeFilter-extension)

HimeFilter began as a "what-if" project to solve common user pain points on the Crunchyroll platform — primarily its limited filtering and discovery capabilities. It has evolved into a standalone discovery tool and companion extension that any anime fan can use to explore, filter, and discover shows across platforms.

This full-stack Next.js application provides a performant, intuitive interface for browsing a massive anime catalog, complete with intelligent backend filtering, lazy-loaded carousels, and hover-based interactive previews.

![HimeFilter Demo GIF](./public/demo.gif)

---

## Key Features

- **Advanced Filtering Engine:** Combine multiple filters (genre, year, type, rating, and more) via a modern, touch-friendly interface with active filter pills and a "Clear All" system.
- **Performant Carousel Homepage:** Curated, Netflix-style carousels built from Jikan endpoints like `/top/anime` and `/seasons/now`, with lazy-loading for below-the-fold performance.
- **Dynamic API Routing:** Custom Next.js API routes that intelligently handle data fetching and filtering, applying conditional backend rules (e.g., skip `episodes=0` when new seasons roll over).
- **Interactive Hover Previews:** Professional-grade modal previews featuring autoplaying trailers and search buttons for Crunchyroll, Netflix, and HiDive.
- **Mobile-First Design:** Built from the ground up for mobile with a slide-up filter drawer and optimized grid layout.
- **Extension Integration:** Seamless link to the official **HimeFilter Companion Chrome Extension**, allowing in-site access to filters directly on Crunchyroll.

---

## Tech Stack & Architecture

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)

- **Frontend:** Next.js (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Backend:** Next.js API routes acting as a backend-for-frontend (BFF) proxy
- **API:** Jikan REST API for anime data (MyAnimeList’s public mirror)
- **Deployment:** Vercel for app hosting, GitHub Actions for CI/CD

---

## Backend Logic Overview

The backend leverages **Next.js API routes** to abstract the external Jikan API and unify multiple endpoints into a stable interface for the client.

### `/api/anime`
Handles dynamic filtering, searching, sorting, and pagination:
- Builds dynamic queries for Jikan’s `/anime` endpoint.
- Applies backend-side quality filters:
  - Filters out shows with no release date or duration.
  - Excludes invalid data for smoother UX.

### `/api/top` & `/api/seasons`
Power carousels for “Top Series,” “Current Season,” and “Last Season.”  
- Fetches from `/top/anime` and `/seasons/now` + calculated previous season.  
- Implements conditional logic to handle seasonal rollovers where new anime may have `episodes: 0` or `null` duration.

---

## Companion Chrome Extension

[**View Repo → HimeFilter-extension**](https://github.com/1syunus/HimeFilter-extension)

- Injects a **“HimeFilter” button** directly onto Crunchyroll.
- Opens the main HimeFilter app in an **iframe overlay**.
- Uses a special “extension mode” layout for embedded usage.
- Built with **Manifest v3** and designed for Chrome Web Store publication.

---

## Challenges Solved

- **Closed API Ecosystem:** Pivoted from Crunchyroll’s private API to Jikan’s open REST API for maintainability and legality.
- **Autoplay Restrictions:** Engineered custom video player logic to handle browser autoplay policies.
- **Backend Filtering Edge Cases:** Added conditional server-side filters to handle seasonal rollovers (when all anime briefly show as unreleased).
- **Performance:** Implemented intersection observer–based lazy loading for carousels to prevent API throttling.
- **UI Scalability:** Refactored the monolithic filter system into modular, variant-based components with clear prop interfaces.

---

## Local Setup

```bash
# 1. Clone repo
git clone https://github.com/<your-username>/HimeFilter.git

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Visit in browser
http://localhost:3000