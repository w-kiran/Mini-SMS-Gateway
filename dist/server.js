"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const refund_service_1 = require("./services/refund.service");
app_1.default.listen(env_1.env.PORT, () => {
    console.log(`Server running on http://localhost:${env_1.env.PORT}`);
});
// Refund messages stuck in "pending": once at startup, then every minute
(0, refund_service_1.recoverPending)().catch(console.error);
setInterval(() => (0, refund_service_1.recoverPending)().catch(console.error), 60 * 1000);
