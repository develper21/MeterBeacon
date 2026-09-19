# Deployment Guide

This guide covers deploying the Smart Meter GPS Tracking System to Render (backend) and Netlify (frontend).

## Backend Deployment (Render)

### Prerequisites
- Render account (free tier available)
- GitHub repository with backend code

### Steps

1. **Push Backend Code to GitHub**
   ```bash
   cd /home/narvin/Documents/Web/smtrack-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/smtrack-backend.git
   git push -u origin main
   ```

2. **Create New Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `smtrack-backend` folder
   - Use the following settings:
     - **Name**: smtrack-backend
     - **Region**: Oregon (or closest)
     - **Branch**: main
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add PostgreSQL Database**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - **Name**: smtrack-db
   - **Database**: smtrack
   - **User**: smtrack_user
   - **Region**: Same as web service
   - **Plan**: Free

4. **Add Redis (Optional)**
   - In Render dashboard, click "New +" → "Redis"
   - **Name**: smtrack-redis
   - **Region**: Same as web service
   - **Plan**: Free

5. **Configure Environment Variables**
   Go to your web service → Settings → Environment Variables and add:
   
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[Get from PostgreSQL database settings]
   REDIS_URL=[Get from Redis settings]
   JWT_SECRET=[Generate random string]
   JWT_REFRESH_SECRET=[Generate random string]
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://your-netlify-app.netlify.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Run Database Migrations**
   - Deploy the service first
   - Go to "Shell" tab in Render dashboard
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed` (if you want seed data)

7. **Get Backend URL**
   - Your backend will be available at: `https://smtrack-backend.onrender.com`

## Frontend Deployment (Netlify)

### Prerequisites
- Netlify account (free tier available)
- GitHub repository with frontend code

### Steps

1. **Push Frontend Code to GitHub**
   ```bash
   cd /home/narvin/Documents/Web/smTrack
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/smtrack-frontend.git
   git push -u origin main
   ```

2. **Create New Site on Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select `smTrack` folder
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: 20

3. **Configure Environment Variables**
   Go to Site settings → Environment variables → Add:
   
   ```
   VITE_API_URL=https://smtrack-backend.onrender.com/api
   VITE_WS_URL=https://smtrack-backend.onrender.com
   ```

4. **Update API Configuration**
   In `src/config/api.ts`, update the production URLs:
   ```typescript
   production: {
     baseURL: 'https://smtrack-backend.onrender.com/api',
     wsURL: 'https://smtrack-backend.onrender.com',
   },
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your frontend will be available at: `https://your-app.netlify.app`

6. **Update Backend CORS**
   In Render backend environment variables, update:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
   Then redeploy the backend.

## Post-Deployment Steps

### 1. Test Backend Health
```bash
curl https://smtrack-backend.onrender.com/health
```

### 2. Test API Documentation
Visit: `https://smtrack-backend.onrender.com/api-docs`

### 3. Create Admin User
Use the seed data or register via frontend:
- Email: admin@smtrack.com
- Password: admin123

### 4. Configure Email (Optional)
If you want email notifications:
- Update SMTP credentials in Render environment variables
- Or use a service like SendGrid or Mailgun

## Troubleshooting

### Backend Issues

**Database Connection Error**
- Check DATABASE_URL in environment variables
- Ensure PostgreSQL database is running
- Run migrations in Render Shell

**Build Fails**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation

**Free Tier Sleep**
- Render free tier sleeps after 15 min inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier for production

### Frontend Issues

**API Connection Error**
- Verify VITE_API_URL is correct
- Check backend is running
- Ensure CORS is configured correctly

**Build Fails**
- Check build logs in Netlify dashboard
- Ensure Node version is set to 20
- Verify build command is correct

**Routing Issues**
- SPA routing should work with netlify.toml
- Check redirects configuration

## Cost Summary

### Render (Free Tier)
- Web Service: Free
- PostgreSQL: Free
- Redis: Free
- **Total: $0/month**

### Netlify (Free Tier)
- Hosting: Free
- SSL: Free
- **Total: $0/month**

### Limitations
- Render free: 750 hours/month, sleeps after inactivity
- Netlify free: 100GB bandwidth/month, 300 build minutes/month

## Production Recommendations

For production use, consider:

1. **Upgrade Render Plans**
   - Starter ($7/month) - No sleep, better performance
   - Standard ($25/month) - More resources

2. **Use Custom Domain**
   - Configure custom domain in Netlify
   - Update CORS settings in backend

3. **Enable Monitoring**
   - Add error tracking (Sentry)
   - Set up uptime monitoring

4. **Backup Database**
   - Configure automated backups in Render
   - Regular export of PostgreSQL data

5. **Security**
   - Use strong JWT secrets
   - Enable HTTPS everywhere
   - Regular security updates
