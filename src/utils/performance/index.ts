import { APP_CONFIG } from "@/config/app";
import { MetricsRecorder } from "./metrics-recorder";
import { PerformanceMonitors } from "./monitors";
import { TimingMeasurement } from "./timing-measurement";

export class PerformanceMonitor {
  private metricsRecorder: MetricsRecorder;
  private monitors: PerformanceMonitors;
  private timingMeasurement: TimingMeasurement;

  constructor() {
    this.metricsRecorder = new MetricsRecorder();
    this.monitors = new PerformanceMonitors(this.metricsRecorder);
    this.timingMeasurement = new TimingMeasurement();
  }

  init(): void {
    if (!APP_CONFIG.ENABLE_PERFORMANCE_MONITORING) return;
    this.monitors.monitorPaintTiming();
    this.monitors.monitorLCP();
    this.monitors.monitorFID();
    this.monitors.monitorCLS();
    this.monitors.monitorLongTasks();
    this.monitors.logNavigationTiming();
  }

  recordMetric(
    metric: Parameters<typeof this.metricsRecorder.recordMetric>[0]
  ): void {
    this.metricsRecorder.recordMetric(metric);
  }

  getMetrics() {
    return this.metricsRecorder.getMetrics();
  }

  clearMetrics(): void {
    this.metricsRecorder.clearMetrics();
  }

  markTiming(name: string): void {
    this.timingMeasurement.markTiming(name);
  }

  measureTiming(name: string): number | null {
    return this.timingMeasurement.measureTiming(name);
  }

  dispose(): void {
    this.monitors.dispose();
  }
}

export const performanceMonitor = new PerformanceMonitor();

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }
}
