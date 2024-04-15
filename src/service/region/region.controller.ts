import type { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, POST, PUT } from "fastify-decorators";

import { yup, yupObjectId } from "../../utils/yup.js";
import { RegionService } from "./region.service.js";

@Controller("/region")
export default class RegionController {
  @GET("/")
  async getRegions() {
    return RegionService.getRegions();
  }

  @GET("/search")
  async searchNearby(req: FastifyRequest) {
    const { lat, lng, distance, userId } = await yup
      .object({
        lat: yup.number().required().nonNullable(),
        lng: yup.number().required().nonNullable(),
        distance: yup.number().notRequired().nullable().default(null),
        userId: yupObjectId(false),
      })
      .validate(req.query);

    return RegionService.getRegionsNearby({
      lat,
      lng,
      distance,
      userId,
    });
  }

  @GET("/:regionId")
  async getRegion(req: FastifyRequest) {
    const { regionId } = await yup
      .object({
        regionId: yupObjectId(true),
      })
      .validate(req.params);

    return RegionService.getRegion(regionId);
  }

  @POST("/")
  async createRegion(req: FastifyRequest) {
    const { name, coordinates, user } = await yup
      .object({
        name: yup.string().required().nonNullable(),
        user: yupObjectId(true),
        coordinates: yup
          .array(yup.number())
          .ensure()
          .min(2)
          .max(2)
          .required()
          .nonNullable()
          .default(null),
      })
      .validate(req.body);

    return RegionService.createRegion({
      name,
      coordinates: coordinates as [number, number],
      userId: user,
    });
  }

  @PUT("/:regionId")
  async updateRegion(req: FastifyRequest) {
    const { regionId } = await yup
      .object({
        regionId: yupObjectId(true),
      })
      .validate(req.params);

    const { name, coordinates } = await yup
      .object({
        name: yup.string().notRequired().nullable(),
        coordinates: yup
          .array(yup.number())
          .ensure()
          .min(0)
          .max(2)
          .nullable()
          .notRequired()
          .default(null),
      })
      .validate(req.body);

    return RegionService.updateRegion({
      id: regionId,
      name,
      coordinates: coordinates as [number, number],
    });
  }

  @DELETE("/:regionId")
  async deleteRegion(req: FastifyRequest) {
    const { regionId } = await yup
      .object({
        regionId: yupObjectId(true),
      })
      .validate(req.params);

    return RegionService.deleteRegion(regionId);
  }

  @GET("/export-regions")
  async exportUsers(_req: FastifyRequest, reply: FastifyReply) {
    await RegionService.exportRegions(reply);
  }
}
