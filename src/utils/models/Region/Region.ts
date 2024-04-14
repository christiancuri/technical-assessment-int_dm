import type { Ref } from "@typegoose/typegoose";
import { prop, modelOptions, Severity, pre } from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses.js";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses.js";
import { Types } from "mongoose";

import { refOpts, schemaOptions } from "../../types/schemas.js";
import { User } from "../index.js";
import { IUser } from "../User/User.js";

@pre<IRegion>("save", async function (next) {
  const region = this as Omit<any, keyof IRegion> & IRegion;

  if (!region._id) {
    region._id = new Types.ObjectId().toString();
  }

  if (region.isNew) {
    const user = await User.findOne({ _id: region.user.toString() });
    user.regions.push(region._id);
    await user.save({ session: region.$session() });
  }

  next(region.validateSync());
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

  @prop({ required: true, ref: () => IUser, ...refOpts })
  user!: Ref<IUser>;
}
