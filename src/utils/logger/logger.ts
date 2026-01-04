import { LogLevel, type LogLevelType, type LogEntry } from "./types";

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;
  private isDevelopment: boolean = import.meta.env.DEV;

  log(
    level: LogLevelType,
    message: string,
    data?: Record<string, unknown>,
    stack?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(`%c[${entry.timestamp}] ${level}:`, style, message, data);
      if (stack) {
        console.log(stack);
      }
    } else {
      if (level === LogLevel.ERROR) {
        console.error(`[${entry.timestamp}] ${level}:`, message, data);
      }
    }
  }

  debug(message: string, data?: Record<string, unknown> | unknown): void {
    const normalizedData =
      typeof data === "object"
        ? (data as Record<string, unknown>)
        : { value: data };
    this.log(LogLevel.DEBUG, message, normalizedData);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(
    message: string,
    error?: Error | string | unknown,
    data?: Record<string, unknown>
  ): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
        ? String((error as Record<string, unknown>).message)
        : message;
    this.log(LogLevel.ERROR, `${message}: ${errorMsg}`, data, stack);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private getConsoleStyle(level: LogLevelType): string {
    const styles: Record<LogLevelType, string> = {
      DEBUG: "color: #888; font-weight: bold;",
      INFO: "color: #2196F3; font-weight: bold;",
      WARN: "color: #FF9800; font-weight: bold;",
      ERROR: "color: #F44336; font-weight: bold;",
    };
    return styles[level];
  }
}

export const logger = new Logger();
