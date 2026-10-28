"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const sms_schema_1 = require("../validators/sms.schema");
const response_1 = require("../utils/response");
const validate_1 = require("../utils/validate");
const sms_service_1 = require("../services/sms.service");
const logs_schema_1 = require("../validators/logs.schema");
const logs_service_1 = require("../services/logs.service");
exports.smsRouter = (0, express_1.Router)();
exports.smsRouter.post("/sms/send", auth_1.requireAuth, async (req, res) => {
    const { to, message } = (0, validate_1.parse)(sms_schema_1.sendSchema, req.body);
    const key = req.header("Idempotency-Key") || null;
    const result = await (0, sms_service_1.sendSms)(res.locals.userId, to, message, key);
    // 201 for a new send, 200 when an old result is returned for a repeated key
    (0, response_1.ok)(res, result.data, result.replayed ? 200 : 201);
});
exports.smsRouter.get("/sms/logs", auth_1.requireAuth, async (req, res) => {
    const query = (0, validate_1.parse)(logs_schema_1.logsSchema, req.query);
    (0, response_1.ok)(res, await (0, logs_service_1.getLogs)(res.locals.userId, query));
});
