import { defineConfig } from "vitest/config";
import defaultConfig from "./vitest.config";

export default defineConfig({
  ...defaultConfig,
  test: {
    setupFiles: ["./vitest.setup.ts"],
  },
});
