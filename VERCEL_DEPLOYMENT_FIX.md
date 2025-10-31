# Vercel Deployment Fix

## Issue
Vercel is trying to build from the repo root but needs to build from the `frontend` directory.

## Solution

### In Vercel Dashboard:

1. **Go to your project settings:**
   - https://vercel.com/dashboard (find your project)
   - Click on the project
   - Go to **Settings**

2. **Update Build & Development Settings:**
   - Click **"General"** in settings sidebar
   - Scroll to **"Build & Development Settings"**

3. **Configure these settings:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` ← **IMPORTANT!** |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

4. **Add Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Click **"Add New"**
   - Name: `VITE_API_URL`
   - Value: `https://gabaybarangay.onrender.com/api`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"⋯"** (three dots) on latest deployment
   - Click **"Redeploy"**
   - ✅ Use existing Build Cache: NO (uncheck this!)
   - Click **"Redeploy"**

## Alternative: Delete and Re-import

If the above doesn't work:

1. **Delete the project:**
   - Settings → scroll to bottom → "Delete Project"

2. **Re-import with correct settings:**
   - Go to https://vercel.com/new
   - Import `SeanPalacay/brgyportal`
   - **Before clicking Deploy**, click "Configure Project"
   - Set **Root Directory** to `frontend`
   - Add environment variable: `VITE_API_URL=https://gabaybarangay.onrender.com/api`
   - Click **Deploy**

## Verification

After successful deployment:
- ✅ Visit your Vercel URL
- ✅ Should see the login page
- ✅ Try to login with: `admin@theycare.com` / `password123`
