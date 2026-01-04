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
