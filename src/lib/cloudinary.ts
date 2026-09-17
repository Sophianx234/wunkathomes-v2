import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Internal single-file processor ---
async function uploadSingleFile(file: File | string, folder: string, publicId?: string): Promise<string> {
  const isBase64Image = typeof file === "string" && file.startsWith("data:image/");
  const isFileImage = typeof file !== "string" && file.type.startsWith("image/");
  const isImage = isBase64Image || isFileImage;

  const options: any = {
    folder: folder,
    resource_type: "auto",
  };

  if (publicId) {
    options.public_id = publicId;
    options.overwrite = true;
  }

  if (isImage) {
    options.width = 1200;
    options.height = 1200;
    options.crop = "limit";
    options.format = "webp";
    options.quality = "auto";
  }

  // ✅ FIX: If the file is a Base64 string, upload it directly
  if (typeof file === "string") {
    const result = await cloudinary.uploader.upload(file, options);
    return result.secure_url;
  }

  // 📁 Fallback: Process standard File objects as buffers
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

// --- TypeScript Overloads (For perfect IDE intellisense) ---
export async function uploadToCloudinary(file: File | string, folder?: string, publicId?: string): Promise<string>;
export async function uploadToCloudinary(files: (File | string)[], folder?: string, publicIds?: string[]): Promise<string[]>;

// --- Main Dynamic Function ---
export async function uploadToCloudinary(
  fileOrFiles: File | string | (File | string)[], 
  folder: string = "wunkathomes/general",
  publicIdOrIds?: string | string[]
): Promise<string | string[]> {
  
  if (Array.isArray(fileOrFiles)) {
    // If it's an array, upload all files concurrently for maximum speed
    const ids = Array.isArray(publicIdOrIds) ? publicIdOrIds : [];
    const uploadPromises = fileOrFiles.map((file, index) => uploadSingleFile(file, folder, ids[index]));
    return await Promise.all(uploadPromises);
  } else {
    // If it's a single file, just process that one
    const id = typeof publicIdOrIds === "string" ? publicIdOrIds : undefined;
    return await uploadSingleFile(fileOrFiles, folder, id);
  }
}

// ==========================================
// NEW: DELETION UTILITY
// ==========================================

/**
 * Deletes a file from Cloudinary using its Public ID.
 * @param publicId The Cloudinary public ID (e.g., "wunkathomes/properties/abc123xyz")
 * @returns boolean indicating success or failure
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    // Cloudinary responds with { result: 'ok' } if successful, or { result: 'not found' }
    if (result.result === 'ok') {
      return true;
    } else {
      console.warn(`Cloudinary deletion warning: ${publicId} returned status '${result.result}'`);
      return false;
    }
  } catch (error) {
    console.error(`[CRITICAL] Failed to delete Cloudinary asset (${publicId}):`, error);
    return false;
  }
}
