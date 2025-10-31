# TheyCare Portal - Deployment Guide

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Stack                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel)                                       │
│  ├─ React + TypeScript + Vite                          │
│  ├─ Auto-deploy on git push                            │
│  ├─ Global CDN                                          │
│  └─ https://your-app.vercel.app                        │
│                                                          │
│  Backend (Render)                                        │
│  ├─ Node.js + Express + Prisma                         │
│  ├─ Auto-deploy on git push                            │
│  ├─ Free tier (with cold starts)                       │
│  └─ https://your-backend.onrender.com                  │
│                                                          │
│  Database + Storage (Supabase)                          │
│  ├─ PostgreSQL (500 MB free)                           │
│  ├─ File Storage (1 GB free)                           │
│  ├─ Free forever                                        │
│  └─ https://xxx.supabase.co                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📚 Documentation

This project includes comprehensive deployment documentation:

### Essential Guides

1. **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)** - Complete step-by-step deployment guide
   - Detailed instructions for Supabase, Render, and Vercel
   - Environment variable configuration
   - Database migration steps
   - Testing procedures

2. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick checklist
   - Pre-deployment tasks
   - Configuration checklist
   - Post-deployment verification

3. **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** - Storage configuration
   - Bucket creation
   - Policy setup
   - Troubleshooting

4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Environment variables reference
   - Complete list of required env vars
   - Examples for each service

5. **[LOCAL_VS_PRODUCTION.md](./LOCAL_VS_PRODUCTION.md)** - Environment comparison
   - Differences between local and production
   - Switching between environments
   - Performance comparison

## 🎯 Quick Start

### Option 1: Follow the Complete Guide (Recommended for First Time)

Read **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)** for comprehensive instructions.

### Option 2: Quick Deploy (Experienced Developers)

**Prerequisites:**
- GitHub, Supabase, Render, and Vercel accounts

**Steps:**

1. **Supabase** (5 min)
   ```bash
   # Create project, get credentials, create storage buckets
   # See SUPABASE_STORAGE_SETUP.md
   ```

2. **Database** (5 min)
   ```bash
   cd backend
   # Update .env with Supabase credentials
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. **Push to GitHub** (2 min)
   ```bash
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```

4. **Render** (10 min)
   - New Web Service → Connect repo
   - Root: `backend`
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npm start`
   - Add env vars (see DEPLOYMENT.md)

5. **Vercel** (5 min)
   ```bash
   cd frontend
   vercel
   # Or import via dashboard
   # Add env: VITE_API_URL
   ```

6. **Final Config** (2 min)
   - Update Render: `FRONTEND_URL=<vercel-url>`
   - Test deployment

**Total time: ~30 minutes**

## ✅ What's Included

### Code Changes for Production

✅ Supabase storage integration
- `backend/src/utils/supabase.ts` - Storage utilities
- `backend/src/controllers/auth.controller.ts` - Updated for Supabase uploads
- `backend/src/controllers/daycare.controller.ts` - Updated for Supabase uploads
- `backend/src/routes/daycare.routes.ts` - Memory storage for multer

✅ Deployment configurations
- `backend/render.yaml` - Render configuration
- `vercel.json` - Vercel configuration
- `.gitignore` - Updated to exclude uploads folder

✅ Environment variable templates
- `backend/.env.example` - Updated with Supabase vars

### Documentation

✅ Complete deployment guides (see above)
✅ Troubleshooting guides
✅ Environment variable references
✅ Checklists and quick references

## 🔑 Required Environment Variables

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<supabase-connection-string>
SUPABASE_URL=<supabase-project-url>
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
JWT_SECRET=<random-32-char-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<vercel-url>
```

### Frontend (Vercel)

```env
VITE_API_URL=<render-backend-url>/api
```

## 🧪 Testing Your Deployment

After deployment, test these flows:

1. **Registration with file upload**
   - Upload proof of residency
   - Check Supabase Storage → `proof-of-residency` bucket

2. **Login**
   - Approve user in Supabase (change status to ACTIVE)
   - Login successfully

3. **Learning materials upload**
   - Upload a file
   - Check Supabase Storage → `learning-materials` bucket

4. **API health check**
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"OK",...}`

## 🐛 Troubleshooting

### Backend Issues

**Service won't start:**
```bash
# Check Render logs
# Run in Render Shell:
npx prisma generate
npx prisma migrate deploy
```

**Database connection failed:**
- Verify `DATABASE_URL` format
- Check Supabase project is active
- Ensure database password is correct

### Frontend Issues

**API calls fail (CORS):**
- Verify `FRONTEND_URL` in Render matches Vercel URL
- Check `VITE_API_URL` in Vercel env vars

**Env vars not working:**
- Redeploy after adding env vars (they don't auto-apply)

### Storage Issues

**File uploads fail:**
- Verify Supabase buckets exist and are public
- Check bucket policies are set
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

See detailed troubleshooting in **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md#troubleshooting)**.

## 💰 Cost Breakdown

| Service | Free Tier | Limits | Paid Plans |
|---------|-----------|--------|------------|
| **Supabase** | ✅ Forever | 500 MB DB, 1 GB storage | $25/mo (8 GB DB, 100 GB storage) |
| **Render** | ✅ Forever | 750 hrs/mo, cold starts | $7/mo (no cold starts) |
| **Vercel** | ✅ Forever | 100 GB bandwidth | $20/mo (1 TB bandwidth) |

**Total Production Cost: FREE** ✅ (with limitations)

**Recommended Upgrade Path:**
1. Start with free tier (validate product)
2. When traffic grows → Upgrade Render ($7/mo) to remove cold starts
3. When storage grows → Upgrade Supabase ($25/mo)
4. When bandwidth grows → Upgrade Vercel ($20/mo)

## 🔄 CI/CD (Automatic Deployments)

Once configured, deployments are automatic:

```bash
# Make changes locally
git add .
git commit -m "feat: Add new feature"
git push origin main

# Automatically triggers:
# 1. Vercel builds and deploys frontend (~1-2 min)
# 2. Render builds and deploys backend (~5-10 min)
```

Monitor deployments:
- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com

## 📞 Support

### Documentation
- [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Quick checklist
- [LOCAL_VS_PRODUCTION.md](./LOCAL_VS_PRODUCTION.md) - Environment comparison

### External Resources
- Supabase Docs: https://supabase.com/docs
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

## 📝 Next Steps After Deployment

1. ✅ Set up custom domain (optional)
2. ✅ Configure email service (Resend, SendGrid)
3. ✅ Add SMS notifications (Twilio)
4. ✅ Set up monitoring (Sentry, LogRocket)
5. ✅ Add analytics (Google Analytics, Plausible)
6. ✅ Configure backups (Supabase has daily backups)
7. ✅ Security audit
8. ✅ Performance optimization

## 🎉 Success!

Once deployed, your app will be accessible at:

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **API Health**: https://your-backend.onrender.com/health

**Production-ready, zero-cost deployment complete!** 🚀

---

## File Structure Reference

```
theycare-portal/
├── backend/
│   ├── src/
│   │   ├── utils/
│   │   │   └── supabase.ts          # NEW: Supabase storage utils
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # UPDATED: Supabase uploads
│   │   │   └── daycare.controller.ts # UPDATED: Supabase uploads
│   │   └── routes/
│   │       └── daycare.routes.ts    # UPDATED: Memory storage
│   ├── render.yaml                  # NEW: Render config
│   └── .env.example                 # UPDATED: Supabase vars
├── frontend/
│   └── (no changes needed)
├── vercel.json                      # NEW: Vercel config
├── .gitignore                       # UPDATED: Exclude uploads
├── DEPLOYMENT_STEPS.md              # NEW: Full deployment guide
├── DEPLOYMENT_CHECKLIST.md          # NEW: Quick checklist
├── DEPLOYMENT.md                    # NEW: Env vars reference
├── SUPABASE_STORAGE_SETUP.md        # NEW: Storage setup guide
├── LOCAL_VS_PRODUCTION.md           # NEW: Environment comparison
└── README_DEPLOYMENT.md             # NEW: This file
```
