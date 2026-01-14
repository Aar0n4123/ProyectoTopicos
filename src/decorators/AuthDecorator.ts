import type { IImageHandler } from "../handlers/ImageHandler"
import type { ImageRequest, ImageResponse } from "../types"
import type { AuthService } from "../services/AuthService"

/**
 * Decorador encargado de la validación de tokens JWT antes de permitir operaciones
 */
export class AuthDecorator implements IImageHandler {
  constructor(
    private inner: IImageHandler,
    private authService: AuthService,
  ) {}

  /**
   * Verifica la autenticación y adjunta la información del usuario a la petición
   */
  async handle(request: ImageRequest): Promise<ImageResponse> {
    // Verificar la presencia del token en la petición
    if (!request.token) {
      throw new Error("Authentication token required")
    }

    // Validar el token y obtener los datos del usuario (Payload)
    const payload = this.authService.verifyToken(request.token)

    // Adjuntar la información del usuario identificado a la petición
    request.user = payload

    // Delegar la ejecución al siguiente manejador en la cadena
    return await this.inner.handle(request)
  }
}
