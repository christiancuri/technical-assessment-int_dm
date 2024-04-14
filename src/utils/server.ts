import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { bootstrap } from "fastify-decorators";

import { createLogger } from "./logger.js";

const logger = createLogger(`Server`);

export const fastify = Fastify({
  trustProxy: true,
  bodyLimit: 15_000_000,
});

fastify
  .register(multipart, {
    limits: {
      fileSize: 1_000_000_000_000,
    },
  })
  .register(cors)
  .addHook("onResponse", async (request, reply) => {
    if (request.method !== "OPTIONS") {
      logger.info(
        `${request.ip} - [${new Date().toISOString()}] "${request.method} ${
          request.url
        } ${(reply.raw as any)._header.split(" ")[0]}" ${
          reply.statusCode
        } ${reply.getHeader("content-length")} "${
          request.headers["user-agent"]
        }"`,
      );
    }
  })
  .register(bootstrap, {
    directory: new URL("../service", import.meta.url),
    mask: /\.controller\.js$/,
  });

const port = process.env.PORT || 3000;

export async function startServer() {
  await fastify
    .listen({
      port: parseInt(port as string, 10),
      host: "0.0.0.0",
    })
    .catch((err) => {
      logger.error(err.errors || err);
    });

  await fastify.ready();

  logger.info(`Running on port ${port}`);

  process?.send?.("ready");
}
