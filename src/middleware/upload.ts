import multer from "multer"
import type { Express } from "express"

// Tamaño máximo permitido para archivos subidos (configurado por variable de entorno)
const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || "10485760") // 10MB

// Configuración de almacenamiento en memoria para Multer
const storage = multer.memoryStorage()

/**
 * Filtro para validar que solo se suban formatos de imagen permitidos
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/tiff"]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported image format"))
  }
}

/**
 * Middleware configurado para manejar la subida de un solo archivo
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
})
