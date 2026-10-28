"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendSms } from "@/store/slices/smsSlice";
import { fetchWallet } from "@/store/slices/walletSlice";
import { analyzeMessage, checkRecipients, parseRecipients } from "@/lib/sms";
import { formatDateTime } from "@/lib/format";
import type { InvalidPhone } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

const MAX_RECIPIENTS = 50;
const MAX_MESSAGE_LENGTH = 1000;

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function invalidPhonesFrom(details: unknown): InvalidPhone[] {
  if (!Array.isArray(details)) return [];
  return details.filter(
    (item): item is InvalidPhone =>
      typeof item === "object" && item !== null && "number" in item && "reason" in item
  );
}

export function SendSmsForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.sms.status);
  const error = useAppSelector((state) => state.sms.error);
  const result = useAppSelector((state) => state.sms.result);

  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [localError, setLocalError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const tokens = parseRecipients(recipients);
    const { numbers, invalid } = checkRecipients(tokens);
    const info = analyzeMessage(message);
    return {
      tokenCount: tokens.length,
      validCount: numbers.length,
      invalid,
      info,
      estimatedCost: message.length > 0 ? info.segments * numbers.length : 0,
    };
  }, [recipients, message]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const tokens = parseRecipients(recipients);
    if (tokens.length === 0) {
      setLocalError("Add at least one recipient.");
      return;
    }
    if (tokens.length > MAX_RECIPIENTS) {
      setLocalError(`Maximum ${MAX_RECIPIENTS} recipients per request.`);
      return;
    }
    if (message.trim().length === 0) {
      setLocalError("Message cannot be empty.");
      return;
    }

    const outcome = await dispatch(
      sendSms({ to: tokens, message, idempotencyKey })
    );

    if (sendSms.fulfilled.match(outcome)) {
      dispatch(fetchWallet());
      setMessage("");
      setRecipients("");
      setIdempotencyKey(newIdempotencyKey());
    }
  }

  const invalidDetails = error?.code === "INVALID_PHONE_NUMBERS" ? invalidPhonesFrom(error.details) : [];

  return (
    <div className="space-y-6">
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Textarea
            label="Recipients"
            rows={3}
            value={recipients}
            onChange={(event) => setRecipients(event.target.value)}
            placeholder="9841234567, +9779801122334"
            hint="Separate numbers with commas, spaces or new lines. Nepali mobile numbers only."
          />

          <Textarea
            label="Message"
            rows={5}
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hello from Mini SMS Gateway"
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>
              {preview.info.encoding} · {preview.info.length} chars · {preview.info.segments} segment
              {preview.info.segments === 1 ? "" : "s"}
            </span>
            <span>
              {preview.validCount} valid recipient{preview.validCount === 1 ? "" : "s"}
              {preview.invalid.length > 0 && (
                <span className="text-rose-300"> · {preview.invalid.length} invalid</span>
              )}
            </span>
            <span className="font-medium text-indigo-300">Est. cost: {preview.estimatedCost} credits</span>
          </div>

          {localError && <Alert variant="error">{localError}</Alert>}

          {error && (
            <Alert variant="error" title={error.message}>
              {invalidDetails.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs">
                  {invalidDetails.map((item) => (
                    <li key={item.number}>
                      <span className="font-mono">{item.number}</span> — {item.reason}
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? <Spinner /> : "Send message"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Send result</h2>
            <span className="text-sm text-slate-400">
              Charged <span className="font-semibold text-indigo-300">{result.totalCost}</span> credits
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Recipient</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Segments</th>
                  <th className="py-2 pr-4">Cost</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {result.messages.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4 font-mono">{item.to}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2 pr-4 text-slate-300">{item.provider ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-300">{item.segments}</td>
                    <td className="py-2 pr-4 text-slate-300">{item.cost}</td>
                    <td className="py-2 text-slate-400">{formatDateTime(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
