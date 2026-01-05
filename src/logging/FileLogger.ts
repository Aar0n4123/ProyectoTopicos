import type { ILogger } from "./ILogger"
import type { LogEntry } from "../types"
import * as fs from "fs/promises"
import * as path from "path"

export class FileLogger implements ILogger {
  private logFilePath: string

  constructor(logFilePath = "logs/app.log") {
    this.logFilePath = logFilePath
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(this.logFilePath)
      await fs.mkdir(logsDir, { recursive: true })

      // Format as JSON Line
      const line = JSON.stringify(entry) + "\n"

      // Append to file
      await fs.appendFile(this.logFilePath, line, "utf-8")
    } catch (error) {
      console.error("Error writing to log file:", error)
    }
  }
}
