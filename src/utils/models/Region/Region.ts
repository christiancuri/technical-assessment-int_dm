import type { Ref } from "@typegoose/typegoose";
import { prop, modelOptions, Severity, index } from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses.js";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses.js";
import { Types } from "mongoose";

import { refOpts, schemaOptions } from "../../types/schemas.js";
import { IUser } from "../User/User.js";

@index({
  coordinates: "2dsphere",
})
@modelOptions({
  options: { customName: "region", allowMixed: Severity.ALLOW },
  schemaOptions,
})
export class IRegion extends TimeStamps implements Base<string> {
  id: string;

  @prop({ default: () => new Types.ObjectId().toString() })
  _id: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true, type: () => [Number] })
  coordinates!: [number, number];

  @prop({ required: true, ref: () => IUser, ...refOpts })
  user!: Ref<IUser>;
}
