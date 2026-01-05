import { Router, type Request, type Response } from "express"
import { upload } from "../middleware/upload"
import type { IImageHandler } from "../handlers/ImageHandler"
import { BaseImageHandler } from "../handlers/ImageHandler"
import { AuthDecorator } from "../decorators/AuthDecorator"
import { LoggingDecorator } from "../decorators/LoggingDecorator"
import type { AuthService } from "../services/AuthService"
import type { ILogger } from "../logging/ILogger"
import { OperationFactory } from "../services/ImageService"
import type { ImageRequest } from "../types"

export class ImageRoutes {
  private router: Router
  private authService: AuthService
  private logger: ILogger
  private operationFactory: OperationFactory

  constructor(authService: AuthService, logger: ILogger) {
    this.router = Router()
    this.authService = authService
    this.logger = logger
    this.operationFactory = new OperationFactory()
    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.router.post("/resize", upload.single("image"), this.handleResize.bind(this))
    this.router.post("/crop", upload.single("image"), this.handleCrop.bind(this))
    this.router.post("/format", upload.single("image"), this.handleFormat.bind(this))
    this.router.post("/rotate", upload.single("image"), this.handleRotate.bind(this))
    this.router.post("/filter", upload.single("image"), this.handleFilter.bind(this))
    this.router.post("/pipeline", upload.single("image"), this.handlePipeline.bind(this))
  }

  private createHandler(operationType: string, endpoint: string): IImageHandler {
    const operation = this.operationFactory.getOperation(operationType)
    const baseHandler = new BaseImageHandler(operation, operationType)
    const authHandler = new AuthDecorator(baseHandler, this.authService)
    const loggingHandler = new LoggingDecorator(authHandler, this.logger, endpoint)
    return loggingHandler
  }

  private extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }
    return undefined
  }

  private async handleResize(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const width = req.body.width ? Number.parseInt(req.body.width) : undefined
      const height = req.body.height ? Number.parseInt(req.body.height) : undefined
      const fit = req.body.fit || "cover"

      const handler = this.createHandler("resize", "/images/resize")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { width, height, fit },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", `image/${result.format}`)
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private async handleCrop(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const left = Number.parseInt(req.body.left)
      const top = Number.parseInt(req.body.top)
      const width = Number.parseInt(req.body.width)
      const height = Number.parseInt(req.body.height)

      if (isNaN(left) || isNaN(top) || isNaN(width) || isNaN(height)) {
        res.status(400).json({
          error: "Missing or invalid crop parameters",
          code: "INVALID_PARAMS",
          timestamp: new Date().toISOString(),
        })
        return
      }

      const handler = this.createHandler("crop", "/images/crop")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { left, top, width, height },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", `image/${result.format}`)
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private async handleFormat(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const format = req.body.format
      if (!["jpeg", "png", "webp"].includes(format)) {
        res.status(400).json({
          error: "Invalid format. Must be jpeg, png, or webp",
          code: "INVALID_FORMAT",
          timestamp: new Date().toISOString(),
        })
        return
      }

      const handler = this.createHandler("format", "/images/format")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { format },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", `image/${result.format}`)
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private async handleRotate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const angle = Number.parseInt(req.body.angle)
      if (![90, 180, 270].includes(angle)) {
        res.status(400).json({
          error: "Invalid angle. Must be 90, 180, or 270",
          code: "INVALID_ANGLE",
          timestamp: new Date().toISOString(),
        })
        return
      }

      const handler = this.createHandler("rotate", "/images/rotate")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { angle },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", `image/${result.format}`)
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private async handleFilter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const filter = req.body.filter
      if (!["blur", "sharpen", "grayscale"].includes(filter)) {
        res.status(400).json({
          error: "Invalid filter. Must be blur, sharpen, or grayscale",
          code: "INVALID_FILTER",
          timestamp: new Date().toISOString(),
        })
        return
      }

      const handler = this.createHandler("filter", "/images/filter")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { filter },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", `image/${result.format}`)
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private async handlePipeline(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided", code: "NO_FILE", timestamp: new Date().toISOString() })
        return
      }

      const operations = JSON.parse(req.body.operations || "[]")
      if (!Array.isArray(operations) || operations.length === 0) {
        res.status(400).json({
          error: "Operations array is required",
          code: "INVALID_PIPELINE",
          timestamp: new Date().toISOString(),
        })
        return
      }

      const handler = this.createHandler("pipeline", "/images/pipeline")
      const imageRequest: ImageRequest = {
        file: req.file,
        token: this.extractToken(req),
        params: { operations },
      }

      const result = await handler.handle(imageRequest)

      res.setHeader("Content-Type", "image/jpeg")
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  private handleError(error: unknown, res: Response): void {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("token")) {
      res.status(401).json({ error: errorMessage, code: "AUTH_ERROR", timestamp: new Date().toISOString() })
    } else if (errorMessage.includes("Unsupported") || errorMessage.includes("format")) {
      res.status(415).json({ error: errorMessage, code: "UNSUPPORTED_FORMAT", timestamp: new Date().toISOString() })
    } else if (errorMessage.includes("File too large")) {
      res.status(413).json({ error: errorMessage, code: "FILE_TOO_LARGE", timestamp: new Date().toISOString() })
    } else {
      res.status(500).json({ error: errorMessage, code: "INTERNAL_ERROR", timestamp: new Date().toISOString() })
    }
  }

  getRouter(): Router {
    return this.router
  }
}
