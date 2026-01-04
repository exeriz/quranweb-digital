import { logger } from "@/utils/logger";

export class TimingMeasurement {
  markTiming(name: string): void {
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      logger.debug("Failed to mark timing", error);
    }
  }

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
}
