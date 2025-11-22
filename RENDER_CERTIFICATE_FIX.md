# Render Certificate Download Fix - Final Solution

## Problem
Chrome is installed during build but not accessible at runtime because Render's cache is cleared between build and deployment phases.

## Solution Applied

### 1. Updated Code (`backend/src/utils/certificateGenerator.ts`)
Added hardcoded Chrome path for production:
```typescript
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
  (process.env.NODE_ENV === 'production'
    ? '/opt/render/.cache/puppeteer/chrome/linux-141.0.7390.122/chrome-linux64/chrome'
    : undefined);
```

### 2. Update Render Dashboard (DO THIS NOW)

Go to your Render service settings and add these environment variables:

**Option A: Add these via Dashboard (Fastest)**

1. Go to https://dashboard.render.com
2. Click your `theycare-backend` service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these TWO new variables:

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true
PUPPETEER_CACHE_DIR = /opt/render/.cache/puppeteer
```

6. Click **Save Changes**
7. **Manual Deploy** → Deploy latest commit

**Option B: Use render.yaml (Already in repo)**

The `render.yaml` file in the root has been updated with these variables. If Render detects it, it will auto-configure.

### 3. Verify Build Command

Your build command should be:
```bash
npm install && npx puppeteer browsers install chrome && npx prisma generate && npm run build
```

This is already set in your Render dashboard.

## How It Works Now

1. **Build phase**: Chrome installed to `/opt/render/.cache/puppeteer/`
2. **Runtime**: Code explicitly looks for Chrome at that path
3. **Environment variables**: Tell Puppeteer where to find Chrome

## Testing After Deploy

1. Wait for deployment to complete
2. Try downloading a certificate
3. Check logs for:
   - ✅ "Generating certificate PDF for: [Name]"
   - ✅ "PDF generated successfully, size: [bytes] bytes"
   - ❌ No "Could not find Chrome" errors

## If It Still Fails

The Chrome version might have changed. Check Render build logs for the exact Chrome version installed:

```
chrome@141.0.7390.122 /opt/render/.cache/puppeteer/chrome/linux-141.0.7390.122/chrome-linux64/chrome
```

If the version number is different, update line 23 in `certificateGenerator.ts` with the correct path.

## Alternative: Use @sparticuz/chromium

If Puppeteer continues to fail, switch to a lighter Chrome package designed for serverless:

```bash
npm install @sparticuz/chromium puppeteer-core
```

Then update `certificateGenerator.ts`:
```typescript
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});
```

This package is specifically designed for AWS Lambda and Render.
