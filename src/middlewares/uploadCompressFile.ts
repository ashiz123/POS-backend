/**  Summary Flow:
 * The user uploads a large 5MB photo from a frontend form.
 * Multer catches it and holds the raw bytes temporarily in RAM as a Buffer.
 * Sharp takes that buffer, downsizes the pixel dimensions, converts it to WebP format, and compresses it.
 *The final lightweight result (around 50–100 KB) is sent up to AWS S3 via PutObjectCommand.
 */

import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { isDev } from "../utils/isDevelopment";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 1. Initialize AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// 2. Always use memory storage so Sharp can access the buffer
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadAndOptimizeImage = (
  folderName: string,
  fieldName = "image",
) => {
  const multerMiddleware = uploadMemory.single(fieldName);

  return (req: any, res: any, next: any) => {
    multerMiddleware(req, res, async (err: any) => {
      if (err) return next(err);

      if (!req.file) return next();

      try {
        const filename = `${folderName}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`; //file naming

        // 3. Process the file with Sharp (Resize & WebP Conversion)
        const optimizedBuffer = await sharp(req.file.buffer)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        if (isDev) {
          // --- LOCAL DEVELOPMENT ---
          const uploadDir = path.join(process.cwd(), `uploads/${folderName}`);

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const outputPath = path.join(uploadDir, filename);
          fs.writeFileSync(outputPath, optimizedBuffer);

          req.file.filename = filename;
          req.file.url = `/uploads/${folderName}/${filename}`;
        } else {
          // --- PRODUCTION (AWS S3) ---
          const s3Key = `${folderName}/${filename}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: s3Key,
              Body: optimizedBuffer,
              ContentType: "image/webp",
            }),
          );

          // Construct public S3 URL
          req.file.url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        }

        next();
      } catch (processingError) {
        console.error("Image optimization and upload error:", processingError);
        return res
          .status(500)
          .json({ error: "Failed to process and upload image" });
      }
    });
  };
};
