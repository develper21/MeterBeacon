# 🧠 Project Memory

> **SMTrack – Context, Progress & Important Notes**
> This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions and for new contributors.

| 📅 **Last Updated** | 👤 **Current Phase** | 🏁 **Project Health** |
|:---:|:---:|:---:|
| **Oct 1, 2026** | **Phase 4.5** | 🟢 **On Track** |
| 10:30 AM | Dashboard & Live Map | MVP ~82% complete |

---

## 🎯 Current Status

- ✅ Project setup completed (Vite, React, TypeScript, Tailwind)
- ✅ Git repository initialized and pushed to GitHub
- ✅ Backend API (Express + Prisma + PostGIS) built with full CRUD, JWT auth & RBAC
- ✅ Authentication (login, protected routes, role-aware nav) completed
- ✅ Live map dashboard with Leaflet + React Query completed
- 🔄 Working on Socket.io real-time polish (reconnect UX in progress)
- ⬜ Geofence breach notification UI pending

---

## ✅ Completed Tasks (Recent Highlights)

Full detail lives in [TASKS.md](TASKS.md). Key milestones:

| # | Task | Completed On |
|---|---|---|
| 1.x | Project setup, Tailwind, Git, ESLint, Vitest, deploy configs | Sep 20, 2026 |
| 2.1–2.5 | Prisma schema + Express scaffold + JWT auth + trackers API | Sep 22, 2026 |
| 2.6–2.9 | Validators, security, geofencing service, Socket.io | Sep 24, 2026 |
| 2.10–2.14 | Notifications, analytics, Swagger, logging, Docker/seed | Sep 25, 2026 |
| 3.1–3.5 | Frontend auth: service, context, pages, protected routes | Sep 26, 2026 |
| 4.1–4.6 | Dashboard layout, stats, live map, activity feed | Sep 28, 2026 |
| 5.1–5.4 | Trackers UI + geofencing UI complete | Sep 29, 2026 |
| 6.1, 6.3–6.4 | Analytics, settings, notification center | Sep 29, 2026 |
| 7.1–7.3 | ESP32 firmware, HTTP ingest, landing page | Sep 30, 2026 |

---

## 🔄 In Progress

| # | Task | Notes | Started |
|---|---|---|---|
| 4.7 | Socket.io client polish | Auto-reconnect + toast on connection loss | Sep 29, 2026 |

---

## ⬜ Up Next

| # | Task | Priority |
|---|---|---|
| 5.5 | Geofence breach → notification UI | High |
| 6.2 | CSV export of tracker history | Low |
| 7.4 | End-to-end hardware field test | High |
| 7.5–7.6 | Accessibility pass + MVP launch checklist | Medium |

---

## 🏗️ Project Snapshot

| Thing | Where / Value |
|---|---|
| **Frontend** | React 18 + Vite 7 SPA in `src/` (feature folders) |
| **Backend** | Express + Prisma in `smtrack-backend/` (port 3001) |
| **Database** | PostgreSQL + PostGIS (`smtrack`), Prisma migrations |
| **Realtime** | Socket.io — `tracker_location_update`, `geofence_breach` |
| **Map** | Leaflet + OSM tiles |
| **Routes** | `/`, `/auth`, `/dashboard`, `/trackers`, `/analytics`, `/geofencing`, `/settings` |
| **Roles** | ADMIN, MANAGER, FIELD_ENGINEER |
| **Hardware** | ESP32 + NEO-6M + SIM800L, 5-min ping cycle |
| **Deploy** | Netlify (FE) + Render (BE), envs in `.env.production` |

---

## 🧠 Important Notes & Decisions

- **Reusable trackers**: a Tracker is decoupled from meters via `meter_id` — attach → track → detach → reuse (50+ cycles per device).
- **PostGIS is optional at runtime**: geofence checks currently ray-cast in JS; PostGIS spatial queries are a planned optimization (backend TODO).
- **Status colors are sacred**: blue = In-Transit, amber = In-Storage, green = Installed, gray = Detached, red = low battery (<20%). Never repurpose.
- **Redis** caches hot analytics reads; pub/sub for realtime is still a backend TODO.
- **Test users (dev seed)**: `admin@smtrack.com / admin123`, `manager@smtrack.com / manager123`, `engineer@smtrack.com / engineer123`.
- **Env files are git-ignored** — frontend `.env.local`, backend `.env`; templates in `.env.example`.
- **Docs are living**: update `TASKS.md` and this file at the end of every work session.

---

## ⚠️ Known Issues / Tech Debt

- Backend unit/integration tests still missing (Jest configured, not written)
- Email notifications wired but unverified end-to-end
- PostGIS native spatial queries not yet used (JS ray-casting in place)
- Redis pub/sub for multi-instance realtime not implemented

---

## 🔮 Future Ideas (Post-MVP)

- Mobile app (React Native) for field engineers
- SMS alerts via Twilio for critical breaches
- Route optimization & historical replay
- Tamper detection + OTA firmware updates
- Multi-tenant DISCOM support
