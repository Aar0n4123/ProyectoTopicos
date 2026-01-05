import type { ImageRequest, ImageResponse } from "../types"

export interface IImageHandler {
  handle(request: ImageRequest): Promise<ImageResponse>
}

export class BaseImageHandler implements IImageHandler {
  constructor(
    private operation: { execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> },
    private operationName: string,
  ) {}

  async handle(request: ImageRequest): Promise<ImageResponse> {
    const { file, params } = request

    // Process image
    const processedBuffer = await this.operation.execute(file.buffer, params as Record<string, unknown>)

    // Determine output format
    const format = (params as { format?: string }).format || "jpeg"
    const filename = `processed-${Date.now()}.${format}`

    return {
      buffer: processedBuffer,
      format,
      filename,
    }
  }
}
