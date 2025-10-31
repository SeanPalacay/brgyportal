# Supabase Connection String Guide

## Getting the Correct Connection String

You're experiencing connection issues. This is likely because we need to use the **Transaction Mode** or **Session Mode** connection string from Supabase.

### Steps to Get the Correct Connection String

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli

2. **Navigate to Project Settings**
   - Click the gear icon (⚙️) in the left sidebar
   - Click **Database**

3. **Find Connection String Section**
   - Scroll down to **Connection String**
   - You'll see multiple options:
     - **URI** (default)
     - **Session mode**
     - **Transaction mode**

4. **Copy the URI Connection String**
   - Make sure **URI** is selected
   - Click **Copy** or manually copy the string
   - It should look like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
     ```

## Common Connection String Formats

### Option 1: Direct Connection (Port 5432)
```
postgresql://postgres:[PASSWORD]@db.lgqbjqfjhdpahcijpnli.supabase.co:5432/postgres
```
- **Use for**: Local development (if it works)
- **Issue**: May not work from all networks (firewall/IPv6 issues)

### Option 2: Connection Pooler (Port 6543) - RECOMMENDED
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```
- **Use for**: Production, better compatibility
- **Works better**: Through firewalls and various networks

### Option 3: Session Mode (Port 5432 via pooler)
```
postgresql://postgres:[PASSWORD]@db.lgqbjqfjhdpahcijpnli.supabase.co:5432/postgres?pgbouncer=true
```
- **Use for**: Migrations
- **Add**: `?pgbouncer=true` parameter

## Password Encoding

Your password is: `@142536Qwerty`

The `@` symbol needs to be URL-encoded in the connection string:
- **Original**: `@142536Qwerty`
- **URL Encoded**: `%40142536Qwerty`

## Try These Connection Strings

### 1. Direct with URL-encoded password:
```
postgresql://postgres:%40142536Qwerty@db.lgqbjqfjhdpahcijpnli.supabase.co:5432/postgres
```

### 2. With pgbouncer parameter:
```
postgresql://postgres:%40142536Qwerty@db.lgqbjqfjhdpahcijpnli.supabase.co:5432/postgres?pgbouncer=true
```

### 3. IPv4 enforcement:
```
postgresql://postgres:%40142536Qwerty@db.lgqbjqfjhdpahcijpnli.supabase.co:5432/postgres?connect_timeout=10
```

## Alternative: Use Supabase Dashboard for Migrations

If connection continues to fail from your local machine, you can:

1. **Run migrations directly in Supabase SQL Editor**
   - Go to Supabase Dashboard → SQL Editor
   - Copy the SQL from your migration files
   - Run them directly

2. **Or deploy to Render first**
   - Render's servers can usually connect to Supabase
   - Run migrations from Render's shell

## Next Steps

1. Get the **Connection Pooler** URL from Supabase Dashboard
2. Update your `backend/.env` with the new URL
3. Try `npx prisma migrate deploy` again

If it still doesn't work, we'll proceed with deploying to Render and running migrations from there (Render → Supabase connections are more reliable).
