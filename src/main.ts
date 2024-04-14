import { MongoDB } from "./utils/MongoDB.js";

import "reflect-metadata";

await Promise.all([MongoDB.connect(process.pid.toString())]);

const { router } = await import("./router.js");
router();

export {};
