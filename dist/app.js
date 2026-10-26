"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// lets us read JSON request bodies
app.use(express_1.default.json());
// simple route to check the server is alive
app.get("/ping", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
});
exports.default = app;
