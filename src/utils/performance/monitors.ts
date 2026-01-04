import { logger } from "@/utils/logger/logger";
import { APP_CONFIG } from "@/config/app";
import { MetricsRecorder } from "./metrics-recorder";

export class PerformanceMonitors {
  private recorder = new MetricsRecorder();
  private observers: PerformanceObserver[] = [];

  constructor(recorder: MetricsRecorder) {
    this.recorder = recorder;
  }

  monitorPaintTiming(): void {
    try {
      const paintEntries = performance.getEntriesByType("paint");
      paintEntries.forEach((entry) => {
        this.recorder.recordMetric({
          name: entry.name,
          value: Math.round(entry.startTime),
          unit: "ms",
        });
      });
    } catch (error) {
      logger.debug("Failed to monitor paint timing", error);
    }
  }

  monitorLCP(): void {
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

          this.recorder.recordMetric({
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

  monitorFID(): void {
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

            this.recorder.recordMetric({
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

  monitorCLS(): void {
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

              this.recorder.recordMetric({
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

  monitorLongTasks(): void {
    try {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > APP_CONFIG.LONG_TASK_THRESHOLD) {
              this.recorder.recordMetric({
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

  logNavigationTiming(): void {
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
            this.recorder.recordMetric({
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

  /**
   * Dispose all observers
   */
  dispose(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}
