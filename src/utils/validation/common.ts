import { ValidationError } from "@/utils/logger";

export function assertValid<T>(
  value: unknown,
  message: string,
  field?: string
): asserts value is T {
  if (!value) {
    throw new ValidationError(message, field);
  }
}

export function validateObject<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<string, (value: unknown) => boolean>
): obj is T {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const objAsRecord = obj as Record<string, unknown>;

  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(objAsRecord[key])) {
      return false;
    }
  }

  return true;
}

export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}
