
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarDays,
  Database,
  Orbit,
  ChevronRight,
  CircleDot,
  Flag,
  HeartPulse,
  Moon,
  Radiation,
  ShieldAlert,
  Dumbbell,
  Brain,
  Droplets,
} from "lucide-react";

import { getMyHealthData } from "../services/api";
import { useMissionDay } from "../context/MissionDayContext";

import type {
  HealthRecord,
  MyHealthResponse,
  HealthStatus,
} from "../types/health";

type PhaseGroup = {
  key: string;
  label: string;
  description: string;
  icon: typeof Activity;
  color: string;
  border: string;
  background: string;
  dot: string;
  records: HealthRecord[];
};

function phaseKey(phase: string): string {
  const normalized = phase.toLowerCase().replaceAll("_", " ");

  if (normalized.includes("pre")) return "pre-flight";
  if (normalized.includes("post")) return "post-flight";

  return "in-flight";
}

function phaseInformation(key: string) {
  switch (key) {
    case "pre-flight":
      return {
        label: "Pre-flight",
        description: "Reference observations before mission operations.",
        icon: Flag,
        color: "text-violet-400",
        border: "border-violet-500/30",
        background: "bg-violet-500/10",
        dot: "bg-violet-400",
      };

    case "post-flight":
      return {
        label: "Post-flight",
        description: "Recorded observations following the mission phase.",
        icon: Activity,
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        background: "bg-emerald-500/10",
        dot: "bg-emerald-400",
      };

    default:
      return {
        label: "In-flight",
        description: "Observations recorded during mission operations.",
        icon: Orbit,
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        background: "bg-cyan-500/10",
        dot: "bg-cyan-400",
      };
  }
}

function statusInformation(status: HealthStatus) {
  switch (status) {
    case "critical":
      return {
        label: "Critical",
        icon: ShieldAlert,
        color: "text-red-400",
        badge: "border-red-500/30 bg-red-500/10 text-red-400",
        dot: "bg-red-400",
      };

    case "warning":
      return {
        label: "Warning",
        icon: AlertTriangle,
        color: "text-amber-400",
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        dot: "bg-amber-400",
      };

    case "normal":
      return {
        label: "Normal",
        icon: CheckCircle2,
        color: "text-emerald-400",
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        dot: "bg-emerald-400",
      };

    default:
      return {
        label: "Unknown",
        icon: CircleDot,
        color: "text-slate-400",
        badge: "border-slate-700 bg-slate-800 text-slate-400",
        dot: "bg-slate-500",
      };
  }
}

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

function formatMetric(
  record: HealthRecord,
  key: string,
  decimals = 1
): string {
  const value = numericValue(record, key);

  return value === null ? "—" : value.toFixed(decimals);
}

function parseAlertReasons(record: HealthRecord): string[] {
  if (
    typeof record.Alert_Reasons !== "string" ||
    !record.Alert_Reasons.trim()
  ) {
    return [];
  }

  return record.Alert_Reasons
    .replaceAll("|", ";")
    .split(";")
    .map((reason) => reason.trim())
    .filter(Boolean);
}

function formatPhase(phase: string): string {
  return phase
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-xl font-semibold text-white">
        {value}
        <span className="ml-1 text-xs font-normal text-slate-500">
          {unit}
        </span>
      </p>
    </div>
  );
}

export default function MissionTimeline() {
  const { selectedMissionDay, setSelectedMissionDay } = useMissionDay();

  const [health, setHealth] = useState<MyHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadTimeline() {
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
              : "Unable to retrieve mission observations."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTimeline();

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

  const selectedRecord =
    observations.find(
      (record) =>
        Number(record.Mission_Day) === Number(selectedMissionDay)
    ) ?? observations[observations.length - 1];

  const phaseGroups = useMemo(() => {
    const grouped: Record<string, HealthRecord[]> = {
      "pre-flight": [],
      "in-flight": [],
      "post-flight": [],
    };

    observations.forEach((record) => {
      const key = phaseKey(record.Phase);
      grouped[key].push(record);
    });

    return Object.entries(grouped)
      .filter(([, records]) => records.length > 0)
      .map(([key, records]) => ({
        key,
        ...phaseInformation(key),
        records,
      })) as PhaseGroup[];
  }, [observations]);

  const filteredObservations =
    phaseFilter === "all"
      ? observations
      : observations.filter(
          (record) => phaseKey(record.Phase) === phaseFilter
        );

  const normalCount = observations.filter(
    (record) => record.Status === "normal"
  ).length;

  const warningCount = observations.filter(
    (record) => record.Status === "warning"
  ).length;

  const criticalCount = observations.filter(
    (record) => record.Status === "critical"
  ).length;

  const selectedAlerts = selectedRecord
    ? parseAlertReasons(selectedRecord)
    : [];

  const selectedStatus = selectedRecord
    ? statusInformation(selectedRecord.Status)
    : statusInformation("unknown");

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Orbit size={24} className="animate-spin text-cyan-400" />
        Loading mission timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
        <AlertTriangle size={20} className="mb-2" />
        <p className="font-semibold">Unable to load mission timeline</p>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  if (observations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
        No mission observations are available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <CalendarDays size={16} />
          Mission history
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Mission Timeline
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Explore your recorded health observations across
              pre-flight, in-flight, and post-flight phases.
            </p>
          </div>

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
            {observations.length} recorded observations
          </span>
        </div>
      </header>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Database
            size={19}
            className="mt-0.5 shrink-0 text-amber-400"
          />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Synthetic demonstration timeline
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              These are simulated observations, not actual astronaut
              telemetry. The timeline displays recorded data points
              only. Gaps between observations do not imply continuous
              monitoring.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total observations</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {observations.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-emerald-400">Normal</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {normalCount}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs text-amber-400">Warning</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {warningCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs text-red-400">Critical</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {criticalCount}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Mission progression
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Observation history
              </h3>
            </div>

            <select
              value={phaseFilter}
              onChange={(event) => setPhaseFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="all">All phases</option>
              <option value="pre-flight">Pre-flight</option>
              <option value="in-flight">In-flight</option>
              <option value="post-flight">Post-flight</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            {filteredObservations.map((record, index) => {
              const selected =
                Number(record.Mission_Day) ===
                Number(selectedRecord?.Mission_Day);

              const phase = phaseInformation(phaseKey(record.Phase));
              const status = statusInformation(record.Status);
              const StatusIcon = status.icon;
              const alertReasons = parseAlertReasons(record);

              return (
                <button
                  type="button"
                  key={record.Mission_Day}
                  onClick={() =>
                    setSelectedMissionDay(Number(record.Mission_Day))
                  }
                  className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-cyan-400/50 bg-cyan-500/10"
                      : "border-slate-800 bg-slate-950/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${phase.border} ${phase.background} ${phase.color}`}
                    >
                      <phase.icon size={18} />
                    </div>
                    {index !== filteredObservations.length - 1 && (
                      <div className="mt-2 h-10 w-px bg-slate-800" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">
                        Mission Day {record.Mission_Day}
                      </span>

                      <span className="text-xs text-slate-500">
                        {formatPhase(record.Phase)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${status.badge}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>

                      <span className="text-xs text-slate-500">
                        {alertReasons.length} recorded{" "}
                        {alertReasons.length === 1 ? "flag" : "flags"}
                      </span>
                    </div>

                    {alertReasons.length > 0 && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {alertReasons.join(" · ")}
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    size={18}
                    className={`mt-2 shrink-0 transition ${
                      selected
                        ? "text-cyan-400"
                        : "text-slate-600 group-hover:text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {filteredObservations.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No observations in this phase.
            </p>
          )}
        </div>

        <aside className="h-fit space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Selected observation
            </p>

            {selectedRecord ? (
              <>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-white">
                    Day {selectedRecord.Mission_Day}
                  </h3>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${selectedStatus.badge}`}
                  >
                    {selectedStatus.label}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  {formatPhase(selectedRecord.Phase)}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MetricItem
                    icon={Moon}
                    label="Sleep"
                    value={formatMetric(
                      selectedRecord,
                      "Sleep_Duration_hours"
                    )}
                    unit="hours"
                  />

                  <MetricItem
                    icon={HeartPulse}
                    label="Resting HR"
                    value={formatMetric(
                      selectedRecord,
                      "Resting_HR_bpm"
                    )}
                    unit="bpm"
                  />

                  <MetricItem
                    icon={Dumbbell}
                    label="Bone density"
                    value={formatMetric(
                      selectedRecord,
                      "Bone_Density_Index_pct_Baseline"
                    )}
                    unit="%"
                  />

                  <MetricItem
                    icon={Radiation}
                    label="Mission dose"
                    value={formatMetric(
                      selectedRecord,
                      "Cumulative_Mission_Dose_mSv",
                      2
                    )}
                    unit="mSv"
                  />

                  <MetricItem
                    icon={Brain}
                    label="Fatigue"
                    value={formatMetric(
                      selectedRecord,
                      "Fatigue_Score_0_10"
                    )}
                    unit="/10"
                  />

                  <MetricItem
                    icon={Droplets}
                    label="Water intake"
                    value={formatMetric(
                      selectedRecord,
                      "Water_Intake_L"
                    )}
                    unit="L"
                  />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Select an observation to view its details.
              </p>
            )}
          </div>

          {selectedRecord && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-400" />
                <h3 className="font-semibold text-white">
                  Recorded flags
                </h3>
              </div>

              {selectedAlerts.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {selectedAlerts.map((alert, index) => (
                    <li
                      key={`${index}-${alert}`}
                      className="flex items-start gap-2 text-sm leading-relaxed text-slate-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {alert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  No flags were recorded for this observation.
                </p>
              )}

              <button
                type="button"
                onClick={() => setSelectedMissionDay(selectedRecord.Mission_Day)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Activity size={15} />
                Use this mission day across ASTRA
              </button>
            </div>
          )}
        </aside>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">
            Mission phases
          </h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {phaseGroups.map((group) => {
            const Icon = group.icon;
            const critical = group.records.filter(
              (record) => record.Status === "critical"
            ).length;
            const warnings = group.records.filter(
              (record) => record.Status === "warning"
            ).length;

            return (
              <div
                key={group.key}
                className={`rounded-xl border ${group.border} ${group.background} p-4`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} className={group.color} />
                  <h4 className="font-semibold text-white">
                    {group.label}
                  </h4>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {group.description}
                </p>

                <p className="mt-4 text-2xl font-semibold text-white">
                  {group.records.length}
                </p>
                <p className="text-xs text-slate-500">
                  recorded observations
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <span className="text-amber-400">
                    {warnings} warnings
                  </span>
                  <span className="text-red-400">
                    {critical} critical
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-slate-600">
        Timeline entries represent discrete recorded observations.
        They should not be interpreted as a continuous monitoring
        record. Status indicators and flags originate from the
        synthetic demonstration dataset and are not clinical
        assessments.
      </p>
    </div>
  );
}
