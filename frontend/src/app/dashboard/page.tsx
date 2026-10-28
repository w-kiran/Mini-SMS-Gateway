"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Tabs, type TabKey } from "@/components/Tabs";
import { SendSmsForm } from "@/components/SendSmsForm";
import { LogsTable } from "@/components/LogsTable";
import { RouteHealthCards } from "@/components/RouteHealthCards";

export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("send");

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Tabs value={tab} onChange={setTab} />
        {tab === "send" && <SendSmsForm />}
        {tab === "logs" && <LogsTable />}
        {tab === "health" && <RouteHealthCards />}
      </main>
    </AuthGuard>
  );
}
