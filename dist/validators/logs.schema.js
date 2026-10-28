"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsSchema = void 0;
const zod_1 = require("zod");
exports.logsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(["pending", "sent", "failed"]).optional(),
    recipient: zod_1.z.string().optional(),
    from: zod_1.z.coerce.date().optional(), // start of the date range
    to: zod_1.z.coerce.date().optional(), // end of the date range
});
