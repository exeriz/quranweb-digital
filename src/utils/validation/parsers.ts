import { validateSurahNumber } from "./quran";

export function parseSurahId(id: string | undefined): number | null {
  if (!id) return null;

  const parsed = parseInt(id, 10);
  if (validateSurahNumber(parsed)) {
    return parsed;
  }

  return null;
}

export function parseNumber(
  value: string | undefined,
  min?: number,
  max?: number
): number | null {
  if (!value) return null;

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return null;
  }

  if (min !== undefined && parsed < min) {
    return null;
  }

  if (max !== undefined && parsed > max) {
    return null;
  }

  return parsed;
}

export function parseAyahId(id: string | undefined): number | null {
  return parseNumber(id, 1);
}

export function parseJSON<T = unknown>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}
