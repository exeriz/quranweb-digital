export type LogLevelType = "DEBUG" | "INFO" | "WARN" | "ERROR";

export const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
} as const;

export interface LogEntry {
  timestamp: string;
  level: LogLevelType;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}
