
export interface HealthOverview {
  participants: number;
  observations: number;
  health_domains: string[];
  synthetic_records: number;
}

export interface HealthRecord {
  ID?: number;
  Subject: number;
  Treatment: string;
  Test_Phase: string;
  Day: string;
  Elapsed_Day: number;
  Timepoint_order?: number;

  // Cardiovascular measurements
  "Left Ventricular Diameter Diastole"?: number | null;
  "Left Ventricular Diameter Systole"?: number | null;
  "Mitral E Wave Velocity"?: number | null;
  "Mitral A Wave Velocity"?: number | null;
  "Tricuspid E Velocity"?: number | null;
  "Tricuspid A Velocity"?: number | null;
  "LVOT Velocity Time Integral"?: number | null;
  "TDI Left Heart Rate"?: number | null;
  "TDI Right Heart Rate"?: number | null;

  // Musculoskeletal
  Bone_Density_Index_pct_Baseline?: number;
  Muscle_Strength_Index_pct_Baseline?: number;
  Muscle_Mass_Index_pct_Baseline?: number;
  Mobility_Index_pct_Baseline?: number;
  Exercise_Adherence_pct?: number;

  // Behavioral and cognitive
  Sleep_Duration_hours?: number;
  Sleep_Quality_Score?: number;
  Fatigue_Score_0_10?: number;
  Stress_Score_0_10?: number;
  Mood_Score_0_10?: number;
  Cognitive_Performance_Index?: number;

  // Radiation and environment
  Daily_Radiation_Exposure_Index_AU?: number;
  Cumulative_Radiation_Exposure_Index_AU?: number;
  Cabin_CO2_ppm?: number;
  Cabin_Temperature_C?: number;
  Cabin_Humidity_pct?: number;

  // Immune and general health
  "White_Blood_Cell_Count_10^9_L"?: number;
  Lymphocyte_Count_10_9_L?: number;
  CRP_mg_L?: number;
  Body_Temperature_C?: number;
  Symptom_Reported?: number;
  Symptom_Type?: string | null;

  Is_Synthetic: boolean;
  Data_Origin: string;
  Random_Seed?: number;

  [key: string]: string | number | boolean | null | undefined;
}
