"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteHealth = getRouteHealth;
exports.setRouteActive = setRouteActive;
const prisma_1 = require("../db/prisma");
const mock_provider_1 = require("../providers/mock.provider");
const errors_1 = require("../utils/errors");
async function getRouteHealth() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours
    const providers = await prisma_1.prisma.provider.findMany({ orderBy: { priority: "asc" } });
    const routes = [];
    for (const provider of providers) {
        const balance = await (0, mock_provider_1.getBalance)(provider.id);
        const where = { providerId: provider.id, createdAt: { gte: since } };
        const total = await prisma_1.prisma.providerAttempt.count({ where });
        const successful = await prisma_1.prisma.providerAttempt.count({ where: { ...where, success: true } });
        // no attempts yet: success rate is unknown (null) and health is 100
        const successRate = total === 0 ? null : Math.round((successful / total) * 10000) / 100;
        const health = balance === 0 ? 0 : (successRate ?? 100);
        routes.push({
            id: provider.id,
            name: provider.name,
            priority: provider.priority,
            active: provider.failureRate < 1,
            balance,
            totalAttempts: total,
            successful,
            failed: total - successful,
            successRate,
            health,
        });
    }
    return { routes };
}
// Force a route to always succeed (active, failureRate 0) or always fail
// (inactive, failureRate 1), so failover and refunds can be demonstrated.
async function setRouteActive(id, active) {
    const provider = await prisma_1.prisma.provider.findUnique({ where: { id } });
    if (!provider)
        throw (0, errors_1.appError)(404, "ROUTE_NOT_FOUND", "Route not found");
    const updated = await prisma_1.prisma.provider.update({
        where: { id },
        data: { failureRate: active ? 0 : 1 },
    });
    return { id: updated.id, name: updated.name, active: updated.failureRate < 1 };
}
