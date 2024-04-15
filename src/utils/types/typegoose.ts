import type { Ref } from "@typegoose/typegoose";

export type Populate<T, K extends keyof T> = {
  [x in keyof T]: T[x] extends Ref<infer R>
    ? x extends K
      ? R
      : T[x]
    : T[x] extends Ref<infer R>[]
      ? x extends K
        ? R[]
        : T[x]
      : T[x];
};
