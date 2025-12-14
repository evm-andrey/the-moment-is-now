import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensureNavStartMark, perfMark, perfMeasure, startPerfLogging } from "./perf";

startPerfLogging();
ensureNavStartMark();
perfMark("app:start");
perfMeasure("nav:to-app-start", "nav:start", "app:start");

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(<App />);

perfMark("app:render:commit");
perfMeasure("app:startup", "app:start", "app:render:commit");
perfMeasure("nav:to-app-render-call", "nav:start", "app:render:commit");

requestAnimationFrame(() => {
  perfMark("app:first-frame");
  perfMeasure("app:time-to-first-frame", "app:start", "app:first-frame");
  perfMeasure("nav:to-first-frame", "nav:start", "app:first-frame");
});
