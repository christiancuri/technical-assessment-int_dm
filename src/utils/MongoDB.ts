import mongoose from "mongoose";

import { MONGO_URI } from "../env.js";
import { createLogger } from "./logger.js";

const logger = createLogger(`MongoDB`);

function getUri(): string {
  return MONGO_URI;
}

function getHost(): string {
  const [, part] = getUri().split("@");
  const [host] = part.split("/");
  return host;
}

export async function connect(pid = "Not informed"): Promise<void> {
  let resolve: () => void;
  const promise = new Promise((r: (...args: any) => void) => (resolve = r));

  const host = getHost();
  const uri = getUri();

  mongoose.connect(uri);

  logger.info("Starting connection");

  mongoose.connection.on("connected", () => {
    logger.info(`Connected ${host} on PID ${pid}`);
    resolve();
  });
  mongoose.connection.on("disconneected", () => {
    logger.warn(`Disconnected from ${host}`);
    process.exit(1);
  });
  mongoose.connection.on("error", (error) => {
    logger.error(`Error on Connection ${host}: ${error.message}`);
    process.exit(1);
  });
  mongoose.connection.on("reconnected", () => {
    logger.info(`Successfully reconnected ${host} on PID ${pid}`);
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close(true);
    logger.warn(`Disconnected ${host} by the end of service`);
    process.exit(0);
  });

  return promise;
}

export * as MongoDB from "./MongoDB.js";
