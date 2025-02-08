import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/pgkvs.ts"],
  clean: true,
  dts: true,
  format: ["cjs","esm"],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
});
