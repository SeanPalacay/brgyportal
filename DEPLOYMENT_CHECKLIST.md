# Deployment Checklist

Quick reference checklist for deploying TheyCare Portal.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All features tested locally
- [ ] Environment variables documented

## Supabase Setup

- [ ] Create Supabase project
- [ ] Save database password
- [ ] Copy DATABASE_URL
- [ ] Copy SUPABASE_URL
- [ ] Copy SUPABASE_ANON_KEY
- [ ] Copy SUPABASE_SERVICE_ROLE_KEY
- [ ] Run database migrations locally
- [ ] Seed database
- [ ] Create `proof-of-residency` bucket (public)
- [ ] Create `learning-materials` bucket (public)
- [ ] Set bucket policies (public read + authenticated upload)

## Render Deployment

- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install && npm run build && npx prisma generate`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] DATABASE_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] JWT_SECRET (generated random string)
  - [ ] JWT_EXPIRES_IN=7d
  - [ ] FRONTEND_URL (placeholder initially)
- [ ] Deploy service
- [ ] Run migrations in Shell: `npx prisma migrate deploy`
- [ ] Run seed in Shell: `npx prisma db seed`
- [ ] Test health endpoint: `/health`
- [ ] Copy backend URL

## Vercel Deployment

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy from frontend directory: `cd frontend && vercel`
- [ ] Or import via Vercel dashboard
- [ ] Set root directory to `frontend`
- [ ] Add environment variable:
  - [ ] VITE_API_URL (your Render backend URL + `/api`)
- [ ] Redeploy after adding env variable
- [ ] Copy frontend URL

## Final Configuration

- [ ] Update Render: Set FRONTEND_URL to Vercel URL
- [ ] Wait for backend to redeploy
- [ ] Test registration with file upload
- [ ] Verify file appears in Supabase Storage
- [ ] Test login flow
- [ ] Test file upload in Learning Materials

## Post-Deployment

- [ ] Monitor Render logs for errors
- [ ] Check Vercel deployment logs
- [ ] Test all major features
- [ ] Document live URLs
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/analytics (optional)

## URLs to Save

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.onrender.com
Health:   https://_____________________.onrender.com/health
Supabase: https://supabase.com/dashboard/project/_____
```

## Common Issues

### Backend won't start
✓ Check Render logs
✓ Verify all environment variables are set
✓ Run `npx prisma generate` in Render Shell

### Frontend can't reach backend
✓ Check VITE_API_URL is correct
✓ Verify FRONTEND_URL in Render matches Vercel URL
✓ Check CORS configuration

### File uploads fail
✓ Verify Supabase buckets exist and are public
✓ Check bucket policies are set
✓ Verify SUPABASE_SERVICE_ROLE_KEY is correct

### Database errors
✓ Run migrations: `npx prisma migrate deploy`
✓ Check DATABASE_URL format
✓ Verify Supabase database is accessible
