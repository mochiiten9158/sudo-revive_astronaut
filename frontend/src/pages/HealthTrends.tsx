
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
import { usePreferences } from "../context/PreferencesContext";

import type {
  HealthRecord,
  MyHealthResponse,
} from "../types/health";

import type { TranslationKey } from "../i18n/translations";

type MetricDefinition = {
  key: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  unit: string;
  categoryKey: TranslationKey;
  decimals: number;
};

const metrics: MetricDefinition[] = [
  {
    key: "Sleep_Duration_hours",
    labelKey: "trends.sleepDuration",
    descriptionKey: "trends.sleepDurationDescription",
    unit: "hours",
    categoryKey: "trends.behavioral",
    decimals: 1,
  },
  {
    key: "Sleep_Efficiency_pct",
    labelKey: "trends.sleepEfficiency",
    descriptionKey: "trends.sleepEfficiencyDescription",
    unit: "%",
    categoryKey: "trends.behavioral",
    decimals: 1,
  },
  {
    key: "Fatigue_Score_0_10",
    labelKey: "trends.fatigue",
    descriptionKey: "trends.fatigueDescription",
    unit: "/10",
    categoryKey: "trends.behavioral",
    decimals: 1,
  },
  {
    key: "Stress_Score_0_10",
    labelKey: "trends.stress",
    descriptionKey: "trends.stressDescription",
    unit: "/10",
    categoryKey: "trends.behavioral",
    decimals: 1,
  },
  {
    key: "Cognitive_Performance_Index",
    labelKey: "trends.cognitivePerformance",
    descriptionKey: "trends.cognitivePerformanceDescription",
    unit: "index",
    categoryKey: "trends.behavioral",
    decimals: 2,
  },
  {
    key: "Resting_HR_bpm",
    labelKey: "trends.restingHeartRate",
    descriptionKey: "trends.restingHeartRateDescription",
    unit: "bpm",
    categoryKey: "trends.cardiovascular",
    decimals: 1,
  },
  {
    key: "Systolic_BP_mmHg",
    labelKey: "trends.systolicBP",
    descriptionKey: "trends.systolicBPDescription",
    unit: "mmHg",
    categoryKey: "trends.cardiovascular",
    decimals: 1,
  },
  {
    key: "Diastolic_BP_mmHg",
    labelKey: "trends.diastolicBP",
    descriptionKey: "trends.diastolicBPDescription",
    unit: "mmHg",
    categoryKey: "trends.cardiovascular",
    decimals: 1,
  },
  {
    key: "SpO2_pct",
    labelKey: "trends.bloodOxygen",
    descriptionKey: "trends.bloodOxygenDescription",
    unit: "%",
    categoryKey: "trends.cardiovascular",
    decimals: 1,
  },
  {
    key: "Bone_Density_Index_pct_Baseline",
    labelKey: "trends.boneDensity",
    descriptionKey: "trends.boneDensityDescription",
    unit: "% of baseline",
    categoryKey: "trends.physical",
    decimals: 1,
  },
  {
    key: "Muscle_Mass_Index_pct_Baseline",
    labelKey: "trends.muscleMass",
    descriptionKey: "trends.muscleMassDescription",
    unit: "% of baseline",
    categoryKey: "trends.physical",
    decimals: 1,
  },
  {
    key: "Muscle_Strength_Index_pct_Baseline",
    labelKey: "trends.muscleStrength",
    descriptionKey: "trends.muscleStrengthDescription",
    unit: "% of baseline",
    categoryKey: "trends.physical",
    decimals: 1,
  },
  {
    key: "VO2max_Index_pct_Baseline",
    labelKey: "trends.vo2max",
    descriptionKey: "trends.vo2maxDescription",
    unit: "% of baseline",
    categoryKey: "trends.physical",
    decimals: 1,
  },
  {
    key: "Exercise_Adherence_pct",
    labelKey: "trends.exerciseAdherence",
    descriptionKey: "trends.exerciseAdherenceDescription",
    unit: "%",
    categoryKey: "trends.physical",
    decimals: 1,
  },
  {
    key: "Daily_Radiation_mSv",
    labelKey: "trends.dailyRadiation",
    descriptionKey: "trends.dailyRadiationDescription",
    unit: "mSv",
    categoryKey: "trends.radiation",
    decimals: 3,
  },
  {
    key: "Cumulative_Mission_Dose_mSv",
    labelKey: "trends.cumulativeRadiation",
    descriptionKey: "trends.cumulativeRadiationDescription",
    unit: "mSv",
    categoryKey: "trends.radiation",
    decimals: 2,
  },
  {
    key: "Career_Dose_Pct_of_600mSv_Limit",
    labelKey: "trends.careerDose",
    descriptionKey: "trends.careerDoseDescription",
    unit: "% of reference limit",
    categoryKey: "trends.radiation",
    decimals: 1,
  },
  {
    key: "Vitamin_D_ng_mL",
    labelKey: "trends.vitaminD",
    descriptionKey: "trends.vitaminDDescription",
    unit: "ng/mL",
    categoryKey: "trends.nutrition",
    decimals: 1,
  },
  {
    key: "Homocysteine_umol_L",
    labelKey: "trends.homocysteine",
    descriptionKey: "trends.homocysteineDescription",
    unit: "µmol/L",
    categoryKey: "trends.nutrition",
    decimals: 2,
  },
  {
    key: "CRP_mg_L",
    labelKey: "trends.crp",
    descriptionKey: "trends.crpDescription",
    unit: "mg/L",
    categoryKey: "trends.immune",
    decimals: 2,
  },
];

function numericValue(
  record: HealthRecord,
  key: string
): number | null {
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

function translatedUnit(
  unit: string,
  t: (key: TranslationKey) => string
): string {
  if (unit === "hours") return t("trends.hours");
  if (unit === "index") return t("trends.index");
  if (unit === "% of baseline") return t("trends.percentBaseline");
  if (unit === "% of reference limit") return t("trends.percentReference");
  return unit;
}

export default function HealthTrends() {
  const { t } = usePreferences();

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

  const metric =
    metrics.find((item) => item.key === selectedMetric) ?? metrics[0];

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

  const categories = [
    ...new Set(metrics.map((item) => item.categoryKey)),
  ];

  const unit = translatedUnit(metric.unit, t);
  const metricLabel = t(metric.labelKey);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Orbit size={25} className="animate-spin text-cyan-400" />
        {t("trends.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
        {t("trends.loadError")}: {error}
      </div>
    );
  }

  if (!health || observations.length === 0) {
    return (
      <p className="py-12 text-slate-400">
        {t("trends.noData")}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <Activity size={16} />
          {t("trends.monitoring")}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              {t("trends.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t("trends.description")}
            </p>
          </div>

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
            {observations.length} {t("trends.observations")}
          </span>
        </div>
      </header>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Database
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {t("trends.syntheticTitle")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {t("trends.syntheticNotice")}
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {t("trends.selectedObservation")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {t("trends.day")} {selectedRecord?.Mission_Day ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedRecord
              ? phaseLabel(selectedRecord.Phase)
              : t("trends.phaseUnavailable")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {t("trends.recordedMetric")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatValue(selectedValue, metric.decimals)}
            <span className="ml-2 text-sm font-normal text-slate-400">
              {unit}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metricLabel}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {t("trends.changeFromBaseline")}
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
              ? t("trends.noBaseline")
              : `${t("trends.referenceAverage")}: ${baselineAverage.toFixed(
                  metric.decimals
                )} ${unit}`}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              {t("trends.metricExplorer")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {t("trends.history")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t(metric.descriptionKey)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              {t("trends.metric")}
              <select
                value={selectedMetric}
                onChange={(event) =>
                  setSelectedMetric(event.target.value)
                }
                className="min-w-52 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                {categories.map((categoryKey) => (
                  <optgroup
                    key={categoryKey}
                    label={t(categoryKey)}
                  >
                    {metrics
                      .filter(
                        (item) => item.categoryKey === categoryKey
                      )
                      .map((item) => (
                        <option key={item.key} value={item.key}>
                          {t(item.labelKey)}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-slate-400">
              {t("trends.selectedMissionDay")}
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
                    {t("trends.day")} {record.Mission_Day}
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
                    ? t("trends.noObservation")
                    : `${Number(value).toFixed(metric.decimals)} ${unit}`,
                  metricLabel,
                ]}
                labelFormatter={(value, payload) => {
                  const phase = payload?.[0]?.payload?.phase;
                  return `${t("trends.missionDay")} ${value}${
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
                    value: t("trends.preflightAverage"),
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
                name={metricLabel}
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
            {t("trends.recordedMeasurements")}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-violet-400" />
            {t("trends.preflightAverage")}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-cyan-300" />
            {t("trends.selectedObservationLegend")}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {t("trends.numericCoverage")}: {availableCount} /{" "}
          {observations.length}. {t("trends.numericCoverageEnd")}
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">
            {t("trends.coverage")}
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
                aria-pressed={selected}
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
          {t("trends.coverageDescription")}
        </p>
      </section>

      <p className="text-xs leading-relaxed text-slate-600">
        {t("trends.disclaimer")}
      </p>
    </div>
  );
}
