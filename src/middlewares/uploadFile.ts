/* This middleware is currently unused
The optimize version, that reduce file size is in used
check uploadCompressFile.ts
return createUploader(folderName).single(fieldName); Because of this middlware is not using return (req, res, next)
*/

import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import path from "path";
import fs from "fs";
import { isDev } from "../utils/isDevelopment";
import { userActivationHtml } from "../utils/userActivationHtml";

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype}). Only JPG, PNG, and WEBP images are allowed.`,
      ),
    );
  }
};

//Storing locally in the backend project
const getLocalStorage = (subFolder: string) => {
  const uploadDir = path.join(process.cwd(), "uploads", subFolder);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

//multers3 dont use filename instead use like req.file.key, req.file.location
const getS3Storage = (subFolder: string) => {
  const s3Config = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  return multerS3({
    s3: s3Config,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${subFolder}/${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

export const createUploader = (subFolder: string) => {
  const storage = isDev ? getLocalStorage(subFolder) : getS3Storage(subFolder);

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

export const uploadImage = (folderName: string, fieldName = "image") => {
  const multerMiddleware = createUploader(folderName).single(fieldName); //middleware Delegation : If middleware is using another custom middleware
  //Instead of directly using middleware in the route, the middleware is using another custom middlware, so, this is called middleware Delegation
  // If multiple middleware use in routes than called middleware chaining

  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      next();
    });
  };
};
