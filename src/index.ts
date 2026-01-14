import express, { type Express } from "express"
import dotenv from "dotenv"
import { DatabaseConfig } from "./config/database"
import { AuthService } from "./services/AuthService"
import { FileLogger } from "./logging/FileLogger"
import { MongoLogger } from "./logging/MongoLogger"
import { CompositeLogger } from "./logging/CompositeLogger"
import { AuthRoutes, ImageRoutes } from "./routes"
import {ILogger} from "./logging/ILogger";

// Load environment variables from .env.example
dotenv.config({ path: ".env.example" })

class Application {
  private app: Express
  private port: number
  private database: DatabaseConfig

  constructor() {
    this.app = express()
    this.port = Number.parseInt(process.env.PORT || "3000")
    // Usamos la URI de Atlas configurada en el .env.example
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

    // --- CONFIGURACIÓN DE LOGGING DINÁMICA ---
    const loggerType = process.env.LOGGER_TYPE || "dual"
    const fileLogger = new FileLogger("logs/app.log")
    const mongoLogger = new MongoLogger()

    let logger: ILogger

    switch (loggerType) {
      case "file":
        logger = fileLogger
        console.log("📝 Logging configurado: Solo Archivo")
        break
      case "mongo":
        logger = mongoLogger
        console.log("🍃 Logging configurado: Solo MongoDB")
        break
      default:
        logger = new CompositeLogger([fileLogger, mongoLogger])
        console.log("⚖️ Logging configurado: Dual (Archivo + MongoDB)")
    }
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
      // 1. Conectar a la base de datos PRIMERO
      await this.database.connect()

      // 2. Configurar el resto de la app
      this.setupMiddleware()
      this.setupRoutes()
      this.setupErrorHandling()

      // 3. Iniciar servidor
      this.app.listen(this.port, () => {
        console.log(`
  🚀 Image Manipulation API iniciada correctamente
  📡 Conectado a MongoDB Atlas
  💻 Servidor en http://localhost:${this.port}
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