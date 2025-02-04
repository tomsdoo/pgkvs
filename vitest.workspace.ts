import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["__test__/**/*.test.ts"],
      exclude: ["__test__/**/*.local.test.ts"],
      name: "node",
      environment: "node",
    },
  },
  {
    extends: "./vitest.local.config.ts",
    test: {
      include: ["__test__/**/*.local.test.ts"],
      name: "local",
      environment: "node",
    },
  },
]);
