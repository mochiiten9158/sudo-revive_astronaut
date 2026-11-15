
const API_URL = "";

// Deliberately kept in memory for this initial implementation.
// Refreshing the browser will require the astronaut to log in again.
let accessToken: string | null = null;

export interface AstronautProfile {
  astronaut_id: string;
  display_name: string;
  mission_id: number | null;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export async function login(
  astronautId: string,
  password: string
): Promise<AstronautProfile> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      astronaut_id: astronautId,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Invalid astronaut ID or password."
        : "Unable to log in. Please try again."
    );
  }

  const result: LoginResponse = await response.json();

  setAccessToken(result.access_token);

  try {
    return await getMyProfile();
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function getMyProfile(): Promise<AstronautProfile> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Your session is invalid or expired. Please log in again.");
  }

  return response.json();
}

export function logout(): void {
  clearAccessToken();
}
