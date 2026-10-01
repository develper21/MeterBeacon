# 🏛️ System Architecture

> **Smart Meter GPS Tracking System** — Real-Time Asset Tracking Platform
> This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions.

---

## 1. High-Level Architecture

The system follows a full-stack architecture: **React SPA → Express API → PostgreSQL (PostGIS)**, with an ESP32 hardware layer feeding live telemetry, and Socket.io pushing real-time updates to the dashboard.

```
┌──────────────┐  GPS NMEA   ┌──────────────┐   HTTPS    ┌───────────────┐  Prisma  ┌──────────────────────┐
│ ESP32 Tracker │ ─────────▶ │  SIM800L/    │ ─────────▶ │ Express       │ ───────▶ │ PostgreSQL + PostGIS │
│ (NEO-6M GPS)  │  Serial    │  SIM7600E 4G │  JSON POST │ Backend       │          │ (smtrack DB)         │
│ + LiPo 3.7V   │            │  (Cellular)  │            │ (Node/TS)     │          └──────────────────────┘
└──────────────┘            └──────────────┘            │  ⚡ Socket.io │
                                                        └──────┬───────┘
                                              Realtime WSS     │
                                               ┌───────────────▼───────────────┐
                                               │   React Dashboard (Vite SPA)  │
                                               │   Leaflet Map • Recharts      │
                                               └───────────────────────────────┘
```

**Flow:** Tracker pings every 5 minutes → Edge/backend ingests → PostGIS stores point + history → Socket.io broadcast → Map marker moves live.

---

## 2. Technology Stack

Technologies used in the project and their purpose:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite 7 | SPA framework & dev server |
| **Language** | TypeScript | Type-safe development everywhere |
| **Styling** | Tailwind CSS 3 + shadcn/ui | Design system & UI primitives |
| **Routing** | React Router DOM 6 | Client-side routing & protected routes |
| **State/Data** | TanStack React Query 5 | Server-state, caching, refetching |
| **Maps** | Leaflet 1.9 + OpenStreetMap | Interactive live tracking map |
| **Charts** | Recharts | Analytics graphs |
| **Backend** | Node.js + Express 4 | REST API & WebSocket server |
| **Auth** | JWT (access + refresh) + bcrypt | Stateless authentication & RBAC |
| **ORM** | Prisma 5 | Type-safe DB access & migrations |
| **Database** | PostgreSQL + PostGIS | Geospatial storage & queries |
| **Realtime** | Socket.io 4 | Live location push to dashboard |
| **Cache** | Redis | Caching & pub/sub |
| **Validation** | Zod | Runtime schema validation (API) |
| **Logging** | Winston | Structured server logs |
| **Hardware** | ESP32 + NEO-6M + SIM800L | GPS tracker firmware (C++/Arduino) |
| **Hosting** | Netlify (FE) • Render (BE) | Deployment |

---

## 3. Folder Structure

The project follows a **feature-based folder structure** to keep the code organized and scalable:

```
smtrack/
├── src/                        # React frontend (Vite)
│   ├── app/                    # App shell: App.tsx, main.tsx, NotFound
│   ├── features/               # Feature-based modules
│   │   ├── auth/               #   AuthPage, ProtectedRoute, useAuth
│   │   ├── dashboard/          #   DashboardPage, MapView, StatsCards
│   │   ├── trackers/           #   TrackersPage, TrackerDetailPage
│   │   ├── geofencing/         #   GeofencingPage, GeofenceMapView
│   │   ├── analytics/          #   AnalyticsPage
│   │   ├── settings/           #   SettingsPage
│   │   ├── landing/            #   LandingPage & marketing sections
│   │   └── shared/             #   layout, theme, UI components
│   ├── shared/components/ui/   # shadcn/ui primitives
│   ├── lib/                    # Utilities, API client
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # App configuration
├── smtrack-backend/            # Express API server
│   └── src/
│       ├── config/             # Swagger, app config
│       ├── controllers/        # Route controllers
│       ├── middleware/         # auth, validation, rate-limit
│       ├── routes/             # /api/auth, /api/trackers, ...
│       ├── services/           # notification, email, redis, geofence
│       ├── socket/             # Socket.io handlers
│       ├── validators/         # Zod schemas
│       ├── utils/              # jwt, hash, logger
│       └── index.ts            # Entry point
├── smtrack/prisma/             # Prisma schema & migrations
├── postman/                    # API collection
└── docs/                       # PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY
```

---

## 4. Data Flow

### 4.1 GPS Ping Flow (write path)
1. ESP32 wakes from deep sleep → acquires GPS fix (NEO-6M)
2. SIM800L opens GPRS connection → `POST /api/trackers/:id/location` with `{ lat, lng, battery, status }`
3. Zod validates payload → JWT/Anon auth check
4. Prisma upserts `trackers` row + appends `tracker_history`
5. Geofence service ray-casts point against active polygons → breach? → create `notifications`
6. Socket.io emits `tracker_location_update` to subscribed dashboard rooms

### 4.2 Dashboard Flow (read path)
1. React Query fetches `/api/trackers` with JWT header
2. MapView renders color-coded Leaflet markers (status + battery)
3. Client joins tracker room via `join_tracker_room` → receives live deltas
4. AnalyticsPage aggregates history for charts

---

## 5. Database Schema (Prisma Models)

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | Accounts & RBAC | email, passwordHash, role (`ADMIN`, `MANAGER`, `FIELD_ENGINEER`) |
| **Tracker** | Live device state | device_id, lat/lng, battery_level, status, meter_id, last_updated |
| **TrackerHistory** | GPS trail | tracker_id, lat/lng, battery, recorded_at |
| **Geofence** | Zones (polygons) | name, type, coordinates (GeoJSON), active |
| **Notification** | User alerts | user_id, type, title, message, read |
| **ActivityLog** | Audit trail | user_id, action, entity, timestamp |

---

## 6. Key Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Feature-based frontend folders** | Scales cleanly as features grow; mirrors API domains |
| 2 | **JWT access + refresh tokens** | Stateless, works on Render free tier; RBAC via role claim |
| 3 | **PostGIS + ray-casting fallback** | PostGIS for production accuracy; JS ray-cast works without extension |
| 4 | **WebSocket over polling** | 5-min pings must appear instantly; Socket.io rooms per tracker |
| 5 | **Reusable tracker model** | Tracker is decoupled from meter via `meter_id` — attach/detach lifecycle |
| 6 | **Redis cache for hot reads** | Summary endpoints hit Redis before Postgres |
| 7 | **Vite over Next.js** | Pure SPA dashboard; no SSR needed; faster builds on Netlify |

---

## 7. Deployment Architecture

```
GitHub (main)
   │  push
   ├──▶ Netlify  ── build: vite build ──▶ dist/  ──▶ https://smtrack.netlify.app
   └──▶ Render   ── docker/node service ──▶ https://smtrack-api.onrender.com
                     └──▶ PostgreSQL (Render DB / Neon) + Redis (Upstash)
```

- Frontend: `netlify.toml` → SPA redirects, `/` base
- Backend: `render.yaml` + `Dockerfile`, env: `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`
- Secrets in `.env.production`, never committed

---

## 8. Security Overview

- ✅ Helmet security headers, CORS allow-list
- ✅ Rate limiting on auth & ingest endpoints
- ✅ Zod validation on every request body
- ✅ bcrypt password hashing, JWT expiry + refresh rotation
- ✅ RBAC middleware (Admin / Manager / Field Engineer)
- ✅ `.env` git-ignored; anon keys scoped to least privilege
