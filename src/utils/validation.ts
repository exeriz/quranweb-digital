import { ValidationError } from "@/utils/logger";

export function validateSurahNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 114
  );
}

export function validateAyahNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

export function validateSearchQuery(query: string): boolean {
  if (typeof query !== "string") {
    return false;
  }
  const trimmed = query.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

export function parseSurahId(id: string | undefined): number | null {
  if (!id) return null;

  const parsed = parseInt(id, 10);
  if (validateSurahNumber(parsed)) {
    return parsed;
  }

  return null;
}

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

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "").slice(0, 200);
}
