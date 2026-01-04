export function validateSearchQuery(query: unknown): boolean {
  if (typeof query !== "string") {
    return false;
  }

  const trimmed = query.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

export function isSearchQueryLongEnough(
  query: string,
  minLength: number = 1
): boolean {
  return query.trim().length >= minLength;
}

export function isSearchQueryWithinLimit(
  query: string,
  maxLength: number = 100
): boolean {
  return query.trim().length <= maxLength;
}
