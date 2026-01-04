export function sanitizeHTML(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

export function escapeHTML(text: unknown): string {
  if (typeof text !== "string") {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

export function sanitizeURL(url: unknown): string {
  if (typeof url !== "string") {
    return "";
  }

  try {
    const parsedURL = new URL(url);
    if (!["http:", "https:"].includes(parsedURL.protocol)) {
      return "";
    }
    return parsedURL.toString();
  } catch {
    return "";
  }
}

export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(windowMs: number = 60000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    const recentAttempts = attempts.filter(
      (time) => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  clear(): void {
    this.attempts.clear();
  }
}

export function generateCSRFToken(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function validateJWT(token: unknown): boolean {
  if (typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
      atob(padded);
    });
    return true;
  } catch {
    return false;
  }
}

export function initializeSecurityMonitoring(): void {
  if (process.env.NODE_ENV === "development") {
    const cspHeader = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );

    if (!cspHeader) {
      console.warn(
        "[Security] Content-Security-Policy meta tag not found. Consider adding CSP for XSS protection."
      );
    }

    console.info(
      "[Security] Security utilities initialized in development mode"
    );
  }
}

initializeSecurityMonitoring();
