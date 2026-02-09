import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

const reportMetric = (metric: Metric) => {
  if (import.meta.env.DEV) {
    console.info(`[Web Vitals] ${metric.name}:`, metric.value);
  }

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      non_interaction: true,
    });
  }
};

export const reportWebVitals = () => {
  if (typeof Array.prototype.at !== "function") {
    return;
  }

  onCLS(reportMetric);
  onINP(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
