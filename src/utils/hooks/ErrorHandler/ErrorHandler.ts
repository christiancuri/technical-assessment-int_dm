import { type FastifyReply, type FastifyRequest } from "fastify";

import type { HTTPClientError } from "../../HttpErrors.js";
import { createLogger } from "../../logger.js";

const logger = createLogger(`ErrorHandler`);

export async function clientError(
  _request: FastifyRequest,
  reply: FastifyReply,
  error: HTTPClientError,
): Promise<void> {
  reply.status(error.statusCode).send({ message: error.message || error });
}

export async function serverError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: Error,
): Promise<void> {
  const msg = error.stack ? `\n ${error.stack}` : ` - ${error}`;

  logger.error(`${new Date()} - ${request.method} - ${request.url} ${msg}`);

  const message = error.message ? error.message : error;

  reply.status(500).send({ message });
}
