const IS_DEV = import.meta.env.DEV;

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function supportsMarkStartTime(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (performance as any).mark("__tt_test__", { startTime: 0 });
    performance.clearMarks("__tt_test__");
    return true;
  } catch {
    return false;
  }
}

const CAN_MARK_WITH_START_TIME = typeof performance !== "undefined" && supportsMarkStartTime();

export function perfMark(name: string, detail?: unknown) {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  try {
    performance.mark(name, detail === undefined ? undefined : { detail });
  } catch {
    // ignore
  }
}

export function perfMarkAt(name: string, startTime: number, detail?: unknown) {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  try {
    if (CAN_MARK_WITH_START_TIME) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (performance as any).mark(name, detail === undefined ? { startTime } : { startTime, detail });
      return;
    }
    // Fallback: create the mark "now" (won't line up in the timeline, but at least exists).
    performance.mark(name, detail === undefined ? undefined : { detail });
  } catch {
    // ignore
  }
}

export function perfMeasure(name: string, startMark: string, endMark?: string) {
  if (typeof performance === "undefined" || typeof performance.measure !== "function") return;
  try {
    if (endMark) performance.measure(name, startMark, endMark);
    else performance.measure(name, startMark);
  } catch {
    // ignore
  }
}

export function ensureNavStartMark() {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;

  try {
    const existing = performance.getEntriesByName("nav:start", "mark");
    if (existing.length > 0) return;
  } catch {
    // ignore
  }

  // navigationStart is 0 in the PerformanceTimeline (relative to timeOrigin)
  perfMarkAt("nav:start", 0);
}

export function startPerfLogging() {
  if (!IS_DEV) return;
  if (typeof PerformanceObserver === "undefined") return;

  ensureNavStartMark();

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType !== "measure") continue;
        console.info(`[perf] ${entry.name}: ${entry.duration.toFixed(1)}ms`);
      }
    });
    observer.observe({ entryTypes: ["measure"] });
  } catch {
    // ignore
  }

  // Long Tasks: >50ms on the main thread (Chromium).
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType !== "longtask") continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = entry as any;
        const duration = typeof e.duration === "number" ? e.duration : 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attribution = Array.isArray((e as any).attribution) ? (e as any).attribution : [];
        const source = attribution[0]?.name ? ` source=${attribution[0].name}` : "";

        console.info(`[perf] longtask ${duration.toFixed(1)}ms at ${entry.startTime.toFixed(1)}ms${source}`);
      }
    });
    longTaskObserver.observe({ type: "longtask", buffered: true });
  } catch {
    // ignore
  }

  try {
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType !== "paint") continue;
        perfMarkAt(`paint:${entry.name}`, entry.startTime);
        perfMeasure(`nav:to-${entry.name}`, "nav:start", `paint:${entry.name}`);
      }
    });
    paintObserver.observe({ type: "paint", buffered: true });
  } catch {
    // ignore
  }

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      // "startTime" is when the element was rendered.
      perfMarkAt("paint:lcp", last.startTime);
      perfMeasure("nav:to-lcp", "nav:start", "paint:lcp");
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // ignore
  }

  try {
    let cls = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType !== "layout-shift") continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = entry as any;
        if (e.hadRecentInput) continue;
        cls += e.value ?? 0;
      }
      // One running number in logs is usually enough.
      console.info(`[perf] cls=${cls.toFixed(3)}`);
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // ignore
  }

  console.info(`[perf] logging enabled (t=${now().toFixed(0)}ms)`);
}
