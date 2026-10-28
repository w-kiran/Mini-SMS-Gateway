"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
// Checks the Bearer token and stores the user id in res.locals.userId
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    let id;
    try {
        id = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET).id;
    }
    catch {
        throw (0, errors_1.appError)(401, "UNAUTHORIZED", "Missing or invalid token");
    }
    res.locals.userId = id;
    next();
}
