import type { ILogger } from "./ILogger"
import type { LogEntry } from "../types"

export class CompositeLogger implements ILogger {
  private loggers: ILogger[]

  constructor(loggers: ILogger[]) {
    this.loggers = loggers
  }

  async log(entry: LogEntry): Promise<void> {
    await Promise.all(
      this.loggers.map(async (logger) => {
        try {
          await logger.log(entry)
        } catch (err) {
          console.error("CompositeLogger child error:", err)
        }
      }),
    )
  }
}
