import { createObjectCsvWriter } from "csv-writer";
import type { FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { clone } from "../../utils/clone.js";
import { GeoLib } from "../../utils/GeoLib.js";
import { HTTP400Error } from "../../utils/HttpErrors.js";
import { User } from "../../utils/models/index.js";
import type { IUser } from "../../utils/models/User/User.js";

export async function getUsers() {
  return User.find().lean();
}

export async function getUser(userId: string) {
  return User.findOne({
    _id: userId,
  }).lean();
}

export async function createUser({
  name,
  email,
  address,
  coordinates,
}: Pick<IUser, "name" | "email" | "address" | "coordinates">) {
  if ((!address && !coordinates) || (address && coordinates))
    throw new HTTP400Error(`Fill only address or coordinates`);

  const userPayload: Partial<IUser> = {
    name,
    email,
    address,
    coordinates,
  };

  if (address) {
    const { lat, lng } = await GeoLib.getCoordinatesFromAddress(address);
    userPayload.coordinates = [lng, lat];
  } else if (coordinates) {
    userPayload.address = await GeoLib.getAddressFromCoordinates(coordinates);
  }

  const user = await User.create(userPayload);

  return user.toObject();
}

export async function updateUser({
  userId,
  name,
  email,
  address,
  coordinates,
}: Pick<IUser, "name" | "email" | "address" | "coordinates"> & {
  userId: string;
}) {
  if (address && coordinates)
    throw new HTTP400Error(`Fill only address or coordinates`);

  const userPayload: Partial<IUser> = {
    name,
    email,
  };

  if (address) {
    const { lat, lng } = await GeoLib.getCoordinatesFromAddress(address);
    userPayload.coordinates = [lng, lat];
  } else if (coordinates) {
    userPayload.address = await GeoLib.getAddressFromCoordinates(coordinates);
  }

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: clone(userPayload),
    },
    {
      new: true,
    },
  ).lean();

  return user;
}

export async function deleteUser(userId: string) {
  return User.findOneAndDelete({
    _id: userId,
  }).lean();
}

export async function exportUsers(reply: FastifyReply) {
  const filePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    `../../../tmp/${randomUUID()}.csv`,
  );
  const writer = createObjectCsvWriter({
    path: filePath,
    header: [
      {
        id: "_id",
        title: "ID",
      },
      {
        id: "name",
        title: "Name",
      },
      {
        id: "email",
        title: "Email",
      },
      {
        id: "address",
        title: "Address",
      },
      {
        id: "lat",
        title: "Lat",
      },
      {
        id: "lng",
        title: "Lng",
      },
      {
        id: "regions",
        title: "Regions",
      },
      {
        id: "createdAt",
        title: "Created At",
      },
      {
        id: "updatedAt",
        title: "Updated At",
      },
    ],
  });

  const cursor = User.find().cursor();

  cursor.on(
    "data",
    async ({
      _id,
      name,
      email,
      address,
      coordinates,
      regions,
      createdAt,
      updatedAt,
    }: IUser) => {
      await writer.writeRecords([
        {
          _id,
          name,
          email,
          address,
          lat: coordinates[0],
          lng: coordinates[1],
          regions: regions.length,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ]);
    },
  );

  return new Promise((resolve) => {
    cursor.on("end", async () => {
      const fileStream = createReadStream(filePath);
      reply.header("Content-Type", "application/octet-stream");
      reply.header(
        "Content-Disposition",
        "attachment; filename=users-report.csv",
      );
      await reply.send(fileStream);

      await unlink(filePath);

      resolve(1);
    });
  });
}

export * as UserService from "./user.service.js";
