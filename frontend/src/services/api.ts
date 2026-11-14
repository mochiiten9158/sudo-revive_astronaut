
import type {
  HealthOverview,
  HealthRecord
} from "../types/health";

const API_URL = "http://localhost:8000";

export async function getHealthOverview():
  Promise<HealthOverview> {

  const response = await fetch(
    `${API_URL}/api/health/overview`
  );

  if (!response.ok) {
    throw new Error("Could not load health overview");
  }

  return response.json();
}

export async function getParticipants():
  Promise<number[]> {

  const response = await fetch(
    `${API_URL}/api/health/participants`
  );

  if (!response.ok) {
    throw new Error("Could not load participants");
  }

  const result = await response.json();

  return result.participants;
}

export async function getParticipantHealth(
  subjectId: number
): Promise<HealthRecord[]> {

  const response = await fetch(
    `${API_URL}/api/health/participants/${subjectId}`
  );

  if (!response.ok) {
    throw new Error("Could not load participant data");
  }

  return response.json();
}
