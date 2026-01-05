import mongoose from "mongoose"

export class DatabaseConfig {
  private mongoUri: string

  constructor(mongoUri: string) {
    this.mongoUri = mongoUri
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.mongoUri)
      console.log("✅ MongoDB connected successfully")
    } catch (error) {
      console.error("❌ MongoDB connection error:", error)
      process.exit(1)
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect()
    console.log("MongoDB disconnected")
  }
}
