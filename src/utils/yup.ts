export { default as yup } from "yup";

import { isObjectIdOrHexString } from "mongoose";
import * as yup from "yup";

export const yupObjectId = (required = true) =>
  required
    ? yup
        .string()
        .required()
        .test("is-objectid", (v) => isObjectIdOrHexString(v))
    : yup
        .string()
        .notRequired()
        .nullable()
        .test("is-objectid", (v) => !v || isObjectIdOrHexString(v))
        .transform((_, v) => (v === "" ? undefined : v));
