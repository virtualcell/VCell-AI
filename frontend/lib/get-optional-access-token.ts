import { getAccessToken } from "@auth0/nextjs-auth0/client";

/**
 * Like getAccessToken, but resolves to undefined instead of throwing when
 * there is no active session. Use this for requests to endpoints that serve
 * public data to anonymous callers but return additional (e.g. private)
 * data when a valid token is attached.
 */
export async function getOptionalAccessToken(): Promise<string | undefined> {
  try {
    return await getAccessToken();
  } catch {
    return undefined;
  }
}
