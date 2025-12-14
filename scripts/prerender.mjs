import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const distDir = path.resolve(rootDir, "dist");
const serverEntry = path.resolve(distDir, "server", "entry-server.js");

const indexPath = path.resolve(distDir, "index.html");
let html = await fs.readFile(indexPath, "utf8");

const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = typeof render === "function" ? await render() : "";

html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

await fs.writeFile(indexPath, html, "utf8");
console.log("[prerender] wrote dist/index.html");

