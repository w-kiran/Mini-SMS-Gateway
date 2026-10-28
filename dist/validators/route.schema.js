"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleRouteSchema = void 0;
const zod_1 = require("zod");
exports.toggleRouteSchema = zod_1.z.object({
    active: zod_1.z.boolean(),
});
