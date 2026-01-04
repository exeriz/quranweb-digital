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

export function isValidSurahNumber(surahNumber: number): boolean {
  return validateSurahNumber(surahNumber);
}
