"use client";

import { useEffect, useRef } from "react";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0/client";

export function AuthSync() {
  const { user, isLoading } = useUser();

  const inFlightRef = useRef(false);
  const syncedSubRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !user?.sub || inFlightRef.current) {
      return;
    }

    if (syncedSubRef.current === user.sub) {
      return;
    }

    const controller = new AbortController();

    const syncUser = async () => {
      inFlightRef.current = true;

      try {
        const token = await getAccessToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(`${apiUrl}/users/me`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`User sync failed with status ${response.status}`);
        }

        syncedSubRef.current = user.sub;
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to sync authenticated user", error);
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    syncUser();

    return () => {
      controller.abort();
    };
  }, [isLoading, user?.sub]);

  return null;
}
