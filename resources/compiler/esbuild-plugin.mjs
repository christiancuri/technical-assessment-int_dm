import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import stripComments from "strip-comments";
import ts from "typescript";

const theFinder = new RegExp(
  /((?<![(\s]\s*['"])@\w*[\w\d]\s*(?![;])[((?=\s)])/,
);

const findDecorators = (fileContent) =>
  theFinder.test(stripComments(fileContent));

export const esbuildPluginTsc = ({
  tsConfigPath = path.join(process.cwd(), "./tsconfig.json"),
} = {}) => ({
  name: "tsc",
  setup(build) {
    const parsedTsConfig = getTSConfig(tsConfigPath);

    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      if (
        !parsedTsConfig ||
        !parsedTsConfig.options ||
        !parsedTsConfig.options.emitDecoratorMetadata
      )
        return;

      const tsContent = await fs.readFile(args.path, "utf8");

      const hasDecorator = findDecorators(tsContent);
      if (!hasDecorator) return;

      const program = ts.transpileModule(tsContent, parsedTsConfig.raw);
      return { contents: program.outputText };
    });
  },
});

function getTSConfig(configFilePath = "tsconfig.json") {
  const cwd = process.cwd();

  const configFile = ts.findConfigFile(cwd, ts.sys.fileExists, configFilePath);
  if (!configFile)
    throw new Error(`tsconfig.json not found on directory ${cwd}`);

  const configContent = ts.readConfigFile(configFile, ts.sys.readFile);
  const tsConfig = ts.parseJsonConfigFileContent(
    configContent.config,
    ts.sys,
    cwd,
  );
  return tsConfig;
}

export default esbuildPluginTsc;
