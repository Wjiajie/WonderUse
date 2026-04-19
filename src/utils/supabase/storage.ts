import { createClient } from './client';

// NOTE: This module-level client is fine for browser-only usage.
const supabase = createClient();

export const BUCKET_NAME = 'product-images';

/**
 * Uploads a product image to Supabase Storage.
 * @param userId - Used to namespace the file path for security/organization
 * @param file - The File object to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
  // Ensure unique filename
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Deletes an image from Supabase Storage by its full public URL
 */
export async function deleteProductImage(publicUrl: string) {
  if (!publicUrl) return;

  try {
    // Extract the relative path from the public URL
    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/product-images/[userId]/[filename.ext]
    const bucketUrlPart = `/object/public/${BUCKET_NAME}/`;
    const pathStartIndex = publicUrl.indexOf(bucketUrlPart);
    
    if (pathStartIndex === -1) {
      console.warn("Could not parse storage path from URL:", publicUrl);
      return;
    }

    const path = publicUrl.substring(pathStartIndex + bucketUrlPart.length);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
      
    if (error) throw error;
  } catch (err) {
    console.error('Failed to delete image:', err);
    throw err;
  }
}
