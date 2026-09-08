/**
 * Helpers for turning a failed backend response into something worth showing a
 * user.
 *
 * FastAPI reports errors as `{"detail": ...}` — a string for `HTTPException`,
 * or a list of objects for request-validation failures. Both carry the reason
 * the request was rejected, so prefer them over a generic message.
 */

/** Pull a human-readable message out of an already-parsed FastAPI error body. */
export function messageFromErrorBody(data: unknown, fallback: string): string {
  const detail = (data as { detail?: unknown } | null | undefined)?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  // Request-validation errors arrive as a list of objects.
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: unknown } | undefined;
    if (typeof first?.msg === "string" && first.msg.trim()) {
      return first.msg;
    }
  }

  return fallback;
}

/**
 * Read a failed Response and pull the message out of its body, falling back
 * when the body is missing or isn't JSON. Consumes the body, so call it only on
 * a response you aren't going to read again.
 */
export async function messageFromErrorResponse(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    return messageFromErrorBody(await response.json(), fallback);
  } catch {
    return fallback;
  }
}
