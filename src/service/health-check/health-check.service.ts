import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pack = JSON.parse(
  await fs.readFile(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../package.json",
    ),
    "utf-8",
  ),
);

export async function health() {
  return `${pack.version} ok`;
}

export * as HealthCheckService from "./health-check.service.js";
