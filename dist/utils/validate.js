"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const errors_1 = require("./errors");
// Check data against a zod schema.
// Returns the clean data, or throws a 400 error listing what is wrong.
function parse(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const details = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        throw (0, errors_1.appError)(400, "VALIDATION_ERROR", "Invalid request", details);
    }
    return result.data;
}
