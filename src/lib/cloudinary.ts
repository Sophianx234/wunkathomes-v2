import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Internal single-file processor ---
async function uploadSingleFile(file: File, folder: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder, 
        resource_type: "auto" 
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

// --- TypeScript Overloads (For perfect IDE intellisense) ---
export async function uploadToCloudinary(file: File, folder?: string): Promise<string>;
export async function uploadToCloudinary(files: File[], folder?: string): Promise<string[]>;

// --- Main Dynamic Function ---
export async function uploadToCloudinary(
  fileOrFiles: File | File[], 
  folder: string = "wunkathomes/general"
): Promise<string | string[]> {
  
  if (Array.isArray(fileOrFiles)) {
    // If it's an array, upload all files concurrently for maximum speed
    const uploadPromises = fileOrFiles.map((file) => uploadSingleFile(file, folder));
    return await Promise.all(uploadPromises);
  } else {
    // If it's a single file, just process that one
    return await uploadSingleFile(fileOrFiles, folder);
  }
}