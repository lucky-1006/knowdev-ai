import { getSession, signOut } from "next-auth/react";

/**
 * A fetch wrapper that automatically fetches the active NextAuth session
 * and injects the Bearer JWT access token into the request headers.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();
  const headers = new Headers(options.headers || {});

  // Inject Bearer token if it exists in NextAuth session
  if (session && (session as any).accessToken) {
    headers.set("Authorization", `Bearer ${(session as any).accessToken}`);
  }

  // Ensure JSON requests set Content-Type if sending a body
  if (options.body && !headers.has("Content-Type") && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized responses by logging out
  if (response.status === 401) {
    console.warn("API returned 401 Unauthorized. Signing out client session.");
    signOut({ callbackUrl: "/login" });
  }

  return response;
}
