import multer from "multer";
import path from "path";
import fs from "fs";

// const uploadDir = "uploads/products";

// Ensure upload directory exists
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   // 1. Where to save the files locally
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Folder path: ./uploads/
//   },

//   // 2. What to name the file on disk
//   filename: (req, file, cb) => {
//     // Generate a unique filename: timestamp-random.ext
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//   },
// });

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

export const createUploader = (subFolder: string) => {
  const uploadDir = path.join(process.cwd(), "uploads", subFolder);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });
};

export const uploadImage = (folderName: string, fieldName = "image") => {
  return createUploader(folderName).single(fieldName);
};
