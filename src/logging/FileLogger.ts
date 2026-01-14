import type { ILogger } from "./ILogger"
import type { LogEntry } from "../types"
import * as fs from "fs/promises"
import * as path from "path"

/**
 * Implementación de logger que guarda los registros en un archivo local
 */
export class FileLogger implements ILogger {
  private logFilePath: string

  constructor(logFilePath = "logs/app.log") {
    this.logFilePath = logFilePath
  }

  /**
   * Escribe una entrada de log en el archivo especificado
   */
  async log(entry: LogEntry): Promise<void> {
    try {
      // Asegurar que el directorio de logs exista
      const logsDir = path.dirname(this.logFilePath)
      await fs.mkdir(logsDir, { recursive: true })

      // Formatear la entrada como una línea JSON
      const line = JSON.stringify(entry) + "\n"

      // Añadir la línea al final del archivo
      await fs.appendFile(this.logFilePath, line, "utf-8")
    } catch (error) {
      console.error("Error writing to log file:", error)
    }
  }
}
