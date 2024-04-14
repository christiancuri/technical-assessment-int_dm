import type { Ref } from "@typegoose/typegoose";
import { prop, modelOptions, Severity, pre } from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

import { refOpts, schemaOptions } from "../../types/schemas.js";
import { IRegion } from "../Region/Region.js";

@pre<IUser>("save", async function (next) {
  const region = this as Omit<any, keyof IUser> & IUser;

  if (region.isModified("coordinates")) {
    // region.address = await lib.getAddressFromCoordinates(region.coordinates);
  } else if (region.isModified("address")) {
    // const { lat, lng } = await lib.getCoordinatesFromAddress(region.address);
    // region.coordinates = [lng, lat];
  }

  next();
})
@modelOptions({
  options: { customName: "user", allowMixed: Severity.ALLOW },
  schemaOptions,
})
export class IUser extends TimeStamps implements Base<string> {
  id: string;

  @prop({ default: () => new Types.ObjectId().toString() })
  _id: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  email!: string;

  @prop({ required: true })
  address!: string;

  @prop({ required: true, type: () => [Number] })
  coordinates!: [number, number];

  @prop({ required: true, default: [], ref: () => IRegion, refOpts })
  regions!: Ref<IRegion>[];
}
