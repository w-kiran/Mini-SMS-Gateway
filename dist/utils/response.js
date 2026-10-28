"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
// Send a success response in our standard format
function ok(res, data, status = 200) {
    res.status(status).json({ success: true, data });
}
