import { logger } from "./logger";

export function handleErrorBoundary(
  error: Error,
  errorInfo: React.ErrorInfo
): void {
  logger.error("React Error Boundary caught error", error, {
    componentStack: errorInfo.componentStack,
  });
}
