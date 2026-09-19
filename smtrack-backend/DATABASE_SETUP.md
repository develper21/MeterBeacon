# Database Setup Guide

Since Docker Compose is not available on your system, follow these manual steps to set up PostgreSQL with PostGIS.

## Option 1: Install PostgreSQL + PostGIS Locally

### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
# Install using Homebrew
brew install postgresql
brew install postgis

# Start PostgreSQL service
brew services start postgresql
```

### Windows

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Install with PostGIS extension (included in EnterpriseDB installer)
3. Start PostgreSQL service from Services

## Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE smtrack;

# Connect to the database
\c smtrack

# Enable PostGIS extension
CREATE EXTENSION postgis;

# Verify PostGIS is installed
SELECT PostGIS_Version();

# Exit
\q
```

## Update Environment Variables

Update your `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/smtrack?schema=public"
```

## Install Redis (Optional)

### Ubuntu/Debian

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### macOS

```bash
brew install redis
brew services start redis
```

### Windows

Download Redis for Windows from https://github.com/microsoftarchive/redis/releases

## Run Prisma Migrations

```bash
cd /home/narvin/Documents/Web/smtrack-backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or create initial migration
npx prisma migrate dev --name init
```

## Verify Setup

```bash
# Start the development server
npm run dev

# Check health endpoint
curl http://localhost:3001/health
```

## Alternative: Use Cloud Database

If local setup is difficult, you can use cloud services:

- **Supabase** (Free tier with PostGIS): https://supabase.com
- **Neon** (Serverless PostgreSQL): https://neon.tech
- **Railway** (PostgreSQL + Redis): https://railway.app

Update `DATABASE_URL` in `.env` with the connection string provided by the cloud service.

## Troubleshooting

### PostgreSQL connection issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### PostGIS extension not found

```bash
# Install PostGIS if missing
sudo apt install postgis postgresql-15-postgis-3  # Adjust version as needed
```

### Permission issues

```bash
# Grant permissions to your user
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE smtrack TO your_username;
GRANT ALL PRIVILEGES ON SCHEMA public TO your_username;
\q
```
