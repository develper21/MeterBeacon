# SMTrack Frontend — Postman Collection

Ye collection frontend (`src/features/*`) ke API contract ko mirror karti hai. UI jo bhi call karta hai, wo yahan same headers/bodies ke saath reproduce kar sakte ho — response shape `{ success, data }` envelope jaisa frontend expect karta hai.

## Import

1. Postman kholo → **Import** → `postman/postman.json`
2. Backend chalu karo: `cd smtrack-backend && npm run dev` (port `3001`)

## Kaise use karein

| Step | Request | Kya hota hai |
|------|---------|--------------|
| 1 | `0. Health → Health Check` | API reachable confirm |
| 2 | `1. Auth → Login` | `{{email}}` / `{{password}}` collection variables se — default admin. Tokens auto-save |
| 3 | Feature folders | Har folder kisi na kisi UI page ke calls ko map karta hai |

User swap karna ho to collection variables me `email` / `password` change kar do (e.g. `manager@smtrack.com` / `manager123`).

## Folder ↔ UI Mapping

| Folder | UI Pages |
|--------|----------|
| 1. Auth | `AuthPage`, `useAuth` hook |
| 2. Dashboard | `DashboardPage` (summary + trackers + notifications) |
| 3. Trackers | `TrackersPage`, `TrackerDetailPage` |
| 4. Geofencing | `GeofencingPage`, `GeofenceDetailPage` |
| 5. Analytics | `AnalyticsPage` |
| 6. Notifications | `NotificationBell` |
| 7. Users | Admin user-management screens |

## Collection Variables (auto-managed)

- `baseUrl` — default `http://localhost:3001`
- `email` / `password` — login ke liye, default seeded admin
- `accessToken` / `refreshToken` — Login/Refresh scripts khud save karte hain
- `userId`, `trackerId`, `geofenceId`, `notificationId` — list/create calls se auto-capture

## Notes

- Frontend SSE/WebSocket events (Socket.io: `tracker_location_update`, `geofence_breach`) Postman se test nahi hote — ke liye Postman ka WebSocket request type use karo `ws://localhost:3001` pe.
- Tracker flow "Create → capture `trackerId` → Detail calls" exactly UI ke jaisa hai.
