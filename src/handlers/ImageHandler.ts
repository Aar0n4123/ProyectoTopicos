import type { ImageRequest, ImageResponse } from "../types"

/**
 * Interfaz que define la estructura de un manejador de imágenes
 */
export interface IImageHandler {
  handle(request: ImageRequest): Promise<ImageResponse>
}

/**
 * Manejador base que ejecuta una operación Sharp específica
 */
export class BaseImageHandler implements IImageHandler {
  constructor(
    private operation: { execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> },
    private operationName: string,
  ) {}

  /**
   * Ejecuta la lógica central de procesamiento de la imagen
   */
  async handle(request: ImageRequest): Promise<ImageResponse> {
    const { file, params } = request

    // Ejecutar la operación de procesamiento (resize, crop, etc.)
    const processedBuffer = await this.operation.execute(file.buffer, params as Record<string, unknown>)

    // Determinar el formato y nombre del archivo de salida
    const format = (params as { format?: string }).format || "jpeg"
    const filename = `processed-${Date.now()}.${format}`

    return {
      buffer: processedBuffer,
      format,
      filename,
    }
  }
}
