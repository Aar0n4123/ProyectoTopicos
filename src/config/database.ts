import mongoose from "mongoose"

/**
 * Clase para manejar la conexión a la base de datos MongoDB
 */
export class DatabaseConfig {
  private mongoUri: string

  constructor(mongoUri: string) {
    this.mongoUri = mongoUri
  }

  /**
   * Establece la conexión con MongoDB
   */
  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.mongoUri)
      console.log("✅ MongoDB connected successfully")
    } catch (error) {
      console.error("❌ MongoDB connection error:", error)
      process.exit(1)
    }
  }

  /**
   * Cierra la conexión con la base de datos
   */
  async disconnect(): Promise<void> {
    await mongoose.disconnect()
    console.log("MongoDB disconnected")
  }
}
