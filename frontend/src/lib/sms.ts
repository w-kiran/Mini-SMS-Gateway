import type { Encoding } from "./types";

// Mirrors src/utils/phone.ts on the backend.
export function normalizePhone(raw: string): string | null {
  let n = raw.replace(/[\s-]/g, "");

  if (n.startsWith("+977")) {
    n = n.slice(4);
  } else if (n.startsWith("977") && n.length === 13) {
    n = n.slice(3);
  }

  return /^9[78]\d{8}$/.test(n) ? n : null;
}

// Splits a free-form textarea into individual recipient tokens.
export function parseRecipients(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export interface RecipientCheck {
  numbers: string[];
  invalid: string[];
}

export function checkRecipients(list: string[]): RecipientCheck {
  const numbers: string[] = [];
  const invalid: string[] = [];

  for (const raw of list) {
    const normalized = normalizePhone(raw);
    if (normalized) numbers.push(normalized);
    else invalid.push(raw);
  }

  return { numbers: [...new Set(numbers)], invalid };
}

// Mirrors src/utils/sms.ts on the backend so the UI can preview cost.
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

const GSM_EXTENSION = "^{}\\[~]|€";

export interface MessageInfo {
  encoding: Encoding;
  length: number;
  segments: number;
}

export function analyzeMessage(text: string): MessageInfo {
  let septets = 0;
  let isGsm = true;

  for (const ch of text) {
    if (GSM_BASIC.includes(ch)) {
      septets += 1;
    } else if (GSM_EXTENSION.includes(ch)) {
      septets += 2;
    } else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    const segments = septets <= 160 ? 1 : Math.ceil(septets / 153);
    return { encoding: "GSM7", length: septets, segments };
  }

  const length = text.length;
  const segments = length <= 70 ? 1 : Math.ceil(length / 67);
  return { encoding: "UNICODE", length, segments };
}
