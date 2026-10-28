"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLogs, setFilters } from "@/store/slices/logsSlice";
import type { LogFilters, MessageStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

const statuses: MessageStatus[] = ["pending", "sent", "failed"];

export function LogsTable() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.logs.filters);
  const items = useAppSelector((state) => state.logs.items);
  const total = useAppSelector((state) => state.logs.total);
  const status = useAppSelector((state) => state.logs.status);
  const error = useAppSelector((state) => state.logs.error);

  const [statusFilter, setStatusFilter] = useState<MessageStatus | "">(filters.status ?? "");
  const [recipient, setRecipient] = useState(filters.recipient ?? "");
  const [from, setFrom] = useState(filters.from?.slice(0, 10) ?? "");
  const [to, setTo] = useState(filters.to?.slice(0, 10) ?? "");

  useEffect(() => {
    dispatch(fetchLogs(filters));
  }, [dispatch, filters]);

  function applyFilters() {
    const next: LogFilters = { page: 1, limit: filters.limit };
    if (statusFilter) next.status = statusFilter;
    if (recipient.trim()) next.recipient = recipient.trim();
    if (from) next.from = new Date(`${from}T00:00:00`).toISOString();
    if (to) next.to = new Date(`${to}T23:59:59.999`).toISOString();
    dispatch(setFilters(next));
  }

  function resetFilters() {
    setStatusFilter("");
    setRecipient("");
    setFrom("");
    setTo("");
    dispatch(setFilters({ page: 1, limit: filters.limit }));
  }

  function goToPage(page: number) {
    dispatch(setFilters({ ...filters, page }));
  }

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as MessageStatus | "")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            >
              <option value="">All</option>
              {statuses.map((value) => (
                <option key={value} value={value} className="capitalize">
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="9841234567"
          />
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={applyFilters}>Apply filters</Button>
          <Button variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </Card>

      {error && <Alert variant="error">{error.message}</Alert>}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Segments</th>
                <th className="px-5 py-3">Cost</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="px-5 py-3 font-mono">{item.to}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-300">{item.provider ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-300">{item.segments}</td>
                  <td className="px-5 py-3 text-slate-300">{item.cost}</td>
                  <td className="px-5 py-3 text-slate-400">{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
              {status === "loading" && items.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-slate-400" colSpan={6}>
                    <Spinner />
                  </td>
                </tr>
              )}
              {status !== "loading" && items.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-slate-500" colSpan={6}>
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-sm text-slate-400">
          <span>
            {total} message{total === 1 ? "" : "s"} · page {filters.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => goToPage(filters.page - 1)}
              disabled={filters.page <= 1 || status === "loading"}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => goToPage(filters.page + 1)}
              disabled={filters.page >= totalPages || status === "loading"}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
