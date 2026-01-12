import mongoose from "mongoose"
import type { ILogger } from "./ILogger"
import type { LogEntry } from "../types"

export class MongoLogger implements ILogger {
  private collectionName: string

  constructor(collectionName = "logs") {
    this.collectionName = collectionName
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      const db = mongoose.connection && (mongoose.connection.db as any)
      if (!db) {
        throw new Error("MongoDB not connected")
      }

      await db.collection(this.collectionName).insertOne(entry)
    } catch (error) {
      console.error("Error writing log to MongoDB:", error)
    }
  }
}
