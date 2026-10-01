# 📋 Development Rules

> **SMTrack – Project Guidelines for AI & Human Collaboration**
> This document defines the development rules, coding standards, and best practices for the Smart Meter GPS Tracking System. These rules ensure consistency, maintainability, security, and quality. **Both AI assistants and human contributors must follow these guidelines.**

---

## 1️⃣ General Principles

These rules apply to the entire project:

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before writing any feature
- ✅ Keep the code clean, readable and well-structured
- ✅ Prioritize simplicity and maintainability
- ✅ Do not duplicate logic. Reuse existing components, utilities or services
- ✅ Make small, focused changes instead of large, risky edits
- ✅ Do not modify unrelated files
- ✅ Write self-explanatory code with meaningful variable and function names
- ✅ Never commit secrets — `.env`, `.env.local`, `.env.production` stay git-ignored

---

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style:

| Area | Rule |
|---|---|
| 🟦 **Language** | Use TypeScript everywhere. Avoid `any` unless absolutely necessary |
| ⚛️ **Frontend Framework** | React 18 + Vite. Function components + hooks only; no class components |
| 🧭 **Routing** | React Router v6; new pages go inside `src/features/<feature>/` and register in `src/app/App.tsx` |
| 🎨 **Styling** | Tailwind CSS + shadcn/ui. Follow tokens in `DESIGN.md`; no inline hex colors |
| 🔄 **Server State** | TanStack React Query for all API calls; no ad-hoc `useEffect` fetching |
| 🧱 **Backend Framework** | Express.js; controllers stay thin, business logic lives in `services/` |
| 🗄️ **Database** | Prisma is the only DB access layer. No raw SQL outside Prisma unless justified |
| ✅ **Validation** | Zod schemas in `validators/` for every API input |
| 🧹 **Linting** | ESLint must pass (`npm run lint`) before any commit |
| 🎨 **Formatting** | Prettier defaults; 2-space indent, single quotes, trailing commas |
| 📦 **Dependencies** | Prefer stable, well-maintained packages. Justify any new dependency in the PR |
| 📝 **File Naming** | `PascalCase` for components, `camelCase` for utilities/hooks, `*.types.ts` for types, `*Service.ts` for API services |

---

## 3️⃣ Project Structure

Follow the defined folder structure in ARCHITECTURE.md. Keep the codebase organized:

- ✅ Reusable UI components live in `src/shared/components/ui/` (shadcn)
- ✅ Feature-specific code stays inside `src/features/<feature>/` (components, services, hooks, types)
- ✅ Cross-feature layout/theme pieces go in `src/features/shared/`
- ✅ Common utilities belong in `src/lib/`; global types in `src/types/`
- ✅ Backend: business logic in `services/`, HTTP glue in `controllers/`, schemas in `validators/`
- ✅ Do not create new folders without a clear purpose — follow the ARCHITECTURE.md tree

---

## 4️⃣ Git Workflow

- ✅ Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- ✅ Small, atomic commits — one logical change per commit
- ✅ Commit message: imperative mood — *"Add geofence breach alert"*, not *"added stuff"*
- ✅ Never commit directly to `main`; raise a PR even when working solo
- ✅ Never commit: `node_modules/`, `dist/`, `.env*`, `logs/`, `tsconfig.*.tsbuildinfo`
- ✅ Pull latest `main` before starting new work to avoid conflicts

---

## 5️⃣ API & Backend Rules

- ✅ REST conventions: `GET /api/trackers`, `POST /api/trackers`, `PUT /api/trackers/:id`
- ✅ Every route protected by auth middleware unless explicitly public (ingest endpoint uses scoped keys)
- ✅ RBAC enforced in middleware — Admin / Manager / Field Engineer permissions checked server-side
- ✅ All responses follow `{ success, data | error }` envelope
- ✅ HTTP codes: 200 OK • 201 Created • 400 Validation • 401 Unauth • 403 Forbidden • 404 Not found • 500 Server
- ✅ Async errors via `express-async-errors`; never leave unhandled promise rejections
- ✅ Rate limit auth + ingest endpoints; log with Winston, never `console.log` in backend

---

## 6️⃣ Frontend Rules

- ✅ Pages = feature entry components; heavy logic goes into hooks, not JSX
- ✅ API calls wrapped in `*Service.ts` modules; React Query for cache/invalidation
- ✅ Forms use react-hook-form + zod resolvers
- ✅ Toasts via `sonner` for user feedback; loading & error states always handled
- ✅ Leaflet map logic stays inside map components; no DOM hacking outside them
- ✅ Dark/light theme via next-themes tokens — never hardcode `dark:` overrides per component
- ✅ Responsive first: mobile → desktop (dashboard must work on tablets in the field)

---

## 7️⃣ Security Rules

- ✅ Never log or expose tokens, passwords, or full coordinates in client errors
- ✅ Validate & sanitize every external input (Zod server-side, form resolvers client-side)
- ✅ Secrets only via environment variables; never in code or docs
- ✅ CORS allow-list only known origins
- ✅ Dependency audit before adding packages; keep versions pinned
- ✅ Ingest endpoint accepts only scoped device keys — no user JWTs from hardware

---

## 8️⃣ Testing & Quality

- ✅ Vitest + React Testing Library for frontend units (`npm test`)
- ✅ Jest for backend (`npm test` in `smtrack-backend/`)
- ✅ Critical paths need tests: auth flow, geofence ray-casting, ingest upsert
- ✅ No feature is "done" without: typecheck ✓ lint ✓ tests ✓ manual smoke test
- ✅ Bug fix = regression test first, then fix

---

## 9️⃣ Documentation

- ✅ Update `docs/MEMORY.md` after every significant change or phase completion
- ✅ Mark tasks done in `docs/TASKS.md` as you complete them
- ✅ New features require updates to PRD (scope), ARCHITECTURE (structure), TASKS (plan)
- ✅ Public functions/services get a short JSDoc comment
- ✅ Keep README setup steps accurate when scripts or envs change

---

## 🔟 Definition of Done

A task is complete only when **all** of these hold:

| ✅ | Criterion |
|---|---|
| ✅ | Code follows DESIGN.md tokens & ARCHITECTURE.md structure |
| ✅ | TypeScript strict — no `any`, no unused vars |
| ✅ | ESLint clean, build passes |
| ✅ | Handled loading, error, empty, and success states |
| ✅ | Responsive & dark-mode verified |
| ✅ | Tests written/updated for critical logic |
| ✅ | Docs updated (TASKS.md, MEMORY.md) |
| ✅ | PR reviewed & merged to `main` |
