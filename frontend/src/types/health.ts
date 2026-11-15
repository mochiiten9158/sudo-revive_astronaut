export type HealthStatus =
  | "normal"
  | "warning"
  | "critical"
  | "unknown";

export interface HealthRecord {
  Astronaut_ID: string;
  Name: string;
  Phase: string;
  Mission_Day: number;

  Status: HealthStatus;
  Alert_Reasons: string | null;

  Data_Origin: string;
  Is_Synthetic: boolean;
  Random_Seed?: number | null;

  [key: string]: string | number | boolean | null | undefined;
}

export interface MyHealthResponse {
  astronaut_id: string;
  display_name: string;
  dataset_subject_id: string;
  observations: number;
  data_origin: string | string[] | null;
  is_synthetic: boolean;
  data: HealthRecord[];
}

export interface HealthAlert {
  severity: HealthStatus;
  title: string;
  message: string;
  mission_day: number | null;
  phase: string | null;
}

export interface MyAlertsResponse {
  astronaut_id: string;
  display_name: string;

  observations_analyzed: number;
  status: HealthStatus;

  mission_day: number | null;
  phase: string | null;

  alerts: HealthAlert[];

  is_synthetic: boolean;
  data_origin: string | null;
}