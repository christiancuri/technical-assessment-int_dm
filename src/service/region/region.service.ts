import { createObjectCsvWriter } from "csv-writer";
import type { FastifyReply } from "fastify";
import type { FilterQuery } from "mongoose";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { clone } from "../../utils/clone.js";
import { HTTP404Error } from "../../utils/HttpErrors.js";
import { Region, User } from "../../utils/models/index.js";
import type { IRegion } from "../../utils/models/Region/Region.js";
import type { Populate } from "../../utils/types/typegoose.js";

export async function getRegions(): Promise<Populate<IRegion, "user">[]> {
  return Region.find().populate("user").lean();
}

export async function getRegion(
  regionId: string,
): Promise<Populate<IRegion, "user">> {
  return Region.findOne({
    _id: regionId,
  })
    .populate("user")
    .lean();
}

export async function createRegion({
  name,
  coordinates,
  userId,
}: Pick<IRegion, "name" | "coordinates"> & { userId: string }): Promise<
  Populate<IRegion, "user">
> {
  const oid = new Types.ObjectId().toString();

  const userExists = await User.exists({
    _id: userId,
  });

  if (!userExists) throw new HTTP404Error(`User not found`);

  const [region] = await Promise.all([
    Region.create({
      _id: oid,
      name,
      coordinates,
      user: userId,
    }),
    User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $addToSet: {
          regions: oid,
        },
      },
    ),
  ]);

  return region.populate("user");
}

export async function updateRegion({
  id,
  name,
  coordinates,
}: Pick<IRegion, "id" | "name" | "coordinates">): Promise<
  Populate<IRegion, "user">
> {
  return Region.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: clone({
        name,
        coordinates,
      }),
    },
    {
      new: true,
    },
  )
    .populate("user")
    .lean();
}

export async function deleteRegion(regionId: string) {
  const [region] = await Promise.all([
    Region.findOneAndDelete({
      _id: regionId,
    }).lean(),
    User.updateMany(
      {
        regions: regionId,
      },
      {
        $pull: {
          regions: regionId,
        },
      },
    ),
  ]);

  return region;
}

export async function getRegionsNearby({
  lat,
  lng,
  distance,
  userId,
}: {
  lat: number;
  lng: number;
  distance?: number;
  userId?: string;
}) {
  const point = { latitude: +lat, longitude: +lng };

  const filterQuery: FilterQuery<IRegion> = {
    coordinates: {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
      },
    },
  };

  if (distance) {
    filterQuery.coordinates = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
        $maxDistance: +distance,
      },
    };
  }

  if (userId) {
    filterQuery.user = {
      $ne: userId,
    };
  }

  const regions = await Region.find(filterQuery).lean();

  return regions;
}

export async function exportRegions(reply: FastifyReply) {
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
        id: "lat",
        title: "Lat",
      },
      {
        id: "lng",
        title: "Lng",
      },
      {
        id: "user_id",
        title: "Owner id",
      },
      {
        id: "user_name",
        title: "Owner name",
      },
      {
        id: "user_email",
        title: "Owner email",
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

  const cursor = Region.find().populate("user").cursor();

  cursor.on(
    "data",
    async ({
      _id,
      name,
      coordinates,
      user,
      createdAt,
      updatedAt,
    }: Populate<IRegion, "user">) => {
      await writer.writeRecords([
        {
          _id,
          name,
          lat: coordinates[0],
          lng: coordinates[1],
          user_name: user.name,
          user_email: user.email,
          user_id: user._id,
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
        "attachment; filename=regions-report.csv",
      );

      await reply.send(fileStream);

      await unlink(filePath);

      resolve(1);
    });
  });
}

export * as RegionService from "./region.service.js";
