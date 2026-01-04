export function sanitizeInput(input: string, maxLength: number = 200): string {
  return input.trim().replace(/[<>]/g, "").slice(0, maxLength);
}

export function stripHTMLTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function removeSpecialChars(
  input: string,
  allowedChars: RegExp = /[^a-zA-Z0-9\s\u0600-\u06FF]/g
): string {
  return input.replace(allowedChars, "");
}

export function sanitizeSearchQuery(query: string): string {
  return normalizeWhitespace(sanitizeInput(query, 100));
}
