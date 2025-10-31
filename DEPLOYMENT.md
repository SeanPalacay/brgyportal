# Deployment Guide

This guide walks through deploying TheyCare Portal to production.

## Architecture

- **Frontend**: Vercel
- **Backend**: Render
- **Database + Storage**: Supabase

## Environment Variables Needed

### Supabase (from Supabase Dashboard)

After creating your Supabase project, collect these values:

1. **Database Connection String**: Project Settings → Database → Connection String (URI format)
2. **Supabase URL**: Project Settings → API → Project URL
3. **Anon Key**: Project Settings → API → anon public key
4. **Service Role Key**: Project Settings → API → service_role key (keep secret!)

### Backend Environment Variables (Render)

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Supabase (from Supabase)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)

# Server
NODE_ENV=production
PORT=5000

# JWT (generate random string for production!)
JWT_SECRET=your-super-secret-production-key-change-this
JWT_EXPIRES_IN=7d

# Frontend (will be your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Twilio (if using SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

### Frontend Environment Variables (Vercel)

```env
# Backend API (will be your Render URL)
VITE_API_URL=https://your-backend.onrender.com/api
```

## Step-by-Step Deployment

See DEPLOYMENT_STEPS.md for detailed instructions.
