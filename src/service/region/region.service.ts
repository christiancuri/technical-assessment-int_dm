import type { FilterQuery } from "mongoose";
import { Types } from "mongoose";

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

export * as RegionService from "./region.service.js";
