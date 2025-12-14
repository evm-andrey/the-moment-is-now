const IS_DEV = import.meta.env.DEV;

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function perfMark(name: string, detail?: unknown) {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  try {
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

export function startPerfLogging() {
  if (!IS_DEV) return;
  if (typeof PerformanceObserver === "undefined") return;

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

  console.info(`[perf] logging enabled (t=${now().toFixed(0)}ms)`);
}
