import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["test/**/*.test.ts"],
      exclude: ["test/**/*.local.test.ts"],
      name: "node",
      environment: "node",
    },
  },
  {
    extends: "./vitest.local.config.ts",
    test: {
      include: ["test/**/*.local.test.ts"],
      name: "local",
      environment: "node",
    },
  },
]);
