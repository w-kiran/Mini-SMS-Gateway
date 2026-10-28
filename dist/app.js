"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_route_1 = require("./routes/auth.route");
const sms_route_1 = require("./routes/sms.route");
const health_route_1 = require("./routes/health.route");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/ping", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
});
app.use(auth_route_1.authRouter);
app.use(sms_route_1.smsRouter);
app.use(health_route_1.healthRouter);
// these two must stay last
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
