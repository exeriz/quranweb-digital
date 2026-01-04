import { logger } from "@/utils/logger";

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if (import.meta.env.DEV || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {
          scope: "/",
        }
      );

      logger.info("Service Worker registered successfully");

      setInterval(() => {
        this.registration?.update().catch(() => {
          logger.warn("Service Worker update check failed");
        });
      }, 60 * 60 * 1000);
    } catch (error) {
      logger.error("Failed to register Service Worker", error);
    }
  }

  async unregister(): Promise<void> {
    try {
      if (this.registration) {
        await this.registration.unregister();
        logger.info("Service Worker unregistered");
      }
    } catch (error) {
      logger.error("Failed to unregister Service Worker", error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      if (this.registration?.active) {
        this.registration.active.postMessage({ type: "CLEAR_CACHE" });
        logger.info("Cache cleared via Service Worker");
      }
    } catch (error) {
      logger.error("Failed to clear cache", error);
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onlineStatusListener(callback: (isOnline: boolean) => void): void {
    window.addEventListener("online", () => callback(true));
    window.addEventListener("offline", () => callback(false));
  }

  getStatus(): {
    registered: boolean;
    active: boolean;
    online: boolean;
  } {
    return {
      registered: !!this.registration,
      active: !!this.registration?.active,
      online: this.isOnline(),
    };
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

if (typeof window !== "undefined") {
  serviceWorkerManager.register().catch(() => {
    logger.warn("Service Worker registration failed");
  });
}
