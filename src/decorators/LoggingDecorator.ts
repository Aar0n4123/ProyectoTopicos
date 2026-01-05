import type { IImageHandler } from "../handlers/ImageHandler"
import type { ImageRequest, ImageResponse } from "../types"
import type { ILogger } from "../logging/ILogger"

export class LoggingDecorator implements IImageHandler {
  constructor(
    private inner: IImageHandler,
    private logger: ILogger,
    private endpoint: string,
  ) {}

  async handle(request: ImageRequest): Promise<ImageResponse> {
    const start = Date.now()
    const userEmail = request.user?.email || "anonymous"

    try {
      const result = await this.inner.handle(request)
      const duration = Date.now() - start

      // Log success
      await this.logger.log({
        timestamp: new Date().toISOString(),
        level: "info",
        user: userEmail,
        endpoint: this.endpoint,
        params: this.sanitizeParams(request.params as unknown as Record<string, unknown>),
        duration,
        result: "success",
      })

      return result
    } catch (error) {
      const duration = Date.now() - start
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      // Log error
      await this.logger.log({
        timestamp: new Date().toISOString(),
        level: "error",
        user: userEmail,
        endpoint: this.endpoint,
        params: this.sanitizeParams(request.params as unknown as Record<string, unknown>),
        duration,
        result: "error",
        message: errorMessage,
      })

      throw error
    }
  }

  private sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    // Remove sensitive or large data, but keep useful ones
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(params)) {
      if (key === "operations" && Array.isArray(value)) {
        sanitized[key] = value.map((op) => ({ type: op.type, params: op.params }))
      } else if (typeof value !== "object" || value === null) {
        sanitized[key] = value
      }
    }
    return sanitized
  }
}
