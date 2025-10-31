# Local Development vs Production

Quick reference for differences between local and production environments.

## File Storage

### Local Development
- Files stored in `backend/uploads/` directory
- Uses disk storage (`multer.diskStorage`)
- Files accessible at `http://localhost:5000/uploads/*`

### Production
- Files stored in Supabase Storage (cloud)
- Uses memory storage (`multer.memoryStorage`)
- Files uploaded to Supabase buckets via API
- Files accessible at `https://xxx.supabase.co/storage/v1/object/public/bucket-name/file.jpg`

**Migration**: Existing local files in `uploads/` won't be automatically migrated. Upload them manually to Supabase Storage or re-upload through the app.

---

## Database

### Local Development
- PostgreSQL running locally
- Connection: `postgresql://username:password@localhost:5432/theycare_db`
- Managed via Prisma migrations

### Production
- PostgreSQL hosted on Supabase
- Connection: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
- Same Prisma migrations work identically

**Migration**: Run `npx prisma migrate deploy` on Supabase database to apply schema.

---

## Environment Variables

### Backend (.env)

| Variable | Local | Production (Render) |
|----------|-------|---------------------|
| NODE_ENV | development | production |
| PORT | 5000 | 5000 |
| DATABASE_URL | localhost connection | Supabase connection |
| SUPABASE_URL | (same) | (same) |
| SUPABASE_ANON_KEY | (same) | (same) |
| SUPABASE_SERVICE_ROLE_KEY | (same) | (same) |
| JWT_SECRET | dev-secret | strong-random-string |
| JWT_EXPIRES_IN | 7d | 7d |
| FRONTEND_URL | http://localhost:5173 | https://app.vercel.app |

### Frontend (.env)

| Variable | Local | Production (Vercel) |
|----------|-------|---------------------|
| VITE_API_URL | http://localhost:5000/api | https://backend.onrender.com/api |

---

## Running the Application

### Local Development

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev  # Runs with nodemon (hot reload)
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev  # Runs Vite dev server
```

Access: `http://localhost:5173`

### Production

**Backend**: Automatically runs on Render
- URL: `https://your-backend.onrender.com`
- Spins down after 15 min inactivity (free tier)
- Cold start: ~30 seconds

**Frontend**: Automatically built and served by Vercel
- URL: `https://your-app.vercel.app`
- Global CDN (always fast)

---

## Development Workflow

### Local Changes

1. Make code changes
2. Test locally
3. Commit to git
4. Push to GitHub

### Automatic Deployment

**Backend (Render):**
- Auto-deploys on push to `main` branch
- Build time: ~5-10 minutes
- Check logs in Render dashboard

**Frontend (Vercel):**
- Auto-deploys on push to `main` branch
- Build time: ~1-2 minutes
- Check logs in Vercel dashboard

---

## Debugging

### Local Development

**Backend logs**: Terminal output (colorful with Morgan)
**Frontend logs**: Browser console
**Database**: Use Prisma Studio (`npm run prisma:studio`)

### Production

**Backend logs**: Render dashboard → Logs tab
**Frontend logs**: Browser console + Vercel dashboard → Logs
**Database**: Supabase dashboard → Table Editor

---

## Testing File Uploads

### Local

1. Upload file through frontend
2. Check `backend/uploads/` directory
3. File accessible at `http://localhost:5000/uploads/filename.jpg`

### Production

1. Upload file through frontend
2. Check Supabase dashboard → Storage → Bucket
3. File accessible at `https://xxx.supabase.co/storage/v1/object/public/bucket-name/filename.jpg`

---

## Switching Between Environments

### Test Against Production Database Locally

Update `backend/.env`:
```env
DATABASE_URL="<your-supabase-connection-string>"
SUPABASE_URL="<your-supabase-url>"
SUPABASE_ANON_KEY="<your-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-key>"
```

Then run backend normally: `npm run dev`

**⚠️ Warning**: This will affect production data!

### Test Against Local Database from Frontend

Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Restart frontend dev server.

---

## Cost Comparison

| Service | Local | Production |
|---------|-------|------------|
| Database | Free (self-hosted) | Free (Supabase) |
| File Storage | Free (local disk) | Free (1 GB on Supabase) |
| Backend Hosting | Free (localhost) | Free (Render with limitations) |
| Frontend Hosting | Free (localhost) | Free (Vercel) |
| **Total** | **Free** | **Free** ✅ |

**Production Limitations (Free Tier):**
- Render: 750 hours/month, cold starts after 15 min
- Supabase: 500 MB database, 1 GB storage, 2 GB bandwidth
- Vercel: 100 GB bandwidth/month

---

## Performance

### Local Development
- **Fast**: No network latency
- **Instant** hot reload
- **Best for**: Active development

### Production
- **Backend**: ~30s cold start (first request), then fast
- **Frontend**: Global CDN (very fast worldwide)
- **File Storage**: CDN cached (fast)
- **Best for**: Real-world testing, demos, production use

---

## When to Use Each

### Use Local:
- ✅ Active development
- ✅ Testing new features
- ✅ Database migrations
- ✅ Debugging
- ✅ Offline work

### Use Production:
- ✅ Demos to stakeholders
- ✅ User acceptance testing
- ✅ Performance testing
- ✅ Mobile testing (real URLs)
- ✅ Sharing with team/users
