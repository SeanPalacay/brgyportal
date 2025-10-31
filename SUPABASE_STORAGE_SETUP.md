# Supabase Storage Setup Guide

## Create Storage Buckets

After creating your Supabase project, you need to create storage buckets for file uploads.

### Step-by-Step Instructions

1. Go to your Supabase Dashboard
2. Navigate to **Storage** (left sidebar)
3. Click **New bucket**

Create the following buckets:

### Bucket 1: proof-of-residency

- **Name**: `proof-of-residency`
- **Public bucket**: ✅ YES (checked)
- **File size limit**: 10 MB
- **Allowed MIME types**: image/jpeg, image/png, image/jpg, application/pdf

**Purpose**: Stores proof of residency documents uploaded during user registration.

### Bucket 2: learning-materials

- **Name**: `learning-materials`
- **Public bucket**: ✅ YES (checked)
- **File size limit**: 10 MB
- **Allowed MIME types**:
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/vnd.ms-powerpoint
  - application/vnd.openxmlformats-officedocument.presentationml.presentation
  - image/jpeg
  - image/png
  - image/gif
  - video/mp4
  - video/mpeg

**Purpose**: Stores educational materials uploaded by daycare staff.

## Set Bucket Policies (Important!)

After creating each bucket, you need to set up access policies.

### For Both Buckets:

1. Click on the bucket name
2. Go to **Policies** tab
3. Click **New policy**

#### Policy 1: Allow authenticated users to upload

```sql
-- Name: Allow authenticated uploads
-- Target roles: authenticated
-- Policy:
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proof-of-residency');
```

(Repeat for `learning-materials` bucket, changing bucket_id)

#### Policy 2: Allow public read access

```sql
-- Name: Public read access
-- Target roles: public
-- Policy:
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proof-of-residency');
```

(Repeat for `learning-materials` bucket, changing bucket_id)

#### Policy 3: Allow authenticated users to delete their own files

```sql
-- Name: Allow authenticated delete
-- Target roles: authenticated
-- Policy:
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proof-of-residency');
```

(Repeat for `learning-materials` bucket, changing bucket_id)

## Quick Policy Setup (Alternative)

Alternatively, use the **Policy Templates** in Supabase:

1. Go to bucket → Policies
2. Click **New policy**
3. Select template: **Allow public read access**
4. Click **Review** → **Save policy**
5. Repeat with template: **Allow authenticated uploads**

## Verify Setup

After creating buckets:

1. Go to Storage
2. You should see both buckets listed:
   - ✅ proof-of-residency (public)
   - ✅ learning-materials (public)

## Testing Upload (Optional)

You can test by manually uploading a file:

1. Click on a bucket
2. Click **Upload file**
3. Upload a test image
4. Click on the uploaded file
5. Copy the public URL - it should look like:
   ```
   https://xxx.supabase.co/storage/v1/object/public/proof-of-residency/test.png
   ```

## Troubleshooting

### Error: "new row violates row-level security policy"

**Solution**: Make sure you created the policies above. Buckets without policies will reject uploads.

### Error: "File type not allowed"

**Solution**: In bucket settings, check **Allowed MIME types** includes your file type.

### Files not accessible

**Solution**: Make sure bucket is set to **Public** (checkbox when creating bucket).
