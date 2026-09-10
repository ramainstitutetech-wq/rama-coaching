import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dcfncvvf",
  api_key: process.env.CLOUDINARY_API_KEY || "849858559681924",
  api_secret: process.env.CLOUDINARY_API_SECRET || "AKeeTK6XTEbYrE_KwcR0fy0G8vY",
  secure: true,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    isDocument?: boolean;
    originalFilename?: string;
  } = {}
): Promise<UploadApiResponse> {
  const { folder = "rama_coaching", isDocument = false, originalFilename = "file" } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: isDocument ? "raw" : "image",
    };

    if (!isDocument) {
      // Auto-compress, convert to modern format (WebP/AVIF), and constrain max dimensions for web
      uploadOptions.transformation = [
        { width: 1600, height: 1600, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ];
    } else {
      // Preserve document extension
      const safeName = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, "_");
      uploadOptions.public_id = `${Date.now()}-${safeName}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary };
