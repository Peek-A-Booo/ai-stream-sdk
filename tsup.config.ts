import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  treeshake: true,
  splitting: true,
  entry: ["packages/core"],
  format: ["esm"],
  clean: true,
  dts: true,
  minify: true,
  // external: ["react"],
  ...options,
}));
