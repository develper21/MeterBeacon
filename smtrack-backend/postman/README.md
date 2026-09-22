# SMTrack Backend — Postman Collection

Backend REST API ke liye complete Postman collection. Har route ke saath **auto-capture test scripts** hain (tokens aur IDs collection variables me save ho jate hain).

## Import

1. Postman kholo → **Import** → `smtrack-backend/postman/postman.json`
2. Backend chalu karo: `cd smtrack-backend && npm run dev` (port `3001`)

## Pehli baar kaise test karein

| Step | Request | Kya hota hai |
|------|---------|--------------|
| 1 | `0. Health → Health Check` | Server live hai ya nahi confirm karo |
| 2 | `1. Auth → Login (Admin)` | `accessToken` + `refreshToken` automatically collection variables me save ho jayenge |
| 3 | Baaki saare requests | `Authorization: Bearer {{accessToken}}` collection-level auth se automatic lagega |

Agar `accessToken` expire ho jaye (15 min), bas **Refresh Token** request chala do — naya token wapas save ho jayega.

## Folder Structure

| Folder | Routes |
|--------|--------|
| 0. Health | `GET /health` |
| 1. Auth | register, login (3 roles), refresh, logout, negative cases (400/401) |
| 2. Users | list, get, update, delete + role test (403) |
| 3. Trackers | CRUD + location update + validation cases |
| 4. Geofences | CRUD + point-in-polygon check, containing, distance |
| 5. Notifications | list, mark-read, delete |
| 6. Analytics | summary, tracker history, geofence breaches |

## Collection Variables (auto-managed)

- `baseUrl` — default `http://localhost:3001`
- `accessToken` / `refreshToken` — Login/Refresh test scripts khud save karte hain
- `userId`, `trackerId`, `geofenceId`, `notificationId` — list/create requests se auto-capture
- `randEmail` — har Register run pe naya email generate hota hai

## Seeded Users (npm run prisma:seed ke baad)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@smtrack.com | admin123 |
| MANAGER | manager@smtrack.com | manager123 |
| FIELD_ENGINEER | engineer@smtrack.com | engineer123 |

## Notes

- Rate limit: **100 requests / 15 min** — poora collection run karte waqt dhyan rakho.
- Geofence `area` body me GeoJSON string ke roop me jaata hai (see Create Geofence example).
- Role-based tests ke liye ek request me manually dusre role ka token paste karna hota hai (e.g. "Delete User as Engineer (expect 403)").

## Newman (CLI) se run karna

```bash
newman run smtrack-backend/postman/postman.json \
  --env-var baseUrl=http://localhost:3001 \
  --reporters cli
```
