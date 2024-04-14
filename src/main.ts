import { test } from "./run.js";
import { MongoDB } from "./utils/MongoDB.js";

import "reflect-metadata";

await Promise.all([MongoDB.connect(process.pid.toString())]);

test();

export {};
