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

export * as UserService from "./user.service.js";
