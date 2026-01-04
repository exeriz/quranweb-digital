import { logger } from "@/utils/logger";
import { type PerformanceMetric } from "./types";

export class MetricsRecorder {
  private metrics: PerformanceMetric[] = [];

  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    if (import.meta.env.DEV) {
      console.log(
        `%c[${metric.name}] ${metric.value}${metric.unit}`,
        "color: #4CAF50; font-weight: bold;"
      );
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  sendToAnalytics(metric: PerformanceMetric): void {
    if (import.meta.env.DEV) {
      logger.debug("Would send to analytics:", metric);
    }
  }
}
