import type { LogEntry } from "../types"

export interface ILogger {
  log(entry: LogEntry): Promise<void>
}
