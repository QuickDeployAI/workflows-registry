import { defineConfig } from "vitest/config";
import { workflow } from "@workflow/vitest";

export default defineConfig({
  plugins: [workflow()],
  test: {
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
