import { Router, type Request, type Response } from "express"
import type { AuthService } from "../services/AuthService"
import type { RegisterRequest, LoginRequest, AuthApiResponse } from "../types"

export class AuthRoutes {
  private router: Router
  private authService: AuthService

  constructor(authService: AuthService) {
    this.router = Router()
    this.authService = authService
    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.router.post("/register", this.register.bind(this))
    this.router.post("/login", this.login.bind(this))
    // Additional routes can be added here
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as RegisterRequest

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

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest

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

  getRouter(): Router {
    return this.router
  }
}
