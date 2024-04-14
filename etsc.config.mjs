import { rimraf } from "rimraf";

import { esbuildPluginTsc } from "./resources/compiler/esbuild-plugin.mjs";

export default {
  tsConfigFile: "./tsconfig.json",
  esbuild: {
    minify: false,
    target: "es2022",
    plugins: [esbuildPluginTsc()],
    format: "esm",
  },
  prebuild: async () => {
    await rimraf("./dist");
  },
};
