import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { perfMark, perfMeasure, startPerfLogging } from "./perf";

startPerfLogging();
perfMark("app:start");

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(<App />);

perfMark("app:render:commit");
perfMeasure("app:startup", "app:start", "app:render:commit");

requestAnimationFrame(() => {
  perfMark("app:first-frame");
  perfMeasure("app:time-to-first-frame", "app:start", "app:first-frame");
});
