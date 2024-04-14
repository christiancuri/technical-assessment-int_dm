import type { FastifyRequest } from "fastify";
import { Controller, DELETE, GET, POST, PUT } from "fastify-decorators";

import { yup, yupObjectId } from "../../utils/yup.js";
import { UserService } from "./user.service.js";

@Controller("/user")
export default class UserController {
  @GET("/")
  async getUsers() {
    return UserService.getUsers();
  }

  @GET("/:userId")
  async getUser(req: FastifyRequest) {
    const { userId } = await yup
      .object({
        userId: yupObjectId(true),
      })
      .validate(req.params);

    return UserService.getUser(userId);
  }

  @POST("/")
  async createUser(req: FastifyRequest) {
    const { name, email, address, coordinates } = await yup
      .object({
        name: yup.string().required().nonNullable(),
        email: yup.string().email().required().nonNullable(),
        address: yup.string().notRequired().nullable(),
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

    return UserService.createUser({
      name,
      email,
      address,
      coordinates: coordinates as [number, number],
    });
  }

  @PUT("/:userId")
  async updateUser(req: FastifyRequest) {
    const { userId } = await yup
      .object({
        userId: yupObjectId(true),
      })
      .validate(req.params);

    const { name, email, address, coordinates } = await yup
      .object({
        name: yup.string().notRequired().nullable(),
        email: yup.string().email().notRequired().nullable(),
        address: yup.string().notRequired().nullable(),
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

    return UserService.updateUser({
      userId,
      name,
      email,
      address,
      coordinates: coordinates as [number, number],
    });
  }

  @DELETE("/:userId")
  async deleteUser(req: FastifyRequest) {
    const { userId } = await yup
      .object({
        userId: yupObjectId(true),
      })
      .validate(req.params);

    return UserService.deleteUser(userId);
  }
}
