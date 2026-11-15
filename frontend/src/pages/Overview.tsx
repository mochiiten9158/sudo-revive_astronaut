
import { useEffect, useState } from "react";
import { useMissionDay } from "../context/MissionDayContext";

import {
  Activity,
  Moon,
  BatteryWarning,
  Dumbbell,
  Brain,
  Wind,
  Thermometer,
  Microscope,
  Bone,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CircleDot,
  ShieldAlert,
  Sparkles,
  Clock3,
  Database,
  UserRound,
  Orbit,
} from "lucide-react";

import { getMyHealthData, getMyAlerts } from "../services/api";
import type {
  MyHealthResponse,
  MyAlertsResponse,
  HealthRecord,
  HealthAlert,
  HealthStatus,
} from "../types/health";

import type { LucideIcon } from "lucide-react";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const statusStyles: Record<HealthStatus, string> = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
  unknown: "text-slate-400",
};

const statusDots: Record<HealthStatus, string> = {
  normal: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
  unknown: "bg-slate-500",
};

function formatValue(value: unknown, decimals = 1): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return numericValue.toFixed(decimals);
}

function getNumericValue(
  record: HealthRecord,
  field: string
): number | null {
  const value = record[field];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeStatus(value: unknown): HealthStatus {
  const status = String(value ?? "unknown").toLowerCase();

  if (
    status === "normal" ||
    status === "warning" ||
    status === "critical"
  ) {
    return status;
  }

  return "unknown";
}

function formatPhase(phase: string): string {
  return phase.replaceAll("_", " ").replaceAll("-", " ");
}

function formatDataOrigin(
  origin: string | string[] | null
): string {
  if (!origin) {
    return "Not specified";
  }

  return Array.isArray(origin) ? origin.join(", ") : origin;
}

// --------------------------------------------------
// STATUS INDICATOR
// --------------------------------------------------

function StatusIndicator({ status }: { status: HealthStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span
        className={`h-2.5 w-2.5 rounded-full ${statusDots[status]}`}
      />
      <span className={statusStyles[status]}>
        {status.toUpperCase()}
      </span>
    </span>
  );
}

// --------------------------------------------------
// SYMBOL-BASED HEALTH METRIC
// --------------------------------------------------

interface MetricItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  description: string;
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
  description,
}: MetricItemProps) {
  return (
    <div className="group flex min-w-0 gap-4 py-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-cyan-400 transition group-hover:bg-cyan-500/10">
        <Icon size={21} strokeWidth={1.7} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {value}
          </span>

          <span className="text-xs text-slate-400">
            {unit}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// ALERT ITEM
// --------------------------------------------------

function AlertItem({ alert }: { alert: HealthAlert }) {
  const status = normalizeStatus(alert.severity);

  const iconColor =
    status === "critical"
      ? "text-red-400"
      : status === "warning"
      ? "text-amber-400"
      : "text-slate-400";

  return (
    <div className="flex items-start gap-4 border-b border-slate-800/80 py-4 last:border-0">
      <div className={`mt-0.5 ${iconColor}`}>
        <ShieldAlert size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-medium text-slate-100">
            {alert.title}
          </h4>

          <StatusIndicator status={status} />
        </div>

        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {alert.message}
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Mission day {alert.mission_day} ·{" "}
          {alert.phase ? formatPhase(alert.phase) : "Phase unavailable"}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// TIMELINE ITEM
// --------------------------------------------------

function TimelineItem({
  record,
  selected,
  latest,
  onSelect,
}: {
  record: HealthRecord;
  selected: boolean;
  latest: boolean;
  onSelect: () => void;
}) {
  const status = normalizeStatus(record.Status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 border-b border-slate-800/70 py-4 text-left transition last:border-0 ${
        selected ? "bg-cyan-500/5" : "hover:bg-slate-800/30"
      }`}
    >
      <div className="flex w-8 shrink-0 justify-center">
        <span
          className={`h-3 w-3 rounded-full ${statusDots[status]} ${
            selected ? "ring-4 ring-cyan-500/20" : ""
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">
            Day {record.Mission_Day}
          </span>

          {selected && (
            <span className="text-xs text-cyan-400">
              Selected
            </span>
          )}

          {latest && (
            <span className="text-xs text-slate-500">
              Latest
            </span>
          )}
        </div>

        <p className="mt-1 text-xs capitalize text-slate-500">
          {formatPhase(record.Phase)}
        </p>
      </div>

      <StatusIndicator status={status} />
    </button>
  );
}

// --------------------------------------------------
// OVERVIEW PAGE
// --------------------------------------------------

export default function Overview() {
  const [health, setHealth] = useState<MyHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertsResponse, setAlertsResponse] =
    useState<MyAlertsResponse | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const {
  selectedMissionDay: selectedDay,
  setSelectedMissionDay: setSelectedDay,
  } = useMissionDay();

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
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
              : "Could not load astronaut health data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
  if (!health || health.data.length === 0) {
    setAlertsResponse(null);
    return;
  }

  let active = true;

  async function loadSelectedDayAlerts() {
    try {
      setAlertsLoading(true);
      setAlertsError(null);

      const observations = [...(health?.data ?? [])].sort(
        (a, b) => Number(a.Mission_Day) - Number(b.Mission_Day)
      );

      const latest = observations[observations.length - 1];

      const selectedRecord =
        observations.find(
          (record) => Number(record.Mission_Day) === Number(selectedDay)
        ) ?? latest;

      const missionDay = Number(selectedRecord.Mission_Day);
      const result = await getMyAlerts(missionDay);

      if (active) {
        setAlertsResponse(result);
      }
    } catch (err) {
      if (active) {
        setAlertsResponse(null);
        setAlertsError(
          err instanceof Error
            ? err.message
            : "Could not load alerts for this mission day."
        );
      }
    } finally {
      if (active) {
        setAlertsLoading(false);
      }
    }
  }

  loadSelectedDayAlerts();

  return () => {
    active = false;
  };
}, [health, selectedDay]);

  // --------------------------------------------------
  // LOADING AND ERROR STATES
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Orbit size={34} className="mb-4 animate-spin text-cyan-400" />
        <p>Initializing ASTRA health systems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 py-10 text-red-400">
        <ShieldAlert size={24} />
        <div>
          <p className="font-semibold">
            Unable to load health dashboard
          </p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!health || health.data.length === 0) {
    return (
      <p className="py-10 text-slate-400">
        No astronaut health data is available.
      </p>
    );
  }

  // --------------------------------------------------
  // PREPARE OBSERVATIONS
  // --------------------------------------------------

  const observations = [...health.data].sort(
    (a, b) => Number(a.Mission_Day) - Number(b.Mission_Day)
  );

  const missionDays = [
    ...new Set(observations.map((record) => Number(record.Mission_Day)))
  ];

  const latest = observations[observations.length - 1];

  const selectedRecord =
    observations.find(
      (record) => Number(record.Mission_Day) === selectedDay
    ) ?? latest;

  const selectedIndex = observations.findIndex(
    (record) =>
      Number(record.Mission_Day) === Number(selectedRecord.Mission_Day)
  );

  const isLatest =
    Number(selectedRecord.Mission_Day) === Number(latest.Mission_Day);

  const currentStatus = normalizeStatus(selectedRecord.Status);
  // --------------------------------------------------
  // SELECTED DAY ALERTS
  // --------------------------------------------------

  const selectedAlerts: HealthAlert[] =
  alertsResponse?.alerts ?? [];

  const sortedAlerts = [...selectedAlerts].sort((a, b) => {
    const priority: Record<HealthStatus, number> = {
      critical: 0,
      warning: 1,
      normal: 2,
      unknown: 3,
    };

    return priority[a.severity] - priority[b.severity];
  });

  // --------------------------------------------------
  // HEALTH INDICATORS
  // --------------------------------------------------

  const indicators: MetricItemProps[] = [
    {
      icon: Moon,
      label: "Sleep duration",
      value: formatValue(
        getNumericValue(selectedRecord, "Sleep_Duration_hours"),
        2
      ),
      unit: "hours",
      description: "Recorded sleep duration",
    },
    {
      icon: BatteryWarning,
      label: "Fatigue",
      value: formatValue(
        getNumericValue(selectedRecord, "Fatigue_Score_0_10"),
        2
      ),
      unit: "/10",
      description: "Reported fatigue score",
    },
    {
      icon: Dumbbell,
      label: "Exercise adherence",
      value: formatValue(
        getNumericValue(selectedRecord, "Exercise_Adherence_pct"),
        1
      ),
      unit: "%",
      description: "Exercise adherence",
    },
    {
      icon: Brain,
      label: "Cognitive performance",
      value: formatValue(
        getNumericValue(selectedRecord, "Cognitive_Performance_Index"),
        1
      ),
      unit: "index",
      description: "Cognitive performance measure",
    },
    {
      icon: Wind,
      label: "Cabin CO₂",
      value: formatValue(
        getNumericValue(selectedRecord, "Cabin_CO2_ppm"),
        1
      ),
      unit: "ppm",
      description: "Environmental measurement",
    },
    {
      icon: Thermometer,
      label: "Body temperature",
      value: formatValue(
        getNumericValue(selectedRecord, "Body_Temperature_C"),
        2
      ),
      unit: "°C",
      description: "Recorded body temperature",
    },
    {
      icon: Microscope,
      label: "CRP",
      value: formatValue(
        getNumericValue(selectedRecord, "CRP_mg_L"),
        2
      ),
      unit: "mg/L",
      description: "Inflammation marker",
    },
    {
      icon: Bone,
      label: "Bone density index",
      value: formatValue(
        getNumericValue(
          selectedRecord,
          "Bone_Density_Index_pct_Baseline"
        ),
        1
      ),
      unit: "%",
      description: "Relative to baseline",
    },
    {
      icon: Activity,
      label: "Muscle strength index",
      value: formatValue(
        getNumericValue(
          selectedRecord,
          "Muscle_Strength_Index_pct_Baseline"
        ),
        1
      ),
      unit: "%",
      description: "Relative to baseline",
    },
  ];

  // --------------------------------------------------
  // TIMELINE CONTEXT
  // --------------------------------------------------

  const timelineRecords = observations
    .filter(
      (record) =>
        Number(record.Mission_Day) <=
        Number(selectedRecord.Mission_Day)
    )
    .slice(-5)
    .reverse();

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  function selectPreviousDay() {
    if (selectedIndex > 0) {
      setSelectedDay(Number(observations[selectedIndex - 1].Mission_Day));
    }
  }

  function selectNextDay() {
    if (selectedIndex < observations.length - 1) {
      setSelectedDay(Number(observations[selectedIndex + 1].Mission_Day));
    }
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="space-y-10">

      {/* HEADER */}

      <section className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            <Orbit size={15} />
            ASTRA / Personal Health
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Mission Health Overview
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Welcome, {health.display_name}
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <UserRound size={18} />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Astronaut ID
            </p>
            <p className="text-sm font-semibold text-white">
              {health.astronaut_id}
            </p>
          </div>
        </div>
      </section>

      {/* SYNTHETIC DATA NOTICE */}

      {health.is_synthetic && (
        <section className="flex items-start gap-3 border-l-2 border-amber-400/70 py-2 pl-4">
          <Sparkles size={19} className="mt-0.5 shrink-0 text-amber-400" />

          <div>
            <p className="text-sm font-semibold text-amber-300">
              Synthetic demonstration profile
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              This dashboard displays simulated astronaut health data,
              not actual astronaut measurements. Dataset-reported statuses
              and alerts are illustrative and are not clinical diagnoses
              or independently validated medical thresholds.
            </p>
          </div>
        </section>
      )}

      {/* MISSION DAY SELECTOR */}

      <section className="border-y border-slate-800 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6">

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <CalendarDays size={15} />
              Mission timeline navigator
            </p>

            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <h3 className="text-4xl font-semibold tracking-tight text-white">
                Day {selectedRecord.Mission_Day}
              </h3>

              <span className="text-sm capitalize text-slate-400">
                {formatPhase(selectedRecord.Phase)}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <StatusIndicator status={currentStatus} />

              {!isLatest && (
                <span className="text-xs text-cyan-400">
                  Historical observation
                </span>
              )}

              {isLatest && (
                <span className="text-xs text-slate-500">
                  Latest observation
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              onClick={selectPreviousDay}
              disabled={selectedIndex <= 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous observation"
            >
              <ChevronLeft size={20} />
            </button>

            <select
              value={selectedRecord.Mission_Day}
              onChange={(event) =>
                setSelectedDay(Number(event.target.value))
              }
              className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-cyan-500"
              aria-label="Select mission day"
            >
              {missionDays.map((day) => {
                const record = observations.find(
                  (item) => Number(item.Mission_Day) === day
                );

                return (
                  <option key={day} value={day}>
                    Day {day} · {record ? formatPhase(record.Phase) : ""}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={selectNextDay}
              disabled={selectedIndex >= observations.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next observation"
            >
              <ChevronRight size={20} />
            </button>

            {!isLatest && (
              <button
                type="button"
                onClick={() =>
                  setSelectedDay(Number(latest.Mission_Day))
                }
                className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Latest day
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Observation {selectedIndex + 1} of {observations.length}
          </span>
          <span>
            {missionDays.length} available mission days
          </span>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-300"
            style={{
              width: `${
                observations.length > 1
                  ? (selectedIndex / (observations.length - 1)) * 100
                  : 100
              }%`,
            }}
          />
        </div>
      </section>

      {/* STATUS SUMMARY */}

      <section className="grid grid-cols-2 gap-6 border-b border-slate-800 pb-7 md:grid-cols-4">

        <div>
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <CircleDot size={17} />
            <span className="text-xs uppercase tracking-wider">
              Dataset status
            </span>
          </div>
          <StatusIndicator status={currentStatus} />
          <p className="mt-2 text-xs text-slate-500">
            Selected observation
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <ShieldAlert size={17} />
            <span className="text-xs uppercase tracking-wider">
              Reported flags
            </span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {sortedAlerts.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Selected observation
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Clock3 size={17} />
            <span className="text-xs uppercase tracking-wider">
              Mission day
            </span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {selectedRecord.Mission_Day}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {formatPhase(selectedRecord.Phase)}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Database size={17} />
            <span className="text-xs uppercase tracking-wider">
              Observations
            </span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {health.observations}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Personal records
          </p>
        </div>

      </section>

      {/* HEALTH INDICATORS */}

      <section>
        <div className="mb-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <Activity size={16} />
            Health systems
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Physiological and environmental indicators
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Measurements recorded on mission day {selectedRecord.Mission_Day}.
            Values are displayed as recorded and are not independently
            classified as clinically normal or abnormal.
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-800/70 sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 xl:grid-cols-3">
          {indicators.map((indicator) => (
            <MetricItem
              key={indicator.label}
              {...indicator}
            />
          ))}
        </div>
      </section>

      {/* ALERTS */}

      <section>
        <div className="mb-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <ShieldAlert size={16} />
            Health flags
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Observation-specific alerts
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Dataset-reported flags for mission day {selectedRecord.Mission_Day}.
          </p>
        </div>

        {alertsLoading ? (
  <div className="flex items-center gap-3 py-5 text-slate-400">
    <Orbit size={18} className="animate-spin text-cyan-400" />
    <p className="text-sm">
      Retrieving flags for mission day {selectedRecord.Mission_Day}...
    </p>
  </div>
) : alertsError ? (
  <div className="flex items-start gap-3 py-5">
    <ShieldAlert size={20} className="mt-0.5 text-amber-400" />
    <div>
      <p className="text-sm font-medium text-amber-300">
        Unable to retrieve observation flags.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {alertsError}
      </p>
    </div>
  </div>
) : sortedAlerts.length > 0 ? (
  <div>
    {sortedAlerts.map((alert, index) => (
      <AlertItem
        key={`${alert.mission_day}-${alert.title}-${index}`}
        alert={alert}
      />
    ))}
  </div>
) : (
  <div className="flex items-start gap-3 py-5">
    <CircleDot size={20} className="mt-0.5 text-emerald-400" />

    <div>
      <p className="text-sm font-medium text-slate-200">
        No dataset-reported flags for this observation.
      </p>

      <p className="mt-1 text-xs text-slate-500">
        This does not independently establish that all health
        measurements are clinically normal.
      </p>
    </div>
  </div>
)}
      </section>

      {/* TIMELINE */}

      <section className="border-t border-slate-800 pt-7">
        <div className="mb-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <Orbit size={16} />
            Mission history
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Observation timeline
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Select an observation to navigate to that day. Showing up to
            five observations up to the selected day.
          </p>
        </div>

        <div>
          {timelineRecords.map((record) => (
            <TimelineItem
              key={`${record.Astronaut_ID}-${record.Mission_Day}`}
              record={record}
              selected={
                Number(record.Mission_Day) ===
                Number(selectedRecord.Mission_Day)
              }
              latest={
                Number(record.Mission_Day) ===
                Number(latest.Mission_Day)
              }
              onSelect={() =>
                setSelectedDay(Number(record.Mission_Day))
              }
            />
          ))}
        </div>
      </section>

      {/* DATA PROVENANCE */}

      <section className="border-t border-slate-800 pt-7">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <Database size={16} />
          Data provenance
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="flex items-start gap-3">
            <Database size={18} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Data origin</p>
              <p className="mt-1 text-sm text-slate-200">
                {formatDataOrigin(health.data_origin)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserRound size={18} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">
                Dataset astronaut ID
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {health.dataset_subject_id}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Activity size={18} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">
                Observations analyzed
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {health.observations}
              </p>
            </div>
          </div>

        </div>

        {health.is_synthetic && (
          <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-500">
            All displayed health observations belong to a synthetic
            demonstration dataset. They should not be used to make
            real medical or operational decisions.
          </p>
        )}
      </section>

    </div>
  );
}
