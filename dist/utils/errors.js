"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appError = appError;
// Creates an error we throw on purpose, with an HTTP status and a short code
function appError(status, code, message, details) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    err.details = details;
    err.isAppError = true; // lets the error handler recognize our errors
    return err;
}
