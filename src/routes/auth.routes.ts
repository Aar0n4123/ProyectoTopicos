import { Router, type Request, type Response } from "express"
import type { AuthService } from "../services/AuthService"
import type { RegisterRequest, LoginRequest, AuthApiResponse } from "../types"

/**
 * Clase que define las rutas relacionadas con la autenticación de usuarios
 */
export class AuthRoutes {
  private router: Router
  private authService: AuthService

  constructor(authService: AuthService) {
    this.router = Router()
    this.authService = authService
    this.setupRoutes()
  }

  /**
   * Inicializa los endpoints de autenticación
   */
  private setupRoutes(): void {
    this.router.post("/register", this.register.bind(this))
    this.router.post("/login", this.login.bind(this))
    // Se pueden añadir más rutas adicionales aquí
  }

  /**
   * Endpoint para registrar un nuevo usuario
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as RegisterRequest

      // Validación básica de campos requeridos
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
          timestamp: new Date(),
        } as AuthApiResponse)
        return
      }

      const result = await this.authService.register({ email, password })

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      } as AuthApiResponse)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      res.status(400).json({
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      } as AuthApiResponse)
    }
  }

  /**
   * Endpoint para iniciar sesión
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest

      // Validación básica de campos requeridos
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
          timestamp: new Date(),
        } as AuthApiResponse)
        return
      }

      const result = await this.authService.login({ email, password })

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      } as AuthApiResponse)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      res.status(401).json({
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      } as AuthApiResponse)
    }
  }

  /**
   * Retorna el router configurado
   */
  getRouter(): Router {
    return this.router
  }
}
