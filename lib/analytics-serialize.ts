import type { AnalyticsClientData } from "@/lib/analytics-dashboard-types";

/** Convert getAnalytics() result (with bigint / decimal-like values) to JSON-safe numbers for the client. */
export function serializeAnalyticsForClient(raw: unknown): AnalyticsClientData {
  return JSON.parse(
    JSON.stringify(raw, (_key, value) => {
      if (typeof value === "bigint") return Number(value);
      if (value != null && typeof value === "object" && typeof (value as { toString?: () => string }).toString === "function") {
        const s = (value as { toString: () => string }).toString();
        if (s !== "[object Object]" && /^-?\d/.test(s.trim())) {
          const n = Number(s);
          if (!Number.isNaN(n)) return n;
        }
      }
      return value;
    }),
  ) as AnalyticsClientData;
}
