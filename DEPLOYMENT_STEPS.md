# Complete Deployment Steps

This guide provides step-by-step instructions for deploying TheyCare Portal to production.

## Prerequisites

✅ GitHub account
✅ Supabase account (created in Step 1)
✅ Render account (free - sign up at https://render.com)
✅ Vercel account (free - sign up at https://vercel.com)

## Table of Contents

1. [Setup Supabase](#1-setup-supabase)
2. [Migrate Database](#2-migrate-database-to-supabase)
3. [Configure Storage](#3-configure-supabase-storage)
4. [Push Code to GitHub](#4-push-code-to-github)
5. [Deploy Backend to Render](#5-deploy-backend-to-render)
6. [Deploy Frontend to Vercel](#6-deploy-frontend-to-vercel)
7. [Final Configuration](#7-final-configuration)
8. [Testing](#8-testing)

---

## 1. Setup Supabase

### 1.1 Create Project

1. Go to https://supabase.com
2. Click **New project**
3. Fill in:
   - **Name**: `theycare-portal`
   - **Database Password**: (generate strong password - **SAVE THIS!**)
   - **Region**: Choose closest to target users (e.g., `Southeast Asia (Singapore)`)
4. Click **Create new project** (takes ~2 min)

### 1.2 Collect Credentials

Once project is ready, collect these values:

**From Project Settings → Database:**
- Copy **Connection String** (URI format)
- Replace `[YOUR-PASSWORD]` with your database password
- **Save as**: `DATABASE_URL`

Example:
```
postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres
```

**From Project Settings → API:**
- **Project URL** → Save as: `SUPABASE_URL`
- **anon public** key → Save as: `SUPABASE_ANON_KEY`
- **service_role** key → Save as: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

## 2. Migrate Database to Supabase

### 2.1 Update Local .env

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Supabase credentials:
```env
DATABASE_URL="postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2.2 Run Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

If the migrate command asks for a migration name, enter: `init`

### 2.3 Seed Database

```bash
npm run prisma:seed
# Or with sample data:
npm run prisma:seed-sample
```

### 2.4 Verify in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all your tables (users, patients, events, etc.)

---

## 3. Configure Supabase Storage

Follow the detailed instructions in `SUPABASE_STORAGE_SETUP.md`:

### Quick Steps:

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**

**Create Bucket 1:**
- Name: `proof-of-residency`
- Public: ✅ YES
- Click **Create bucket**

**Create Bucket 2:**
- Name: `learning-materials`
- Public: ✅ YES
- Click **Create bucket**

### 3.1 Set Bucket Policies

For each bucket:

1. Click on bucket → **Policies** tab
2. Click **New policy**
3. Select template: **"Allow public read access"**
4. Click **Review** → **Save policy**
5. Click **New policy** again
6. Select template: **"Allow authenticated uploads"**
7. Click **Review** → **Save policy**

Repeat for both buckets!

---

## 4. Push Code to GitHub

### 4.1 Initialize Git (if not already)

```bash
git init
git add .
git commit -m "feat: Add Supabase storage integration and deployment configs"
```

### 4.2 Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `theycare-portal`
3. Keep it **Private** (recommended) or Public
4. **Do NOT** initialize with README
5. Click **Create repository**

### 4.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/theycare-portal.git
git branch -M main
git push -u origin main
```

---

## 5. Deploy Backend to Render

### 5.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Click **Connect a repository** → Select your GitHub repo
4. Fill in:
   - **Name**: `theycare-backend`
   - **Region**: Same as Supabase (e.g., Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```
     npm install && npm run build && npx prisma generate
     ```
   - **Start Command**:
     ```
     npm start
     ```
   - **Plan**: `Free`

### 5.2 Add Environment Variables

Scroll down to **Environment Variables** and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-supabase-connection-string>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<generate-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
```

**To generate JWT_SECRET**, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note**: Leave `FRONTEND_URL` as placeholder for now, we'll update after deploying frontend.

### 5.3 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://theycare-backend.onrender.com`)

### 5.4 Run Database Migrations (Important!)

After first deploy:

1. Go to your service dashboard
2. Click **Shell** (left sidebar)
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 5.5 Test Backend

Visit: `https://theycare-backend.onrender.com/health`

You should see:
```json
{"status":"OK","message":"Gabay Barangay API is running"}
```

---

## 6. Deploy Frontend to Vercel

### 6.1 Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: `theycare-portal`
- **Directory**: `./` (current directory)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Development Command**: `npm run dev`

### 6.2 Alternative: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 6.3 Add Environment Variables

In Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://theycare-backend.onrender.com/api
   ```
3. Click **Save**

### 6.4 Redeploy

After adding env variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment → **Redeploy**

---

## 7. Final Configuration

### 7.1 Update Backend FRONTEND_URL

Now that you have your Vercel URL:

1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://theycare-portal.vercel.app
   ```
4. Click **Save Changes**
5. Service will auto-redeploy

### 7.2 Update CORS (if needed)

If you used a custom domain, update `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://theycare-portal.vercel.app', // Your production URL
    'http://localhost:5174',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

---

## 8. Testing

### 8.1 Test Registration Flow

1. Visit your Vercel URL (e.g., `https://theycare-portal.vercel.app`)
2. Go to **Register** page
3. Fill in the form
4. **Upload a proof of residency image**
5. Submit
6. Check Supabase Storage → `proof-of-residency` bucket → You should see the uploaded file!

### 8.2 Test Login

1. First, approve the user in database:
   - Go to Supabase → Table Editor → `users` table
   - Find your user
   - Change `status` from `PENDING` to `ACTIVE`
2. Login with your credentials

### 8.3 Test File Upload (Daycare)

1. Login as admin/staff
2. Go to Daycare → Learning Materials
3. Upload a file
4. Check Supabase Storage → `learning-materials` bucket

### 8.4 Monitor Logs

**Backend logs** (Render):
- Go to Render dashboard → Your service → **Logs** tab

**Frontend logs**:
- Use browser DevTools → Console

---

## 9. Post-Deployment

### 9.1 Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS instructions

**For Backend (Render):**
1. Upgrade to paid plan (custom domains not available on free tier)

### 9.2 SSL Certificates

Both Render and Vercel provide automatic SSL certificates. No action needed!

### 9.3 Monitoring

**Render Free Tier Notes:**
- Service spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month free (enough for 1 service running 24/7)

**Vercel Free Tier Notes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic deployments on git push

---

## Troubleshooting

### Backend won't start

**Check logs in Render:**
1. Dashboard → Service → Logs
2. Look for errors

**Common issues:**
- Missing environment variables
- Database connection failed (check DATABASE_URL)
- Prisma client not generated (run `npx prisma generate` in Shell)

### Frontend API calls fail

**Check browser console:**
- Look for CORS errors
- Check if `VITE_API_URL` is correct

**Solutions:**
1. Verify `FRONTEND_URL` in Render matches your Vercel URL
2. Check if backend is running (visit `/health` endpoint)
3. Ensure environment variables are set correctly

### File uploads fail

**Check Supabase Storage:**
1. Verify buckets exist (`proof-of-residency`, `learning-materials`)
2. Verify buckets are public
3. Check bucket policies are set correctly

**Check environment variables:**
1. Verify `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` are set in Render

### Database migration errors

**Run migrations manually:**
1. Go to Render → Service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

---

## Summary

✅ **Supabase**: Database + Storage (free forever)
✅ **Render**: Backend API (free with cold starts)
✅ **Vercel**: Frontend (free, unlimited deployments)

**Your app is now live!** 🎉

**Useful Links:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Backend Health: `https://your-backend.onrender.com/health`
- Supabase Dashboard: `https://supabase.com/dashboard`
- Render Dashboard: `https://dashboard.render.com`
- Vercel Dashboard: `https://vercel.com/dashboard`

---

## Next Steps

1. Set up monitoring (e.g., Sentry for error tracking)
2. Configure email service (Resend, SendGrid)
3. Set up SMS notifications (Twilio)
4. Add analytics (Google Analytics, Plausible)
5. Consider upgrading to paid tiers for better performance
