"use client";

export type TabKey = "send" | "logs" | "health";

const tabs: { key: TabKey; label: string }[] = [
  { key: "send", label: "Send SMS" },
  { key: "logs", label: "Message logs" },
  { key: "health", label: "Route health" },
];

export function Tabs({ value, onChange }: { value: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <div className="mb-6 flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            value === tab.key
              ? "bg-indigo-500 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
