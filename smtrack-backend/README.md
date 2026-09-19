# Smart Meter GPS Tracking System - Backend

## Tech Stack

- **Node.js** + **TypeScript** - Runtime and language
- **Express.js** - Web framework
- **PostgreSQL** + **PostGIS** - Database with geospatial support
- **Prisma** - ORM
- **Socket.io** - Real-time WebSocket communication
- **Redis** - Caching and pub/sub
- **JWT** - Authentication
- **Zod** - Validation
- **Winston** - Logging
- **Swagger** - API documentation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Since Docker Compose is not available, follow the manual setup guide in [DATABASE_SETUP.md](./DATABASE_SETUP.md).

Quick summary:
```bash
# Install PostgreSQL + PostGIS (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib postgis
sudo systemctl start postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE smtrack;
\c smtrack
CREATE EXTENSION postgis;
\q
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your database credentials.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Seed Database (Optional)

```bash
npm run prisma:seed
```

This creates test users:
- admin@smtrack.com / admin123
- manager@smtrack.com / manager123
- engineer@smtrack.com / engineer123

### 7. Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Documentation

Swagger UI is available at: `http://localhost:3001/api-docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users (Admin/Manager only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin/Manager only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Trackers

- `GET /api/trackers` - Get all trackers
- `POST /api/trackers` - Create new tracker
- `GET /api/trackers/:id` - Get tracker by ID
- `PUT /api/trackers/:id` - Update tracker
- `DELETE /api/trackers/:id` - Delete tracker
- `POST /api/trackers/:id/location` - Update tracker location

### Geofences

- `GET /api/geofences` - Get all geofences
- `POST /api/geofences` - Create new geofence (Admin/Manager only)
- `PUT /api/geofences/:id` - Update geofence (Admin/Manager only)
- `DELETE /api/geofences/:id` - Delete geofence (Admin only)
- `GET /api/geofences/:id/check` - Check if point is inside geofence
- `GET /api/geofences/containing` - Find all geofences containing a point
- `GET /api/geofences/distance` - Calculate distance between two points

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics

- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/tracker/:id/history` - Get tracker location history
- `GET /api/analytics/geofence-breaches` - Get geofence breaches

## WebSocket Events

### Client → Server

- `join_tracker_room` - Subscribe to tracker updates
- `leave_tracker_room` - Unsubscribe from tracker updates
- `gps_update` - Send GPS coordinates

### Server → Client

- `tracker_location_update` - Real-time location update
- `geofence_breach` - Geofence breach alert
- `notification` - New notification

## Database Schema

### Tables

- **users** - User accounts with roles (ADMIN, MANAGER, FIELD_ENGINEER)
- **trackers** - Smart meter devices with GPS coordinates
- **tracker_history** - GPS location history for analytics
- **geofences** - Geofence zones (GeoJSON polygons)
- **notifications** - User notifications
- **activity_logs** - System activity tracking

## Project Structure

```
src/
├── config/          # Configuration files (swagger, app config)
├── controllers/     # Route controllers
├── middleware/      # Express middleware (auth, validation, rate limit)
├── lib/            # Database client (Prisma)
├── routes/         # API routes
├── services/       # Business logic (notification, email, redis, geofence)
├── socket/         # Socket.io handlers
├── types/          # TypeScript types
├── utils/          # Helper functions (jwt, hash, logger)
├── validators/     # Zod validation schemas
└── index.ts        # Entry point
```

## Development

### Run Prisma Studio

```bash
npm run prisma:studio
```

### Reset Database

```bash
npm run prisma:reset
```

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- ✅ JWT authentication with access & refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Password hashing with bcrypt
- ✅ Error handling middleware

## Implemented Features

- ✅ Complete REST API with all CRUD operations
- ✅ JWT authentication system
- ✅ Role-based access control
- ✅ Real-time GPS tracking with Socket.io
- ✅ Geofencing with spatial queries (ray casting algorithm)
- ✅ Notification system
- ✅ Activity logging
- ✅ Analytics endpoints
- ✅ Redis integration for caching
- ✅ Email service with Nodemailer
- ✅ Swagger API documentation
- ✅ Database seed data
- ✅ Winston logging
- ✅ Input validation with Zod

## TODO

- [ ] Unit and integration tests
- [ ] PostGIS spatial queries (currently using JavaScript ray casting)
- [ ] Email notification integration
- [ ] Geofence breach detection automation
- [ ] Redis pub/sub for real-time updates

