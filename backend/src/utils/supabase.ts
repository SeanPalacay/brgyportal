import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️  Supabase credentials not configured. File uploads will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param file - Express.Multer.File object
 * @param path - File path in bucket (e.g., 'learning-materials/file.pdf')
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  bucket: string,
  file: Express.Multer.File,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get download URL for a file
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns Signed URL (expires in 1 hour)
 */
export async function getDownloadUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Supabase signed URL error:', error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Extract file path from Supabase URL
 * @param url - Full Supabase storage URL
 * @param bucket - Bucket name
 * @returns File path
 */
export function extractFilePathFromUrl(url: string, bucket: string): string {
  // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/path/to/file
  const parts = url.split(`/storage/v1/object/public/${bucket}/`);
  return parts[1] || '';
}
