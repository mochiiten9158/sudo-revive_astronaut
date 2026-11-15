
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Minus,
  RefreshCw,
  Scale,
  Bone,
  HeartPulse,
  Moon,
  Brain,
  Utensils,
  Droplets,
  Database,
  Info,
} from "lucide-react";

import { getMyHealthData } from "../services/api";
import { useMissionDay } from "../context/MissionDayContext";
import type { MyHealthResponse } from "../types/health";

type MetricDefinition = {
  key: string;
  label: string;
  unit: string;
  description: string;
  group: string;
  lowerIsBetter?: boolean;
  alreadyBaselinePercent?: boolean;
  digits?: number;
};

const metricGroups = [
  {
    key: "physical",
    label: "Body composition",
    description: "Body mass and physical composition",
    icon: Scale,
    color: "text-cyan-400",
    metrics: [
      {
        key: "Body_Mass_kg",
        label: "Body mass",
        unit: "kg",
        description: "Measured body mass",
        group: "physical",
        digits: 1,
      },
      {
        key: "Body_Mass_pct_Baseline",
        label: "Body mass",
        unit: "% of baseline",
        description: "Body mass relative to the recorded baseline",
        group: "physical",
        alreadyBaselinePercent: true,
        digits: 1,
      },
      {
        key: "BMI_kg_m2",
        label: "BMI",
        unit: "kg/m²",
        description: "Body mass index",
        group: "physical",
        digits: 1,
      },
      {
        key: "Muscle_Mass_Index_pct_Baseline",
        label: "Muscle mass index",
        unit: "% of baseline",
        description: "Muscle mass index relative to baseline",
        group: "physical",
        alreadyBaselinePercent: true,
        digits: 1,
      },
    ],
  },
  {
    key: "bone",
    label: "Bone and muscle health",
    description: "Bone density, strength, and exercise",
    icon: Bone,
    color: "text-violet-400",
    metrics: [
      {
        key: "Bone_Density_Index_pct_Baseline",
        label: "Bone density index",
        unit: "% of baseline",
        description: "Bone density relative to pre-flight baseline",
        group: "bone",
        alreadyBaselinePercent: true,
        digits: 1,
      },
      {
        key: "Muscle_Strength_Index_pct_Baseline",
        label: "Muscle strength index",
        unit: "% of baseline",
        description: "Muscle strength relative to baseline",
        group: "bone",
        alreadyBaselinePercent: true,
        digits: 1,
      },
      {
        key: "Grip_Strength_pct_Baseline",
        label: "Grip strength",
        unit: "% of baseline",
        description: "Grip strength relative to baseline",
        group: "bone",
        alreadyBaselinePercent: true,
        digits: 1,
      },
      {
        key: "VO2max_Index_pct_Baseline",
        label: "VO₂ max index",
        unit: "% of baseline",
        description: "Aerobic capacity relative to baseline",
        group: "bone",
        alreadyBaselinePercent: true,
        digits: 1,
      },
    ],
  },
  {
    key: "cardiovascular",
    label: "Cardiovascular",
    description: "Heart rate, blood pressure, and oxygen saturation",
    icon: HeartPulse,
    color: "text-rose-400",
    metrics: [
      {
        key: "Resting_HR_bpm",
        label: "Resting heart rate",
        unit: "bpm",
        description: "Resting heart rate",
        group: "cardiovascular",
        digits: 0,
      },
      {
        key: "Systolic_BP_mmHg",
        label: "Systolic blood pressure",
        unit: "mmHg",
        description: "Systolic blood pressure",
        group: "cardiovascular",
        digits: 0,
      },
      {
        key: "Diastolic_BP_mmHg",
        label: "Diastolic blood pressure",
        unit: "mmHg",
        description: "Diastolic blood pressure",
        group: "cardiovascular",
        digits: 0,
      },
      {
        key: "SpO2_pct",
        label: "Oxygen saturation",
        unit: "%",
        description: "Peripheral oxygen saturation",
        group: "cardiovascular",
        digits: 1,
      },
    ],
  },
  {
    key: "sleep",
    label: "Sleep and recovery",
    description: "Sleep duration, quality, and fatigue",
    icon: Moon,
    color: "text-indigo-400",
    metrics: [
      {
        key: "Sleep_Duration_hours",
        label: "Sleep duration",
        unit: "hours",
        description: "Recorded sleep duration",
        group: "sleep",
        digits: 1,
      },
      {
        key: "Sleep_Efficiency_pct",
        label: "Sleep efficiency",
        unit: "%",
        description: "Percentage of time in bed spent asleep",
        group: "sleep",
        digits: 1,
      },
      {
        key: "Sleep_Quality_Score",
        label: "Sleep quality",
        unit: "score",
        description: "Recorded sleep quality score",
        group: "sleep",
        digits: 1,
      },
      {
        key: "Fatigue_Score_0_10",
        label: "Fatigue",
        unit: "/10",
        description: "Self-reported fatigue score",
        group: "sleep",
        lowerIsBetter: true,
        digits: 1,
      },
    ],
  },
  {
    key: "cognitive",
    label: "Cognitive and behavioral",
    description: "Cognitive performance, stress, and mood",
    icon: Brain,
    color: "text-amber-400",
    metrics: [
      {
        key: "Cognitive_Performance_Index",
        label: "Cognitive performance",
        unit: "index",
        description: "Recorded cognitive performance index",
        group: "cognitive",
        digits: 1,
      },
      {
        key: "PVT_Reaction_Time_ms",
        label: "Reaction time",
        unit: "ms",
        description: "Psychomotor vigilance reaction time",
        group: "cognitive",
        lowerIsBetter: true,
        digits: 1,
      },
      {
        key: "Stress_Score_0_10",
        label: "Stress",
        unit: "/10",
        description: "Self-reported stress score",
        group: "cognitive",
        lowerIsBetter: true,
        digits: 1,
      },
      {
        key: "Mood_Score_0_10",
        label: "Mood",
        unit: "/10",
        description: "Self-reported mood score",
        group: "cognitive",
        digits: 1,
      },
    ],
  },
  {
    key: "nutrition",
    label: "Nutrition and hydration",
    description: "Fluid intake and selected nutritional markers",
    icon: Utensils,
    color: "text-emerald-400",
    metrics: [
      {
        key: "Water_Intake_L",
        label: "Water intake",
        unit: "L",
        description: "Recorded daily water intake",
        group: "nutrition",
        digits: 1,
      },
      {
        key: "Caloric_Intake_kcal",
        label: "Caloric intake",
        unit: "kcal",
        description: "Recorded caloric intake",
        group: "nutrition",
        digits: 0,
      },
      {
        key: "Vitamin_D_ng_mL",
        label: "Vitamin D",
        unit: "ng/mL",
        description: "Recorded vitamin D concentration",
        group: "nutrition",
        digits: 1,
      },
      {
        key: "Homocysteine_umol_L",
        label: "Homocysteine",
        unit: "µmol/L",
        description: "Recorded homocysteine concentration",
        group: "nutrition",
        lowerIsBetter: true,
        digits: 1,
      },
    ],
  },
] satisfies {
  key: string;
  label: string;
  description: string;
  icon: typeof Activity;
  color: string;
  metrics: MetricDefinition[];
}[];

function numericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatValue(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}

function formatChange(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

function getChangeIcon(change: number) {
  if (Math.abs(change) < 0.000001) return Minus;
  return change > 0 ? ArrowUp : ArrowDown;
}

function getChangeColor(change: number, lowerIsBetter = false) {
  if (Math.abs(change) < 0.000001) return "text-slate-400";
  const favorable = lowerIsBetter ? change < 0 : change > 0;
  return favorable ? "text-emerald-400" : "text-amber-400";
}

function MetricCard({
  metric,
  baseline,
  current,
  baselineCount,
}: {
  metric: MetricDefinition;
  baseline: number | null;
  current: number | null;
  baselineCount: number;
}) {
  const difference =
    baseline !== null && current !== null ? current - baseline : null;

  const percentageChange =
    difference !== null && baseline !== null && baseline !== 0
      ? (difference / Math.abs(baseline)) * 100
      : null;

  const Icon = difference === null ? Minus : getChangeIcon(difference);
  const color =
    difference === null
      ? "text-slate-500"
      : getChangeColor(difference, metric.lowerIsBetter);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-200">
            {metric.label}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metric.description}
          </p>
        </div>
        <Icon size={17} className={color} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Pre-flight average
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-300 tabular-nums">
            {formatValue(baseline, metric.digits)}
          </p>
          <p className="text-xs text-slate-500">{metric.unit}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Selected observation
          </p>
          <p className="mt-1 text-xl font-semibold text-white tabular-nums">
            {formatValue(current, metric.digits)}
          </p>
          <p className="text-xs text-slate-500">{metric.unit}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3">
        {baseline === null || current === null ? (
          <p className="text-xs text-slate-500">
            Insufficient recorded values for comparison
          </p>
        ) : metric.alreadyBaselinePercent ? (
          <div>
            <p className="text-xs text-slate-400">
              Recorded relative to baseline
            </p>
            <p className={`mt-1 text-sm font-semibold ${color}`}>
              {formatValue(current, metric.digits)}% of baseline
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">Absolute change</p>
              <p className={`mt-1 text-sm font-semibold ${color}`}>
                {formatChange(difference ?? 0, metric.digits)} {metric.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Relative change</p>
              <p className={`mt-1 text-sm font-semibold ${color}`}>
                {percentageChange === null
                  ? "—"
                  : `${formatChange(percentageChange, 1)}%`}
              </p>
            </div>
          </div>
        )}
      </div>

      {baselineCount < 2 && (
        <p className="mt-3 text-[11px] text-amber-400">
          Limited pre-flight reference
        </p>
      )}
    </div>
  );
}

export default function PersonalBaseline() {
  const [health, setHealth] = useState<MyHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedMissionDay } = useMissionDay();

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyHealthData();

        if (active) {
          setHealth(response);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load baseline data.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const observations = useMemo(() => {
    return [...(health?.data ?? [])].sort(
      (a, b) => a.Mission_Day - b.Mission_Day,
    );
  }, [health]);

  const baselineRecords = useMemo(
    () => observations.filter((record) => record.Mission_Day < 0),
    [observations],
  );

  const selectedRecord = useMemo(() => {
    if (observations.length === 0) return null;

    if (selectedMissionDay === null) {
      return observations[observations.length - 1];
    }

    return (
      observations.find(
        (record) => record.Mission_Day === selectedMissionDay,
      ) ?? null
    );
  }, [observations, selectedMissionDay]);

  const baselineAverages = useMemo(() => {
    const result: Record<string, number | null> = {};

    for (const group of metricGroups) {
      for (const metric of group.metrics) {
        const values = baselineRecords
          .map((record) => numericValue(record[metric.key]))
          .filter((value): value is number => value !== null);

        result[metric.key] = average(values);
      }
    }

    return result;
  }, [baselineRecords]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Loading personal baseline...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
        <div className="flex items-center gap-3 text-rose-300">
          <AlertCircle size={20} />
          <p className="font-medium">Unable to load personal baseline</p>
        </div>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health || observations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <Database size={28} className="mx-auto text-slate-500" />
        <h2 className="mt-3 text-lg font-semibold text-white">
          No observations available
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Personal baseline comparisons will appear when health observations
          are available.
        </p>
      </div>
    );
  }

  const isSynthetic =
    health.is_synthetic ||
    observations.some((record) => record.Is_Synthetic === true);

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Activity size={19} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Personal health reference
              </span>
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
              Individual baseline
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Personal Baseline
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Understand how recorded health measurements compare with your
            own pre-flight reference. Changes are measured against your
            individual history rather than a generic population average.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
              <p className="text-xs text-slate-500">Pre-flight observations</p>
              <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                {baselineRecords.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
              <p className="text-xs text-slate-500">Selected mission day</p>
              <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                {selectedRecord
                  ? selectedRecord.Mission_Day > 0
                    ? `+${selectedRecord.Mission_Day}`
                    : selectedRecord.Mission_Day
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
              <p className="text-xs text-slate-500">Recorded observations</p>
              <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                {observations.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isSynthetic && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Synthetic demonstration data
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              These measurements are simulated for demonstration. They are
              not actual astronaut health records and must not be interpreted
              as clinical findings.
            </p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-cyan-400" />
          <h2 className="font-semibold text-white">How your baseline is calculated</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          The reference is calculated from available observations before
          mission day 0. Each metric uses the mean of its available pre-flight
          values. The selected observation is compared with that reference.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">Reference observations</p>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {baselineRecords.length > 0
                ? baselineRecords
                    .map((record) => `Day ${record.Mission_Day}`)
                    .join(" · ")
                : "No pre-flight observations found"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">Comparison target</p>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {selectedRecord
                ? `Mission day ${selectedRecord.Mission_Day}`
                : "No observation for selected day"}
            </p>
          </div>
        </div>
        {baselineRecords.length < 2 && (
          <p className="mt-3 text-xs text-amber-400">
            Fewer than two pre-flight observations are available. Interpret
            comparisons cautiously.
          </p>
        )}
      </section>

      {!selectedRecord ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle size={18} />
            <p className="font-medium">No observation for this mission day</p>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Select a mission day with a recorded observation to compare it
            against your pre-flight reference.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Baseline comparisons
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Selected observation: {selectedRecord.Phase} · Mission day{" "}
                {selectedRecord.Mission_Day}
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
              {baselineRecords.length} reference records
            </span>
          </div>

          {metricGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <section key={group.key} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                    <GroupIcon size={18} className={group.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{group.label}</h3>
                    <p className="text-xs text-slate-500">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.metrics.map((metric) => (
                    <MetricCard
                      key={metric.key}
                      metric={metric}
                      baseline={baselineAverages[metric.key] ?? null}
                      current={numericValue(selectedRecord[metric.key])}
                      baselineCount={
                        baselineRecords.filter(
                          (record) =>
                            numericValue(record[metric.key]) !== null,
                        ).length
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-cyan-400" />
          <h2 className="font-semibold text-white">Reading the comparisons</h2>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-400">
          <p>
            <span className="font-medium text-emerald-400">Green changes</span>{" "}
            indicate movement in the generally favorable direction for the
            metric's configured comparison rule. They do not establish
            clinical improvement.
          </p>
          <p>
            <span className="font-medium text-amber-400">Amber changes</span>{" "}
            indicate movement in the opposite direction. They are comparison
            cues, not medical alerts or diagnoses.
          </p>
          <p>
            Metrics already recorded as a percentage of baseline are shown
            directly. They are not recalculated as a percentage change from
            the pre-flight average.
          </p>
          <p>
            Missing measurements are left blank. The page does not interpolate
            values between observation dates.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-slate-600">
        Personal reference comparisons are informational and do not replace
        medical evaluation or mission health protocols.
      </p>
    </div>
  );
}