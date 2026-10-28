import { prisma } from "../db/prisma";
import { getBalance } from "../providers/mock.provider";

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
      name: provider.name,
      priority: provider.priority,
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