"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSchema = void 0;
const zod_1 = require("zod");
exports.sendSchema = zod_1.z.object({
    to: zod_1.z.array(zod_1.z.string()).min(1).max(50),
    message: zod_1.z.string().min(1).max(1000),
});
