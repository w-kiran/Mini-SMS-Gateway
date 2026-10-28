const BASE_PATH = "/api";

export interface SerializedApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function serializeError(err: unknown): SerializedApiError {
  if (err instanceof ApiError) {
    return { status: err.status, code: err.code, message: err.message, details: err.details };
  }
  if (err instanceof Error) {
    return { status: 0, code: "UNKNOWN", message: err.message };
  }
  return { status: 0, code: "UNKNOWN", message: "Something went wrong" };
}

let unauthorizedHandler: (() => void) | null = null;

// The store registers a callback here so any 401 clears the session.
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_PATH}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the API. Is the backend running?");
  }

  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  let payload: ApiSuccess<T> | ApiFailure | null = null;
  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    payload = null;
  }

  if (!payload) {
    throw new ApiError(response.status, "INVALID_RESPONSE", `Unexpected response (${response.status})`);
  }

  if (payload.success === false) {
    throw new ApiError(response.status, payload.error.code, payload.error.message, payload.error.details);
  }

  if (!response.ok) {
    throw new ApiError(response.status, "HTTP_ERROR", `Request failed (${response.status})`);
  }

  return payload.data;
}
