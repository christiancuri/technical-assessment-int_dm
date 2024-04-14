import { Controller, GET } from "fastify-decorators";

import { HealthCheckService } from "./health-check.service.js";

@Controller("/health")
export default class HealthCheckController {
  @GET("/")
  async healthCheck() {
    return HealthCheckService.health();
  }
}
