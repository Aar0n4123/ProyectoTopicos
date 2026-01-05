import multer from "multer"
import type { Express } from "express"

const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || "10485760") // 10MB

// Configure multer to store files in memory
const storage = multer.memoryStorage()

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/tiff"]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported image format"))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
})
