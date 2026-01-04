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
