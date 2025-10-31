# ✅ Deployment Progress - Next Steps

## What's Been Completed

✅ Supabase credentials configured
✅ Backend .env updated with connection string
✅ Database schema migrated to Supabase
✅ Database seeded with initial data
✅ Code prepared with Supabase storage integration

## Sample Login Credentials (Seeded)

- **System Admin**: admin@theycare.com / password123
- **Barangay Captain**: captain@theycare.com / password123
- **BHW**: bhw@theycare.com / password123
- **Daycare Teacher**: teacher@theycare.com / password123
- **SK Chairman**: sk@theycare.com / password123
- **Parent/Resident**: parent@theycare.com / password123

---

## 🔥 IMMEDIATE NEXT STEPS

### Step 0: Enable Row Level Security (RLS) - CRITICAL! ⚠️ (2 minutes)

**⚠️ SECURITY ALERT:** Your tables currently show "unrestricted" - this is a security risk!

**Quick Fix:**
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli/sql
2. Click **New query**
3. Open the file `supabase-enable-rls.sql` from your project root
4. Copy ALL the SQL content
5. Paste into Supabase SQL Editor
6. Click **Run** or press `Ctrl+Enter`

**Verification:**
- Go to **Database** → **Tables**
- All tables should now show 🛡️ shield icon (not "unrestricted")

**Why this is needed:**
- Without RLS, anyone can access your database directly!
- With RLS enabled, only your backend (using service_role key) can access data
- Your app will continue working perfectly

**Detailed guide:** See [SUPABASE_RLS_SETUP.md](./SUPABASE_RLS_SETUP.md)

---

### Step 1: Create Supabase Storage Buckets (5 minutes)

**Go to your Supabase Dashboard:**
- URL: https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli

**Navigate to Storage:**
1. Click **Storage** in the left sidebar
2. Click **New bucket**

**Create Bucket 1: proof-of-residency**
- Name: `proof-of-residency`
- Public bucket: ✅ **YES** (check this!)
- Click **Create bucket**
- Click on the bucket → **Policies** tab → **New policy**
- Select template: **"Allow public read access"** → Save
- Click **New policy** again
- Select template: **"Allow authenticated uploads"** → Save

**Create Bucket 2: learning-materials**
- Name: `learning-materials`
- Public bucket: ✅ **YES** (check this!)
- Click **Create bucket**
- Click on the bucket → **Policies** tab → **New policy**
- Select template: **"Allow public read access"** → Save
- Click **New policy** again
- Select template: **"Allow authenticated uploads"** → Save

**✅ Verification:**
- Go to Storage
- You should see 2 buckets:
  - proof-of-residency (public)
  - learning-materials (public)

---

### Step 2: Push Code to GitHub (2 minutes)

```bash
git add .
git commit -m "feat: Complete Supabase integration and deployment setup"
git push origin main
```

If you haven't set up a GitHub remote yet:
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/theycare-portal.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy Backend to Render (10 minutes)

1. **Go to Render**: https://dashboard.render.com
2. Click **New** → **Web Service**
3. Click **Connect a repository** → Select your GitHub repo
4. **Configure:**
   - **Name**: `theycare-backend`
   - **Region**: `Singapore` (same as Supabase)
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

5. **Add Environment Variables** (click "Add Environment Variable"):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres.lgqbjqfjhdpahcijpnli:%40142536Qwerty@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://lgqbjqfjhdpahcijpnli.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWJqcWZqaGRwYWhjaWpwbmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzEwOTAsImV4cCI6MjA3NzQ0NzA5MH0.OQYGl7XBvI9WutynxWkKadZmMOUBUfoQXirzDd2Xz94
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWJqcWZqaGRwYWhjaWpwbmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg3MTA5MCwiZXhwIjoyMDc3NDQ3MDkwfQ.XqZY9jloRa0B5tVrhc3bkx7gFu2D_Zz3xjS5ccN7JpE
JWT_SECRET=your_random_production_secret_here_change_this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.vercel.app
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use as JWT_SECRET.

**Note**: Use placeholder for FRONTEND_URL for now, we'll update after deploying frontend.

6. Click **Create Web Service**
7. Wait for deployment (~5-10 minutes)
8. **Copy your backend URL** (e.g., `https://theycare-backend.onrender.com`)

---

### Step 4: Deploy Frontend to Vercel (5 minutes)

**Option A: Using Vercel CLI (Recommended)**
```bash
npm install -g vercel
vercel login
cd frontend
vercel
```

Follow prompts:
- Project name: `theycare-portal`
- Build command: `npm run build`
- Output directory: `dist`

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   (Use the URL from Step 3)

5. Click **Deploy**
6. **Copy your frontend URL** (e.g., `https://theycare-portal.vercel.app`)

---

### Step 5: Final Configuration (2 minutes)

**Update Render Backend:**
1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Click **Save Changes**
5. Service will auto-redeploy

---

### Step 6: Test Your Deployment! 🎉

1. **Test Backend Health**:
   - Visit: `https://your-backend.onrender.com/health`
   - Should see: `{"status":"OK","message":"Gabay Barangay API is running"}`

2. **Test Frontend**:
   - Visit: `https://your-app.vercel.app`
   - Should see login page

3. **Test Registration with File Upload**:
   - Click **Register**
   - Fill in form
   - **Upload a proof of residency image**
   - Submit
   - Check Supabase Storage → `proof-of-residency` bucket
   - File should appear!

4. **Test Login**:
   - Use credentials: `admin@theycare.com` / `password123`
   - Should login successfully

5. **Test Learning Materials Upload**:
   - Login as admin
   - Go to Daycare → Learning Materials
   - Upload a file
   - Check Supabase Storage → `learning-materials` bucket

---

## 🐛 Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify all environment variables are set
- Run `npx prisma generate` in Render Shell

### Frontend can't reach backend (CORS error)
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check `VITE_API_URL` in Vercel is correct

### File uploads fail
- Verify both storage buckets exist and are public
- Check bucket policies are set (public read + authenticated upload)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Render

---

## 📦 Your Deployment URLs

Fill these in as you deploy:

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.onrender.com
Health:   https://_____________________.onrender.com/health

Supabase Dashboard: https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli
Render Dashboard:   https://dashboard.render.com
Vercel Dashboard:   https://vercel.com/dashboard
```

---

## 🎯 Summary

**What's Done:**
- ✅ Supabase database migrated
- ✅ Database seeded with sample data
- ✅ Code updated for cloud storage
- ✅ All configuration files created

**What's Next:**
1. ⏳ Create Supabase storage buckets (5 min)
2. ⏳ Push to GitHub (2 min)
3. ⏳ Deploy to Render (10 min)
4. ⏳ Deploy to Vercel (5 min)
5. ⏳ Update environment variables (2 min)
6. ⏳ Test deployment (5 min)

**Total Time Remaining: ~30 minutes**

---

## 📞 Need Help?

Refer to:
- **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)** - Detailed step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick checklist
- **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** - Storage bucket guide

Good luck! 🚀
