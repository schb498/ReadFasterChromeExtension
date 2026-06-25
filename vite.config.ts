import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// The content script must be a single self-contained classic script — Chrome
// does not load ESM content scripts declared in the manifest. Building it in
// its own pass keeps Rollup from code-splitting the shared `boldText` module
// into a separate chunk (which would emit a bare `import` and fail to load).
// Run with `vite build --mode content` for that second pass.
export default defineConfig(({ mode }) => {
  const isContentBuild = mode === "content";

  const input: Record<string, string> = isContentBuild
    ? { content: "src/content.ts" }
    : { main: "index.html", background: "src/background.ts" };

  return {
    plugins: isContentBuild
      ? []
      : [
          react(),
          viteStaticCopy({
            targets: [{ src: "public/manifest.json", dest: "." }],
          }),
        ],
    build: {
      // Second pass must not wipe the popup/background output from the first.
      emptyOutDir: !isContentBuild,
      rollupOptions: {
        input,
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };
});
