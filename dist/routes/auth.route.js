"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_schema_1 = require("../validators/auth.schema");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const validate_1 = require("../utils/validate");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/auth/register", async (req, res) => {
    const { email, password } = (0, validate_1.parse)(auth_schema_1.credentialsSchema, req.body);
    (0, response_1.ok)(res, await (0, auth_service_1.registerUser)(email, password), 201);
});
exports.authRouter.post("/auth/login", async (req, res) => {
    const { email, password } = (0, validate_1.parse)(auth_schema_1.credentialsSchema, req.body);
    (0, response_1.ok)(res, await (0, auth_service_1.loginUser)(email, password));
});
exports.authRouter.get("/wallet", auth_1.requireAuth, async (_req, res) => {
    // the user id comes from the token, never from the request
    (0, response_1.ok)(res, { credits: await (0, auth_service_1.getCredits)(res.locals.userId) });
});
