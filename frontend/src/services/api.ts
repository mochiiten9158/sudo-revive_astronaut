
import type {
  MyHealthResponse,
  MyAlertsResponse,
} from "../types/health";

import { getAccessToken } from "./auth";

const API_URL = "";

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function authenticatedGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // Keep the fallback error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/**
 * Fetches health observations belonging to the authenticated astronaut.
 */
export async function getMyHealthData(): Promise<MyHealthResponse> {
  return authenticatedGet<MyHealthResponse>("/api/health/me");
}

/**
 * Fetches alerts for the authenticated astronaut.
 *
 * If missionDay is provided, retrieves alerts for that exact observation.
 * Otherwise, retrieves alerts for the latest recorded observation.
 */
export async function getMyAlerts(
  missionDay?: number | null
): Promise<MyAlertsResponse> {
  const query =
    missionDay !== null && missionDay !== undefined
      ? `?mission_day=${encodeURIComponent(missionDay)}`
      : "";

  return authenticatedGet<MyAlertsResponse>(`/api/alerts/me${query}`);
}
