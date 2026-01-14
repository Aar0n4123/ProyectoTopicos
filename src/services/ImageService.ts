import sharp from "sharp"
import type {
  ResizeParams,
  CropParams,
  FormatParams,
  RotateParams,
  FilterParams,
  PipelineParams,
  PipelineOperation as IPipelineOperation,
} from "../types"

/**
 * Interfaz base para todas las operaciones de procesamiento de imágenes
 */
interface ImageOperation {
  execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer>
}

/**
 * Operación para cambiar el tamaño de una imagen
 */
class ResizeOperation implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as ResizeParams
    const { width, height, fit } = castParams

    if (!width && !height) {
      throw new Error("At least width or height must be provided")
    }

    return sharp(buffer)
      .resize(width, height, {
        fit: (fit || "cover") as any,
        withoutEnlargement: true,
      })
      .toBuffer()
  }
}

/**
 * Operación para recortar una sección de la imagen
 */
class CropOperation implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as CropParams
    const { left, top, width, height } = castParams

    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error("Crop parameters must be valid numbers")
    }

    return sharp(buffer).extract({ left, top, width, height }).toBuffer()
  }
}

/**
 * Operación para cambiar el formato de salida de la imagen (jpeg, png, webp)
 */
class FormatOperation implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as FormatParams
    const { format } = castParams

    if (!["jpeg", "png", "webp"].includes(format)) {
      throw new Error(`Unsupported format: ${format}`)
    }

    let sharpInstance = sharp(buffer)

    if (format === "jpeg") {
      return sharpInstance.jpeg({ quality: 90 }).toBuffer()
    } else if (format === "png") {
      return sharpInstance.png().toBuffer()
    } else if (format === "webp") {
      return sharpInstance.webp({ quality: 90 }).toBuffer()
    }

    throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Operación para rotar la imagen en ángulos específicos
 */
class RotateOperation implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as RotateParams
    const { angle } = castParams

    if (![90, 180, 270].includes(angle)) {
      throw new Error("Angle must be 90, 180, or 270 degrees")
    }

    return sharp(buffer).rotate(angle).toBuffer()
  }
}

/**
 * Operación para aplicar filtros visuales (blur, sharpen, grayscale)
 */
class FilterOperation implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as FilterParams
    const { filter } = castParams

    if (!["blur", "sharpen", "grayscale"].includes(filter)) {
      throw new Error(`Unsupported filter: ${filter}`)
    }

    let sharpInstance = sharp(buffer)

    if (filter === "blur") {
      return sharpInstance.blur(5).toBuffer()
    } else if (filter === "sharpen") {
      return sharpInstance.sharpen({ sigma: 1 }).toBuffer()
    } else if (filter === "grayscale") {
      return sharpInstance.grayscale().toBuffer()
    }

    throw new Error(`Unsupported filter: ${filter}`)
  }
}

/**
 * Operación que permite encadenar múltiples transformaciones de forma secuencial
 */
class PipelineOperationImpl implements ImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const castParams = params as unknown as PipelineParams
    const { operations } = castParams

    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error("Operations array is required")
    }

    let currentBuffer = buffer

    // Aplicar cada operación de la lista sobre el buffer resultante de la anterior
    for (const operation of operations) {
      const op = operation as unknown as IPipelineOperation
      const { type, params: opParams = {} } = op

      const operationFactory = new OperationFactory()
      const operationHandler = operationFactory.getOperation(type)
      currentBuffer = await operationHandler.execute(currentBuffer, opParams as Record<string, unknown>)
    }

    return currentBuffer
  }
}

/**
 * Fábrica para crear instancias de operaciones según su tipo (Patrón Factory)
 */
export class OperationFactory {
  getOperation(type: string): ImageOperation {
    switch (type) {
      case "resize":
        return new ResizeOperation()
      case "crop":
        return new CropOperation()
      case "format":
        return new FormatOperation()
      case "rotate":
        return new RotateOperation()
      case "filter":
        return new FilterOperation()
      case "pipeline":
        return new PipelineOperationImpl()
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }
}
