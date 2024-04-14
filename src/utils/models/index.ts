/**
 * Here, only models with circular dependency problems should be defined. Models without those problems can be defined on the interface file
 */

import { getModelForClass } from "@typegoose/typegoose";

import { IRegion } from "./Region/Region.js";
import { IUser } from "./User/User.js";

export const User = getModelForClass(IUser);
export const Region = getModelForClass(IRegion);
