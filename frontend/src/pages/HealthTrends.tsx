
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  CalendarDays,
  Orbit,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getMyHealthData } from "../services/api";
import { useMissionDay } from "../context/MissionDayContext";

import type {
  HealthRecord,
  MyHealthResponse,
} from "../types/health";

type MetricDefinition = {
  key: string;
  label: string;
  unit: string;
  category: string;
  description: string;
  decimals: number;
};

const metrics: MetricDefinition[] = [
  {
    key: "Sleep_Duration_hours",
    label: "Sleep duration",
    unit: "hours",
    category: "Behavioral",
    description: "Recorded sleep duration per observation.",
    decimals: 1,
  },
  {
    key: "Sleep_Efficiency_pct",
    label: "Sleep efficiency",
    unit: "%",
    category: "Behavioral",
    description: "Percentage of time asleep during the sleep period.",
    decimals: 1,
  },
  {
    key: "Fatigue_Score_0_10",
    label: "Fatigue",
    unit: "/10",
    category: "Behavioral",
    description: "Recorded subjective fatigue score.",
    decimals: 1,
  },
  {
    key: "Stress_Score_0_10",
    label: "Stress",
    unit: "/10",
    category: "Behavioral",
    description: "Recorded subjective stress score.",
    decimals: 1,
  },
  {
    key: "Cognitive_Performance_Index",
    label: "Cognitive performance",
    unit: "index",
    category: "Behavioral",
    description: "Recorded cognitive performance index.",
    decimals: 2,
  },
  {
    key: "Resting_HR_bpm",
    label: "Resting heart rate",
    unit: "bpm",
    category: "Cardiovascular",
    description: "Recorded resting heart rate.",
    decimals: 1,
  },
  {
    key: "Systolic_BP_mmHg",
    label: "Systolic blood pressure",
    unit: "mmHg",
    category: "Cardiovascular",
    description: "Recorded systolic blood pressure.",
    decimals: 1,
  },
  {
    key: "Diastolic_BP_mmHg",
    label: "Diastolic blood pressure",
    unit: "mmHg",
    category: "Cardiovascular",
    description: "Recorded diastolic blood pressure.",
    decimals: 1,
  },
  {
    key: "SpO2_pct",
    label: "Blood oxygen saturation",
    unit: "%",
    category: "Cardiovascular",
    description: "Recorded peripheral oxygen saturation.",
    decimals: 1,
  },
  {
    key: "Bone_Density_Index_pct_Baseline",
    label: "Bone density index",
    unit: "% of baseline",
    category: "Physical",
    description: "Bone density relative to the recorded baseline.",
    decimals: 1,
  },
  {
    key: "Muscle_Mass_Index_pct_Baseline",
    label: "Muscle mass index",
    unit: "% of baseline",
    category: "Physical",
    description: "Muscle mass relative to the recorded baseline.",
    decimals: 1,
  },
  {
    key: "Muscle_Strength_Index_pct_Baseline",
    label: "Muscle strength index",
    unit: "% of baseline",
    category: "Physical",
    description: "Muscle strength relative to the recorded baseline.",
    decimals: 1,
  },
  {
    key: "VO2max_Index_pct_Baseline",
    label: "VO2 max index",
    unit: "% of baseline",
    category: "Physical",
    description: "Aerobic capacity relative to the recorded baseline.",
    decimals: 1,
  },
  {
    key: "Exercise_Adherence_pct",
    label: "Exercise adherence",
    unit: "%",
    category: "Physical",
    description: "Recorded adherence to the exercise program.",
    decimals: 1,
  },
  {
    key: "Daily_Radiation_mSv",
    label: "Daily radiation",
    unit: "mSv",
    category: "Radiation",
    description: "Recorded daily radiation exposure.",
    decimals: 3,
  },
  {
    key: "Cumulative_Mission_Dose_mSv",
    label: "Cumulative mission dose",
    unit: "mSv",
    category: "Radiation",
    description: "Recorded cumulative mission radiation dose.",
    decimals: 2,
  },
  {
    key: "Career_Dose_Pct_of_600mSv_Limit",
    label: "Career dose",
    unit: "% of reference limit",
    category: "Radiation",
    description: "Recorded career dose as a percentage of the dataset's 600 mSv reference limit.",
    decimals: 1,
  },
  {
    key: "Vitamin_D_ng_mL",
    label: "Vitamin D",
    unit: "ng/mL",
    category: "Nutrition",
    description: "Recorded vitamin D measurement.",
    decimals: 1,
  },
  {
    key: "Homocysteine_umol_L",
    label: "Homocysteine",
    unit: "µmol/L",
    category: "Nutrition",
    description: "Recorded homocysteine measurement.",
    decimals: 2,
  },
  {
    key: "CRP_mg_L",
    label: "C-reactive protein",
    unit: "mg/L",
    category: "Immune",
    description: "Recorded C-reactive protein measurement.",
    decimals: 2,
  },
];

function numericValue(record: HealthRecord, key: string): number | null {
  const raw = record[key];

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatValue(
  value: number | null,
  decimals: number
): string {
  return value === null ? "—" : value.toFixed(decimals);
}

function phaseLabel(phase: string): string {
  return phase
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function HealthTrends() {
  const [health, setHealth] = useState<MyHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMetric, setSelectedMetric] = useState(
    "Sleep_Duration_hours"
  );

  const { selectedMissionDay, setSelectedMissionDay } = useMissionDay();

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await getMyHealthData();

        if (active) {
          setHealth(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to retrieve health observations."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const observations = useMemo(
    () =>
      [...(health?.data ?? [])].sort(
        (a, b) => Number(a.Mission_Day) - Number(b.Mission_Day)
      ),
    [health]
  );

  const latest = observations[observations.length - 1];

  const selectedRecord =
    observations.find(
      (record) =>
        Number(record.Mission_Day) === Number(selectedMissionDay)
    ) ?? latest;

  const metric = metrics.find(
    (item) => item.key === selectedMetric
  ) ?? metrics[0];

  const chartData = useMemo(
    () =>
      observations.map((record) => ({
        missionDay: Number(record.Mission_Day),
        value: numericValue(record, metric.key),
        phase: phaseLabel(record.Phase),
      })),
    [observations, metric]
  );

  const selectedValue = selectedRecord
    ? numericValue(selectedRecord, metric.key)
    : null;

  const baselineRecords = observations.filter(
    (record) => Number(record.Mission_Day) < 0
  );

  const baselineValues = baselineRecords
    .map((record) => numericValue(record, metric.key))
    .filter((value): value is number => value !== null);

  const baselineAverage =
    baselineValues.length > 0
      ? baselineValues.reduce((sum, value) => sum + value, 0) /
        baselineValues.length
      : null;

  const change =
    selectedValue !== null && baselineAverage !== null
      ? selectedValue - baselineAverage
      : null;

  const availableCount = chartData.filter(
    (point) => point.value !== null
  ).length;

  const categories = [...new Set(metrics.map((item) => item.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Orbit size={25} className="animate-spin text-cyan-400" />
        Loading longitudinal health observations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
        Unable to load health trends: {error}
      </div>
    );
  }

  if (!health || observations.length === 0) {
    return (
      <p className="py-12 text-slate-400">
        No health observations are available.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <Activity size={16} />
          Longitudinal monitoring
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Health Trends
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Explore how your recorded health measurements change
              throughout your mission.
            </p>
          </div>

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
            {observations.length} observations
          </span>
        </div>
      </header>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Database size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Synthetic demonstration dataset
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              These observations are simulated using NASA-sourced
              parameter ranges. They are not actual astronaut telemetry
              or clinical measurements. Missing observations are not
              interpolated.
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Selected observation
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            Day {selectedRecord?.Mission_Day ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedRecord
              ? phaseLabel(selectedRecord.Phase)
              : "Phase unavailable"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Recorded metric value
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatValue(selectedValue, metric.decimals)}
            <span className="ml-2 text-sm font-normal text-slate-400">
              {metric.unit}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metric.label}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Change from pre-flight average
          </p>

          <div className="mt-2 flex items-center gap-2">
            {change === null ? (
              <Minus size={21} className="text-slate-500" />
            ) : change > 0 ? (
              <TrendingUp size={21} className="text-cyan-400" />
            ) : change < 0 ? (
              <TrendingDown size={21} className="text-cyan-400" />
            ) : (
              <Minus size={21} className="text-slate-400" />
            )}

            <p className="text-2xl font-semibold text-white">
              {change === null
                ? "—"
                : `${change > 0 ? "+" : ""}${change.toFixed(
                    metric.decimals
                  )}`}
            </p>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {baselineAverage === null
              ? "No pre-flight reference available"
              : `Reference average: ${baselineAverage.toFixed(
                  metric.decimals
                )} ${metric.unit}`}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Metric explorer
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Observation history
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {metric.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Metric
              <select
                value={selectedMetric}
                onChange={(event) =>
                  setSelectedMetric(event.target.value)
                }
                className="min-w-52 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                {categories.map((category) => (
                  <optgroup key={category} label={category}>
                    {metrics
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Selected mission day
              <select
                value={
                  selectedRecord
                    ? String(selectedRecord.Mission_Day)
                    : ""
                }
                onChange={(event) =>
                  setSelectedMissionDay(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                  )
                }
                className="min-w-40 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                {observations.map((record) => (
                  <option
                    key={record.Mission_Day}
                    value={record.Mission_Day}
                  >
                    Day {record.Mission_Day}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-7 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 20, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#263449"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="missionDay"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `D${value}`}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
                domain={["auto", "auto"]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#f8fafc",
                }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value) => [
                  value === null || value === undefined
                    ? "No observation"
                    : `${Number(value).toFixed(metric.decimals)} ${metric.unit}`,
                  metric.label,
                ]}
                labelFormatter={(value, payload) => {
                  const phase = payload?.[0]?.payload?.phase;
                  return `Mission day ${value}${
                    phase ? ` · ${phase}` : ""
                  }`;
                }}
              />

              {baselineAverage !== null && (
                <ReferenceLine
                  y={baselineAverage}
                  stroke="#a78bfa"
                  strokeDasharray="5 5"
                  label={{
                    value: "Pre-flight average",
                    fill: "#c4b5fd",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              )}

              {selectedRecord && (
                <ReferenceLine
                  x={Number(selectedRecord.Mission_Day)}
                  stroke="#22d3ee"
                  strokeDasharray="4 4"
                />
              )}

              <Line
                type="monotone"
                dataKey="value"
                name={metric.label}
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "#0f172a", strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-0.5 w-5 bg-cyan-400" />
            Recorded measurements
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-violet-400" />
            Pre-flight average
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-cyan-300" />
            Selected observation
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {availableCount} of {observations.length} observations contain
          a numeric value for this metric. The chart shows recorded
          observations only; gaps are not filled or interpolated.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">
            Observation coverage
          </h3>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {observations.map((record) => {
            const selected =
              Number(record.Mission_Day) ===
              Number(selectedRecord?.Mission_Day);

            return (
              <button
                key={record.Mission_Day}
                type="button"
                onClick={() =>
                  setSelectedMissionDay(Number(record.Mission_Day))
                }
                title={`${phaseLabel(record.Phase)} · ${record.Status}`}
                className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 transition ${
                  selected
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-600"
                }`}
              >
                <span className="text-xs text-slate-300">
                  {record.Mission_Day}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    record.Status === "critical"
                      ? "bg-red-400"
                      : record.Status === "warning"
                      ? "bg-amber-400"
                      : record.Status === "normal"
                      ? "bg-emerald-400"
                      : "bg-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Select an observation to synchronize the mission-day context
          across ASTRA.
        </p>
      </section>

      <p className="text-xs leading-relaxed text-slate-600">
        These visualizations describe the supplied synthetic dataset.
        A change from a pre-flight average is descriptive, not a
        clinical assessment or diagnosis.
      </p>
    </div>
  );
}
