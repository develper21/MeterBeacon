# 📦 Product Requirements Document (PRD)

> **Smart Meter GPS Tracking System – Your Academic... Assets, Everywhere.**
> Real-time GPS tracking platform for DISCOM smart meter assets — from warehouse to installation.

| Field | Value |
|---|---|
| **Version** | 1.0 |
| **Date** | Oct 1, 2026 |
| **Author** | Team SMTrack |
| **Status** | Draft |
| **Target Launch** | MVP (v1.0) |

---

## 1. Product Overview

SMTrack is a web platform designed to help DISCOM companies and meter installation agencies **track their smart meter assets in real-time**. Every meter carries a reusable ESP32 GPS tracker that reports live location, battery health, and lifecycle status to a central dashboard — so crores of rupees worth of inventory is never "invisible".

**One-liner:** *Know where every meter is — In-Transit, In-Storage, or Installed — 24×7.*

---

## 2. Problem Statement

DISCOM companies purchase **millions of smart meters**, but before installation these assets are effectively invisible:

- No one knows which truck, warehouse, or site holds which meters
- Asset loss, theft, and misplacement go unnoticed until commissioning delays occur
- Manual register-based tracking is error-prone and unscalable
- Field engineers cannot verify delivery or installation location
- No low-battery or detached-tracker alerts exist

**Result: Asset loss, theft, and commissioning delays.** There is no single, centralized, real-time solution today.

---

## 3. Goals

- Provide a **single source of truth** for all smart meter asset locations
- Cut asset loss & theft with continuous, automated location reporting
- Reduce commissioning delays by exposing where meters actually are
- Make trackers **reusable** across meters (attach → track → detach → reuse)
- Offer a clean, map-first, distraction-free operator experience

---

## 4. Target Users

- **DISCOM Managers** – monitor entire inventory fleet, assign meters
- **Field Engineers** – install meters, detach trackers, verify locations
- **Warehouse Operators** – register inbound/outbound meters
- **Admins** – manage users, geofences, and system configuration
- Tech-savvy; uses laptops and smartphones; needs reliable operational tooling

---

## 5. Core Features (MVP)

1. **User Authentication** (JWT – register / login, roles: Admin, Manager, Field Engineer)
2. **Live Map Dashboard** (Leaflet map, color-coded tracker markers, battery badges)
3. **Tracker Management** (register, attach meter ID, update status, detail view)
4. **Real-time Telemetry** (location + battery updates every 5 min via WebSocket)
5. **Geofencing** (warehouse/site polygons, entry–exit breach detection, distance queries)
6. **Alerts & Notifications** (low battery < 20%, geofence breach, status changes)
7. **Analytics** (fleet summary, tracker history, geofence breach reports)
8. **Activity Logging** (who did what, when — full audit trail)

### Future Scope (Post-MVP)

- Mobile app (React Native), SMS alerts, route optimization, historical replay, tamper detection, OTA firmware updates, solar charging

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Asset loss on tracked inventory | < 0.1% |
| Location update reliability | ≥ 99% of expected pings |
| Time-to-locate any meter | < 10 seconds |
| Low-battery alerts delivered | 100% before tracker dies |
| Commissioning delay complaints | ↓ 50% |

---

## 7. Out of Scope (for MVP)

- Meter *reading* / billing integration (tracking only)
- Consumer-facing mobile app
- Multi-tenant billing
- Route optimization algorithms
- Hardware manufacturing

---

## 8. Assumptions & Dependencies

- Each tracker has an active SIM with data (Jio/Airtel/Vi)
- GSM coverage exists along transit routes
- DISCOM staff will update status transitions on the dashboard
- Backend hosted on Render/Railway; frontend on Netlify
- PostGIS extension available on the PostgreSQL instance
