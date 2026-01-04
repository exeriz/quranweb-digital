export class APIError extends Error {
  statusCode?: number;
  code?: string;
  originalError?: Error | null | unknown;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    originalError?: Error | null | unknown
  ) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.code = code;
    this.originalError = originalError instanceof Error ? originalError : null;
  }
}

export class ValidationError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CacheError";
  }
}
