export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
