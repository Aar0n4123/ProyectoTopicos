import express, { type Express } from "express"
import dotenv from "dotenv"
import { DatabaseConfig } from "./config/database"
import { AuthService } from "./services/AuthService"
import { FileLogger } from "./logging/FileLogger"
import { AuthRoutes, ImageRoutes } from "./routes"

// Load environment variables
dotenv.config()

class Application {
  private app: Express
  private port: number
  private database: DatabaseConfig

  constructor() {
    this.app = express()
    this.port = Number.parseInt(process.env.PORT || "3000")
    this.database = new DatabaseConfig(process.env.MONGODB_URI || "mongodb://localhost:27017/image_manipulation_db")
  }

  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private setupRoutes(): void {
    // Initialize services
    const jwtSecret = process.env.JWT_SECRET || "your_super_secret_jwt_key"
    const authService = new AuthService(jwtSecret, process.env.JWT_EXPIRES_IN)

    // Initialize loggers (FileLogger + MongoLogger)
    const logger = new FileLogger("logs/app.log")

    // Setup routes
    const authRoutes = new AuthRoutes(authService)
    const imageRoutes = new ImageRoutes(authService, logger)

    this.app.use("/auth", authRoutes.getRouter())
    this.app.use("/images", imageRoutes.getRouter())

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() })
    })
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("Unhandled error:", err)
      res.status(500).json({
        error: err.message || "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      })
    })
  }

  async start(): Promise<void> {
    try {
      // Connect to database
      await this.database.connect()

      // Setup middleware and routes
      this.setupMiddleware()
      this.setupRoutes()
      this.setupErrorHandling()

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 Image Manipulation API                                ║
║  📡 Server running on http://localhost:${this.port}           ║
║  📚 Endpoints:                                            ║
║     POST /auth/register                                   ║
║     POST /auth/login                                      ║
║     POST /images/resize                                   ║
║     POST /images/crop                                     ║
║     POST /images/format                                   ║
║     POST /images/rotate                                   ║
║     POST /images/filter                                   ║
║     POST /images/pipeline                                 ║
║  🏥 Health: GET /health                                   ║
╚═══════════════════════════════════════════════════════════╝
        `)
      })
    } catch (error) {
      console.error("Failed to start application:", error)
      process.exit(1)
    }
  }
}

// Start the application
const app = new Application()
app.start()
