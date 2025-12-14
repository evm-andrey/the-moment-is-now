import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

function inlineBuiltCss(): Plugin {
  return {
    name: "inline-built-css",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const bundle = ctx?.bundle;
      if (!bundle) return html;

      const cssHrefs: string[] = [];
      html.replace(
        /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
        (_match, href) => {
          cssHrefs.push(href);
          return _match;
        },
      );

      if (cssHrefs.length === 0) return html;

      let css = "";
      for (const href of cssHrefs) {
        const fileName = href.startsWith("/") ? href.slice(1) : href;
        const item = bundle[fileName];
        if (item?.type === "asset" && typeof item.source === "string") {
          css += `${item.source}\n`;
          delete bundle[fileName];
        }
      }

      if (!css) return html;

      const withoutCssLinks = html.replace(
        /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>\s*/g,
        (_match, href) => (cssHrefs.includes(href) ? "" : _match),
      );

      let updated = withoutCssLinks.replace("</head>", `<style>${css}</style></head>`);

      // Preload the entry module script to reduce render-blocking gaps on slower networks.
      const moduleScriptMatch = updated.match(/<script\b[^>]*type="module"[^>]*src="([^"]+\.js)"[^>]*><\/script>/);
      if (moduleScriptMatch) {
        const entrySrc = moduleScriptMatch[1];
        const preloadTag = `<link rel="modulepreload" href="${entrySrc}">`;
        if (!updated.includes(preloadTag)) {
          updated = updated.replace(moduleScriptMatch[0], `${preloadTag}\n${moduleScriptMatch[0]}`);
        }
      }

      return updated;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), inlineBuiltCss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
