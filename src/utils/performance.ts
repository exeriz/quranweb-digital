import { logger } from "@/utils/logger";
import { APP_CONFIG } from "@/config/app";

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  rating?: "good" | "needsImprovement" | "poor";
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  init(): void {
    if (!APP_CONFIG.ENABLE_PERFORMANCE_MONITORING) return;
    this.monitorPaintTiming();
    this.monitorLCP();
    this.monitorFID();
    this.monitorCLS();
    this.monitorLongTasks();
    this.logNavigationTiming();
  }

  private monitorPaintTiming(): void {
    try {
      const paintEntries = performance.getEntriesByType("paint");
      paintEntries.forEach((entry) => {
        this.recordMetric({
          name: entry.name,
          value: Math.round(entry.startTime),
          unit: "ms",
        });
      });
    } catch (error) {
      logger.debug("Failed to monitor paint timing", error);
    }
  }

  private monitorLCP(): void {
    try {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          const rating =
            lastEntry.startTime < APP_CONFIG.LCP_THRESHOLD
              ? "good"
              : lastEntry.startTime < APP_CONFIG.LCP_THRESHOLD * 1.5
              ? "needsImprovement"
              : "poor";

          this.recordMetric({
            name: "LCP",
            value: Math.round(lastEntry.startTime),
            unit: "ms",
            rating,
          });
        });

        observer.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.push(observer);
      }
    } catch (error) {
      logger.debug("Failed to monitor LCP", error);
    }
  }

  private monitorFID(): void {
    try {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: unknown) => {
            if (
              typeof entry !== "object" ||
              entry === null ||
              !("processingDuration" in entry)
            ) {
              return;
            }
            const fid = (entry as Record<string, unknown>)
              .processingDuration as number;
            const rating =
              fid < APP_CONFIG.FID_THRESHOLD
                ? "good"
                : fid < APP_CONFIG.FID_THRESHOLD * 1.5
                ? "needsImprovement"
                : "poor";

            this.recordMetric({
              name: "FID",
              value: Math.round(fid),
              unit: "ms",
              rating,
            });
          });
        });

        observer.observe({ entryTypes: ["first-input"] });
        this.observers.push(observer);
      }
    } catch (error) {
      logger.debug("Failed to monitor FID", error);
    }
  }

  private monitorCLS(): void {
    try {
      if ("PerformanceObserver" in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: unknown) => {
            if (
              typeof entry !== "object" ||
              entry === null ||
              !("value" in entry) ||
              !("hadRecentInput" in entry)
            ) {
              return;
            }
            const entryObj = entry as Record<string, unknown>;
            if (!(entryObj.hadRecentInput as boolean)) {
              clsValue += entryObj.value as number;

              const rating =
                clsValue < APP_CONFIG.CLS_THRESHOLD
                  ? "good"
                  : clsValue < APP_CONFIG.CLS_THRESHOLD * 1.5
                  ? "needsImprovement"
                  : "poor";

              this.recordMetric({
                name: "CLS",
                value: parseFloat(clsValue.toFixed(3)),
                unit: "score",
                rating,
              });
            }
          });
        });

        observer.observe({ entryTypes: ["layout-shift"] });
        this.observers.push(observer);
      }
    } catch (error) {
      logger.debug("Failed to monitor CLS", error);
    }
  }

  private monitorLongTasks(): void {
    try {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > APP_CONFIG.LONG_TASK_THRESHOLD) {
              this.recordMetric({
                name: "Long Task",
                value: Math.round(entry.duration),
                unit: "ms",
                rating: "poor",
              });

              logger.warn("Long task detected", {
                name: entry.name,
                duration: entry.duration,
              });
            }
          });
        });

        observer.observe({ entryTypes: ["longtask"] });
        this.observers.push(observer);
      }
    } catch (error) {
      logger.debug("Failed to monitor long tasks", error);
    }
  }

  private logNavigationTiming(): void {
    try {
      if (performance.timing) {
        const timing = performance.timing;
        const navigationStart = timing.navigationStart;

        const metrics = {
          "DNS Lookup": timing.domainLookupEnd - timing.domainLookupStart,
          "TCP Connection": timing.connectEnd - timing.connectStart,
          "Request Time": timing.responseStart - timing.requestStart,
          "Response Time": timing.responseEnd - timing.responseStart,
          "DOM Interactive": timing.domInteractive - navigationStart,
          "DOM Complete": timing.domComplete - navigationStart,
          "Load Complete": timing.loadEventEnd - navigationStart,
        };

        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            this.recordMetric({
              name,
              value: Math.round(value),
              unit: "ms",
            });
          }
        });
      }
    } catch (error) {
      logger.debug("Failed to log navigation timing", error);
    }
  }

  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Log ke console di development
    if (import.meta.env.DEV) {
      console.log(
        `%c[${metric.name}] ${metric.value}${metric.unit}`,
        "color: #4CAF50; font-weight: bold;"
      );
    }

    // Send to analytics jika enabled
    if (APP_CONFIG.ENABLE_ANALYTICS && import.meta.env.PROD) {
      this.sendToAnalytics(fullMetric);
    }
  }

  /**
   * Mark custom timing
   */
  markTiming(name: string): void {
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      logger.debug("Failed to mark timing", error);
    }
  }

  /**
   * Measure timing between marks
   */
  measureTiming(name: string): number | null {
    try {
      const markName = `${name}-start`;
      const existingMark = performance.getEntriesByName(markName);

      if (existingMark.length > 0) {
        performance.measure(name, markName);
        const measure = performance.getEntriesByName(name)[0];
        return Math.round(measure.duration);
      }
    } catch (error) {
      logger.debug("Failed to measure timing", error);
    }
    return null;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // TODO: Implement analytics integration
    // Example: send to Google Analytics, Datadog, etc.
    if (import.meta.env.DEV) {
      logger.debug("Would send to analytics:", metric);
    }
  }

  /**
   * Dispose observers
   */
  dispose(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-init on module load
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }
}
