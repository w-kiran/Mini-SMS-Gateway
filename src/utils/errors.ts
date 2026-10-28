// Creates an error we throw on purpose, with an HTTP status and a short code
export function appError(status: number, code: string, message: string, details?: unknown) {
  const err: any = new Error(message);
  err.status = status;
  err.code = code;
  err.details = details;
  err.isAppError = true; // lets the error handler recognize our errors
  return err;
}