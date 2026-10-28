import { prisma } from "../db/prisma";
import { getBalance } from "../providers/mock.provider";
import { appError } from "../utils/errors";

export async function getRouteHealth() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours
  const providers = await prisma.provider.findMany({ orderBy: { priority: "asc" } });

  const routes = [];
  for (const provider of providers) {
    const balance = await getBalance(provider.id);

    const where = { providerId: provider.id, createdAt: { gte: since } };
    const total = await prisma.providerAttempt.count({ where });
    const successful = await prisma.providerAttempt.count({ where: { ...where, success: true } });

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
export async function setRouteActive(id: string, active: boolean) {
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) throw appError(404, "ROUTE_NOT_FOUND", "Route not found");

  const updated = await prisma.provider.update({
    where: { id },
    data: { failureRate: active ? 0 : 1 },
  });

  return { id: updated.id, name: updated.name, active: updated.failureRate < 1 };
}