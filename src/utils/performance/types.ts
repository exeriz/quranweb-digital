export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  rating?: "good" | "needsImprovement" | "poor";
}
