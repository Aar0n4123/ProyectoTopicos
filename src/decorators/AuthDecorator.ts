import type { IImageHandler } from "../handlers/ImageHandler"
import type { ImageRequest, ImageResponse } from "../types"
import type { AuthService } from "../services/AuthService"

export class AuthDecorator implements IImageHandler {
  constructor(
    private inner: IImageHandler,
    private authService: AuthService,
  ) {}

  async handle(request: ImageRequest): Promise<ImageResponse> {
    // Verify token
    if (!request.token) {
      throw new Error("Authentication token required")
    }

    const payload = this.authService.verifyToken(request.token)

    // Attach user info to request
    request.user = payload

    // Call inner handler
    return await this.inner.handle(request)
  }
}
