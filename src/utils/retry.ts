export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    if (typeof error !== "object" || error === null || !("response" in error)) {
      return true;
    }
    const response = (error as Record<string, unknown>).response;
    if (
      typeof response !== "object" ||
      response === null ||
      !("status" in response)
    ) {
      return true;
    }
    const status = (response as Record<string, unknown>).status;
    return (
      (typeof status === "number" &&
        (status >= 500 || status === 408 || status === 429)) ||
      false
    ); // Server errors, timeout, rate limit
  },
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === mergedConfig.maxRetries) {
        break;
      }

      if (!mergedConfig.shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        mergedConfig.initialDelay *
          Math.pow(mergedConfig.backoffMultiplier, attempt),
        mergedConfig.maxDelay
      );

      const jitter = delay * 0.1 * Math.random();
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
