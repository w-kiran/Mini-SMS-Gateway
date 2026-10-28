"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRouteHealth, toggleRouteActive } from "@/store/slices/healthSlice";
import { formatNumber, formatRate } from "@/lib/format";
import type { RouteHealth } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";

function healthTone(health: number): string {
  if (health >= 90) return "text-emerald-300";
  if (health >= 50) return "text-amber-300";
  return "text-rose-300";
}

function RouteCard({ route, toggling }: { route: RouteHealth; toggling: boolean }) {
  const dispatch = useAppDispatch();

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{route.name}</h3>
          <p className="text-xs text-slate-500">Priority {route.priority}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-semibold ${healthTone(route.health)}`}>{route.health}</p>
          <p className="text-xs text-slate-500">health</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-slate-400">Balance</dt>
        <dd className="text-right font-medium">{formatNumber(route.balance)}</dd>

        <dt className="text-slate-400">Success rate</dt>
        <dd className="text-right font-medium">{formatRate(route.successRate)}</dd>

        <dt className="text-slate-400">Attempts (24h)</dt>
        <dd className="text-right font-medium">{formatNumber(route.totalAttempts)}</dd>

        <dt className="text-slate-400">Successful</dt>
        <dd className="text-right font-medium text-emerald-300">{formatNumber(route.successful)}</dd>

        <dt className="text-slate-400">Failed</dt>
        <dd className="text-right font-medium text-rose-300">{formatNumber(route.failed)}</dd>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
        <Badge
          className={
            route.active
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/15 text-rose-300"
          }
        >
          {route.active ? "Active" : "Inactive"}
        </Badge>
        <Switch
          checked={route.active}
          disabled={toggling}
          label={`Toggle ${route.name}`}
          onChange={(next) => dispatch(toggleRouteActive({ id: route.id, active: next }))}
        />
      </div>
    </Card>
  );
}

export function RouteHealthCards() {
  const dispatch = useAppDispatch();
  const routes = useAppSelector((state) => state.health.routes);
  const status = useAppSelector((state) => state.health.status);
  const error = useAppSelector((state) => state.health.error);
  const togglingId = useAppSelector((state) => state.health.togglingId);

  useEffect(() => {
    dispatch(fetchRouteHealth());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Provider routes (last 24 hours)</h2>
        <Button variant="secondary" onClick={() => dispatch(fetchRouteHealth())} disabled={status === "loading"}>
          {status === "loading" ? <Spinner /> : "Refresh"}
        </Button>
      </div>

      {error && <Alert variant="error">{error.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} toggling={togglingId === route.id} />
        ))}
      </div>

      {status === "loading" && routes.length === 0 && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {status !== "loading" && routes.length === 0 && !error && (
        <p className="text-sm text-slate-500">No routes configured.</p>
      )}
    </div>
  );
}
