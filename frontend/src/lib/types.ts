export type MessageStatus = "pending" | "sent" | "failed";

export type Encoding = "GSM7" | "UNICODE";

export interface Message {
  id: string;
  to: string;
  body: string;
  encoding: Encoding;
  segments: number;
  cost: number;
  status: MessageStatus;
  provider: string | null;
  createdAt: string;
}

export interface SendResult {
  totalCost: number;
  messages: Message[];
}

export interface LogsPage {
  items: Message[];
  page: number;
  limit: number;
  total: number;
}

export interface RouteHealth {
  name: string;
  priority: number;
  balance: number;
  totalAttempts: number;
  successful: number;
  failed: number;
  successRate: number | null;
  health: number;
}

export interface RegisterResult {
  user: { id: string; email: string };
  token: string;
}

export interface LoginResult {
  token: string;
}

export interface WalletResult {
  credits: number;
}

export interface InvalidPhone {
  number: string;
  reason: string;
}

export interface LogFilters {
  page: number;
  limit: number;
  status?: MessageStatus;
  recipient?: string;
  from?: string;
  to?: string;
}
