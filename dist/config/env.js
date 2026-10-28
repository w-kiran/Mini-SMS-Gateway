"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
// make sure required variables exist, so we fail early with a clear message
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: required("JWT_SECRET"),
    DATABASE_URL: required("DATABASE_URL"),
};
