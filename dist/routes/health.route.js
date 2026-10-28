"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const validate_1 = require("../utils/validate");
const route_schema_1 = require("../validators/route.schema");
const health_service_1 = require("../services/health.service");
exports.healthRouter = (0, express_1.Router)();
// any logged-in user can see route health
exports.healthRouter.get("/routes/health", auth_1.requireAuth, async (_req, res) => {
    (0, response_1.ok)(res, await (0, health_service_1.getRouteHealth)());
});
// toggle a route active/inactive (forces failover for demos)
exports.healthRouter.patch("/routes/:id", auth_1.requireAuth, async (req, res) => {
    const { active } = (0, validate_1.parse)(route_schema_1.toggleRouteSchema, req.body);
    (0, response_1.ok)(res, await (0, health_service_1.setRouteActive)(req.params.id, active));
});
