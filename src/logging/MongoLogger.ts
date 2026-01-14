import mongoose from "mongoose"
import type { ILogger } from "./ILogger"
import type { LogEntry } from "../types"

/**
 * Implementación de logger que guarda los registros en una colección de MongoDB
 */
export class MongoLogger implements ILogger {
  private collectionName: string

  constructor(collectionName = "logs") {
    this.collectionName = collectionName
  }

  /**
   * Inserta una entrada de log en la base de datos
   */
  async log(entry: LogEntry): Promise<void> {
    try {
      // Obtener la conexión activa de mongoose
      const db = mongoose.connection && (mongoose.connection.db as any)
      if (!db) {
        throw new Error("MongoDB not connected")
      }

      // Insertar el documento en la colección de logs
      await db.collection(this.collectionName).insertOne(entry)
    } catch (error) {
      console.error("Error writing log to MongoDB:", error)
    }
  }
}
