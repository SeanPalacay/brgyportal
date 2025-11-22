# Puppeteer Certificate Generation - Render Deployment Fix

## Problem
Certificate download endpoints are failing with 500 errors on Render due to Puppeteer requiring Chrome/Chromium, which isn't available by default on Render's free tier.

## What Was Fixed

### 1. Updated Certificate Generator (`backend/src/utils/certificateGenerator.ts`)
Added Puppeteer launch arguments for serverless/containerized environments:

```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',              // Required for Docker/containerized environments
    '--disable-setuid-sandbox',  // Required for Docker/containerized environments
    '--disable-dev-shm-usage',   // Overcome limited shared memory in containers
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',          // Don't create separate renderer process
    '--disable-gpu'              // Disable GPU acceleration
  ]
});
```

### 2. Added Better Error Logging
Updated all certificate download controllers (health, daycare, SK) to log:
- When PDF generation starts
- PDF size when successful
- Full error stack trace on failure
- Detailed error messages in response

## Render Configuration Required

### Option 1: Use Puppeteer with Chrome (Recommended)

Add this to your `render.yaml` or Render dashboard settings:

**Build Command:**
```bash
cd backend && npm install && npx puppeteer browsers install chrome
```

**Start Command:**
```bash
cd backend && npm start
```

**Environment Variables:**
```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/opt/render/.cache/puppeteer/chrome/linux-<version>/chrome-linux64/chrome
```

### Option 2: Install Chromium System Dependencies

Add a `render.yaml` file to your project root:

```yaml
services:
  - type: web
    name: theycare-backend
    env: node
    region: singapore
    plan: free
    buildCommand: |
      cd backend
      npm install
      npx puppeteer browsers install chrome
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_VERSION
        value: 18
```

### Option 3: Use Alternative PDF Library (Future Enhancement)

If Puppeteer continues to fail, consider replacing with a lighter PDF library:
- **pdf-lib**: Pure JavaScript, no Chrome needed
- **pdfkit**: Node.js PDF generation library
- **jsPDF**: Smaller footprint, client or server-side

Example with pdf-lib:
```bash
cd backend
npm install pdf-lib
```

Then refactor `certificateGenerator.ts` to use pdf-lib instead of Puppeteer.

## Testing Locally

To test if Puppeteer works correctly:

```bash
cd backend
npm run build
npm start

# In another terminal:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/sk/certificates/CERT_ID/download \
  --output test.pdf
```

Check the backend logs for:
- "Generating certificate PDF for: [Name]"
- "PDF generated successfully, size: [bytes] bytes"

## Deployment Checklist

- [ ] Updated `certificateGenerator.ts` with Puppeteer args
- [ ] Added error logging to all certificate controllers
- [ ] Configured Render build command to install Chrome
- [ ] Set PUPPETEER environment variables
- [ ] Tested certificate download on production
- [ ] Verified PDF downloads correctly
- [ ] Checked Render logs for Puppeteer errors

## Alternative: Client-Side PDF Generation

If server-side PDF generation remains problematic, you could:

1. Generate HTML certificate on server
2. Send HTML to frontend
3. Use `html2pdf.js` or `jsPDF` in browser to convert to PDF
4. User downloads directly from browser

This removes the server-side Chrome dependency entirely.

## Debugging on Render

Check Render logs for these error patterns:

**Error: Failed to launch the browser process**
- Solution: Install Chrome using build command

**Error: Could not find Chrome**
- Solution: Set PUPPETEER_EXECUTABLE_PATH correctly

**EACCES: permission denied**
- Solution: Ensure --no-sandbox flag is set

**Out of memory**
- Solution: Reduce PDF size or upgrade Render plan
