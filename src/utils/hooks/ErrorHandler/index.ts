import type { FastifyReply, FastifyRequest } from "fastify";
import { ValidationError } from "yup";

import { HTTP400Error, HTTPClientError } from "../../HttpErrors.js";
import * as ErrorHandlerService from "./ErrorHandler.js";

export async function ErrorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (error instanceof ValidationError)
    return ErrorHandlerService.clientError(
      request,
      reply,
      new HTTP400Error(error.message),
    );

  return error instanceof HTTPClientError
    ? ErrorHandlerService.clientError(request, reply, error)
    : ErrorHandlerService.serverError(request, reply, error);
}
