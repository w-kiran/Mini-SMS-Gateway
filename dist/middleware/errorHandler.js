"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
// Unknown route -> JSON 404
function notFound(_req, _res, next) {
    next((0, errors_1.appError)(404, "NOT_FOUND", "Route not found"));
}
// Central error handler (it must have exactly 4 parameters)
function errorHandler(err, _req, res, _next) {
    // errors we threw on purpose
    if (err?.isAppError) {
        return res.status(err.status).json({
            success: false,
            error: { code: err.code, message: err.message, details: err.details },
        });
    }
    // body that is not valid JSON
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
        });
    }
    // unique constraint broken (for example the same Idempotency-Key used twice at once)
    if (err?.code === "P2002") {
        return res.status(409).json({
            success: false,
            error: { code: "DUPLICATE", message: "Duplicate request" },
        });
    }
    // anything else: log it on the server, send a safe message to the client
    console.error(err);
    res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
}
