import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    // Default to node; component/hook tests opt into jsdom with a
    // `// @vitest-environment jsdom` pragma at the top of the file.
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "app/**/*.tsx"],
      exclude: ["lib/**/*.test.ts", "app/**/*.test.tsx", "**/*.d.ts"],
    },
  },
});
