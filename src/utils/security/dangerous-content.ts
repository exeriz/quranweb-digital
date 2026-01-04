export function containsDangerousContent(input: unknown): boolean {
  if (typeof input !== "string") {
    return false;
  }

  const lowerInput = input.toLowerCase();
  const dangerousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^\s>]*/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(lowerInput));
}
