
import { useEffect, useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  BookOpen,
  Activity,
  RefreshCw,
  ShieldAlert,
  Droplets,
  Eye,
  HeartPulse,
  Orbit,
} from "lucide-react";

import { getMyAlerts } from "../services/api";
import { useMissionDay } from "../context/MissionDayContext";

import type {
  HealthAlert,
  MyAlertsResponse,
  HealthStatus,
} from "../types/health";

interface Guidance {
  title: string;
  explanation: string;
  action: string;
  evidenceTitle: string;
  evidenceUrl: string;
  category: string;
  icon: typeof Activity;
}

const NASA_EVIDENCE = {
  general: {
    title: "NASA Human Research Program — Evidence Library",
    url: "https://humanresearchroadmap.nasa.gov/evidence/",
  },
  sleep: {
    title: "NASA — Circadian Desynchrony Medical Technical Brief",
    url: "https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf",
  },
  exercise: {
    title: "NASA — Exercise Overview",
    url: "https://www.nasa.gov/ochmo-tb-031-exercise-overview-2/",
  },
  behavioral: {
    title: "NASA — Human System Risks",
    url: "https://www.nasa.gov/hhp/human-system-risks/",
  },
  radiation: {
    title: "NASA — Risks of Human Spaceflight",
    url: "https://www.nasa.gov/hrp/risks/",
  },
  environment: {
    title: "NASA — Human Research Program Risks",
    url: "https://humanresearchroadmap.nasa.gov/Risks/default.aspx",
  },
};

function getGuidance(alert: string): Guidance {
  const text = alert.toLowerCase();

  if (
    text.includes("sleep") ||
    text.includes("insomnia") ||
    text.includes("circadian")
  ) {
    return {
      title: "Review your sleep and rest schedule",
      explanation:
        "NASA identifies sleep loss, circadian misalignment, and work overload as factors that can affect astronaut alertness, performance, and health.",
      action:
        "Review your recent sleep observations and work-rest schedule. Compare them with your planned sleep opportunity and follow the mission's approved fatigue-management procedures.",
      evidenceTitle: NASA_EVIDENCE.sleep.title,
      evidenceUrl: NASA_EVIDENCE.sleep.url,
      category: "Sleep and circadian health",
      icon: Activity,
    };
  }

  if (
    text.includes("fatigue") ||
    text.includes("tired") ||
    text.includes("exhaust")
  ) {
    return {
      title: "Review fatigue and workload",
      explanation:
        "NASA research identifies sleep loss and work overload as risks to crew health and mission performance.",
      action:
        "Review recent workload, rest opportunities, and sleep observations. Follow mission fatigue-management procedures if the pattern persists.",
      evidenceTitle: NASA_EVIDENCE.sleep.title,
      evidenceUrl: NASA_EVIDENCE.sleep.url,
      category: "Fatigue management",
      icon: Activity,
    };
  }

  if (
    text.includes("exercise") ||
    text.includes("muscle") ||
    text.includes("strength") ||
    text.includes("bone") ||
    text.includes("density") ||
    text.includes("physical")
  ) {
    return {
      title: "Review exercise and physical-performance trends",
      explanation:
        "NASA identifies reductions in aerobic capacity, muscle strength, and bone strength as important human-spaceflight risks. Exercise is an established countermeasure, although its effectiveness varies between individuals.",
      action:
        "Review exercise-session records and adherence to the prescribed mission exercise program. Compare current physical-performance observations with your personal baseline.",
      evidenceTitle: NASA_EVIDENCE.exercise.title,
      evidenceUrl: NASA_EVIDENCE.exercise.url,
      category: "Physical health",
      icon: Activity,
    };
  }

  if (
    text.includes("cognitive") ||
    text.includes("concentration") ||
    text.includes("performance") ||
    text.includes("behavioral") ||
    text.includes("mood") ||
    text.includes("stress") ||
    text.includes("irritability") ||
    text.includes("morale")
  ) {
    return {
      title: "Review behavioral and cognitive observations",
      explanation:
        "NASA identifies behavioral health, cognitive performance, and psychosocial adaptation as important considerations for long-duration missions.",
      action:
        "Review recent observations and workload context. Consider using the mission's approved behavioral-health check-in and support resources.",
      evidenceTitle: NASA_EVIDENCE.behavioral.title,
      evidenceUrl: NASA_EVIDENCE.behavioral.url,
      category: "Behavioral and cognitive health",
      icon: Activity,
    };
  }

  if (
    text.includes("radiation") ||
    text.includes("dose") ||
    text.includes("exposure") ||
    text.includes("solar particle") ||
    text.includes("spe event")
  ) {
    return {
      title: "Review radiation exposure context",
      explanation:
        "Space radiation is a recognized human-spaceflight risk. Exposure measurements should be interpreted in the context of mission conditions and approved monitoring procedures.",
      action:
        "Review the recorded exposure measurement, its time period, and the applicable mission monitoring protocol. Follow the approved procedure for any required escalation.",
      evidenceTitle: NASA_EVIDENCE.radiation.title,
      evidenceUrl: NASA_EVIDENCE.radiation.url,
      category: "Radiation monitoring",
      icon: ShieldAlert,
    };
  }

  if (
    text.includes("dehydrat") ||
    text.includes("urine specific gravity") ||
    text.includes("urine sg") ||
    text.includes("water intake")
  ) {
    return {
      title: "Review hydration observations",
      explanation:
        "Hydration status can be assessed using multiple observations, including fluid intake and urine measurements. An individual measurement should not be interpreted in isolation.",
      action:
        "Review recorded fluid intake and urine measurements together. Follow the mission hydration protocol and consult the appropriate medical resource if the finding persists.",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "Hydration",
      icon: Droplets,
    };
  }

  if (
    text.includes("visual") ||
    text.includes("optic") ||
    text.includes("retinal") ||
    text.includes("chorioretinal") ||
    text.includes("hyperopic") ||
    text.includes("refractive") ||
    text.includes("intracranial pressure") ||
    text.includes("sans")
  ) {
    return {
      title: "Review visual and ocular observations",
      explanation:
        "Spaceflight-associated neuro-ocular changes are an established area of NASA human-spaceflight research. Visual and ocular findings require appropriate clinical interpretation.",
      action:
        "Review the recorded visual measurements and their history. Follow the mission's approved ocular-health assessment and medical escalation procedures.",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "Visual and ocular health",
      icon: Eye,
    };
  }

  if (
    text.includes("co2") ||
    text.includes("carbon dioxide") ||
    text.includes("cabin") ||
    text.includes("environment") ||
    text.includes("ventilation") ||
    text.includes("oxygen") ||
    text.includes("hypoxia")
  ) {
    return {
      title: "Review environmental monitoring",
      explanation:
        "Cabin environmental conditions, including carbon dioxide and oxygen levels, are relevant to crew health and performance.",
      action:
        "Review the original environmental measurement and its trend. Follow the applicable vehicle environmental-monitoring and safety procedures.",
      evidenceTitle: NASA_EVIDENCE.environment.title,
      evidenceUrl: NASA_EVIDENCE.environment.url,
      category: "Environmental health",
      icon: Activity,
    };
  }

  if (
    text.includes("temperature") ||
    text.includes("fever")
  ) {
    return {
      title: "Review the temperature observation",
      explanation:
        "A temperature observation should be interpreted alongside other measurements and the astronaut's clinical context.",
      action:
        "Review the recorded value, measurement time, and any associated observations. Follow the mission's approved medical monitoring procedures.",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "General health monitoring",
      icon: Activity,
    };
  }

  if (
    text.includes("crp") ||
    text.includes("immune") ||
    text.includes("inflammation") ||
    text.includes("herpesvirus") ||
    text.includes("lymphocyte")
  ) {
    return {
      title: "Review immune-health observations",
      explanation:
        "NASA identifies altered immune responses as a human-spaceflight health risk. Individual measurements require appropriate clinical interpretation.",
      action:
        "Review the measurement and its trend against previous observations. Follow the applicable mission medical protocol.",
      evidenceTitle: NASA_EVIDENCE.environment.title,
      evidenceUrl: NASA_EVIDENCE.environment.url,
      category: "Immune health",
      icon: Activity,
    };
  }

  if (
    text.includes("heart") ||
    text.includes("cardio") ||
    text.includes("blood pressure") ||
    text.includes("heart rate") ||
    text.includes("hrv") ||
    text.includes("orthostatic") ||
    text.includes("spo2")
  ) {
    return {
      title: "Review cardiovascular trends",
      explanation:
        "NASA identifies cardiovascular adaptation as an important human-spaceflight risk. Changes should be interpreted in the context of an individual's baseline and mission phase.",
      action:
        "Review the measurement history and compare it with your personal baseline. Follow the applicable cardiovascular monitoring protocol.",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "Cardiovascular health",
      icon: HeartPulse,
    };
  }

  if (
    text.includes("vitamin") ||
    text.includes("homocysteine") ||
    text.includes("folate") ||
    text.includes("calcium") ||
    text.includes("diet") ||
    text.includes("nutrition")
  ) {
    return {
      title: "Review nutrition-related observations",
      explanation:
        "Nutrition is an important component of maintaining astronaut health during spaceflight. Individual laboratory and dietary measurements require appropriate context.",
      action:
        "Review the recorded measurement alongside dietary observations and previous values. Follow the mission's approved nutrition and medical guidance.",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "Nutrition",
      icon: Activity,
    };
  }

  return {
    title: "Review this health observation",
    explanation:
      "This observation has been flagged, but ASTRA does not yet have a specific evidence-linked guidance rule for its wording.",
    action:
      "Review the original measurement and its history. Consult the applicable mission health protocol rather than interpreting this observation in isolation.",
    evidenceTitle: NASA_EVIDENCE.general.title,
    evidenceUrl: NASA_EVIDENCE.general.url,
    category: "General health monitoring",
    icon: Info,
  };
}

function getGeneralGuidance(): Guidance {
  return {
    title: "Continue routine health monitoring",
    explanation:
      "NASA's Human Research Program uses longitudinal evidence and monitoring to understand how human health changes during spaceflight. The absence of a flagged observation does not establish that every health measure is normal.",
    action:
      "Review your latest measurements, keep your health observations up to date, and compare changes with your personal baseline.",
    evidenceTitle: NASA_EVIDENCE.general.title,
    evidenceUrl: NASA_EVIDENCE.general.url,
    category: "Routine monitoring",
    icon: Activity,
  };
}

function getSeverityStyle(severity: HealthStatus) {
  switch (severity) {
    case "critical":
      return {
        container: "border-red-500/30 bg-red-500/5",
        badge: "border-red-500/30 bg-red-500/10 text-red-400",
        icon: "text-red-400",
        label: "Critical flag",
      };
    case "warning":
      return {
        container: "border-amber-500/30 bg-amber-500/5",
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        icon: "text-amber-400",
        label: "Warning flag",
      };
    case "normal":
      return {
        container: "border-emerald-500/30 bg-emerald-500/5",
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        icon: "text-emerald-400",
        label: "Normal",
      };
    default:
      return {
        container: "border-slate-700 bg-slate-900",
        badge: "border-slate-700 bg-slate-800 text-slate-400",
        icon: "text-slate-400",
        label: "Unclassified",
      };
  }
}

function phaseLabel(phase: string | null): string {
  if (!phase) return "Unknown phase";

  return phase
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function GuidanceCard({
  alert,
  severity,
  index,
}: {
  alert: HealthAlert;
  severity: HealthStatus;
  index: number;
}) {
  const guidance = getGuidance(alert.message);
  const style = getSeverityStyle(severity);
  const Icon = guidance.icon;

  return (
    <article
      className={`overflow-hidden rounded-xl border ${style.container}`}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-slate-950 p-2.5 ${style.icon}`}>
              <Icon size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Guidance item {index + 1} · {guidance.category}
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">
                {guidance.title}
              </h3>
            </div>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${style.badge}`}
          >
            {style.label}
          </span>
        </div>

        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <AlertTriangle size={14} />
            Dataset-reported flag
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {alert.message}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Why this matters
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {guidance.explanation}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Lightbulb size={14} />
              Suggested next step
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {guidance.action}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <BookOpen size={14} />
            Supporting reference
          </p>

          <a
            href={guidance.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            <span>{guidance.evidenceTitle}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function DailyGuidance() {
  const { selectedMissionDay } = useMissionDay();

  const [response, setResponse] = useState<MyAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGuidance() {
      try {
        setLoading(true);
        setError(null);

        const result = await getMyAlerts(selectedMissionDay);

        if (active) {
          setResponse(result);
        }
      } catch (err) {
        if (active) {
          setResponse(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to retrieve guidance."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGuidance();

    return () => {
      active = false;
    };
  }, [selectedMissionDay]);

  const alerts = response?.alerts ?? [];
  const severity = response?.status ?? "unknown";
  const style = getSeverityStyle(severity);
  const hasCritical = severity === "critical";
  const hasWarning = severity === "warning";

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <Lightbulb size={16} />
          Evidence-informed support
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Daily Guidance
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Understand your recorded health flags, explore their
              scientific context, and review suggested next steps.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info size={19} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Demonstration guidance — synthetic health data
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Flags and recommendations are generated from a synthetic
              demonstration dataset. They are not clinical diagnoses,
              medical prescriptions, or real astronaut health
              measurements. Follow approved mission medical procedures
              for health decisions.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 py-20 text-slate-400">
          <Orbit size={23} className="animate-spin text-cyan-400" />
          Loading observation-specific guidance...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={19} />
            <h3 className="font-semibold">Unable to load guidance</h3>
          </div>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <p className="mt-2 text-xs text-slate-500">
            Check your connection and authentication, then try refreshing.
          </p>
        </div>
      ) : response ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Observation
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                Day {response.mission_day ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {phaseLabel(response.phase)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Overall dataset status
              </p>
              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${style.badge}`}
                >
                  {severity.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Status reported for this observation
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Recorded flags
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {alerts.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Flags associated with this observation
              </p>
            </div>
          </section>

          <section
            className={`rounded-xl border p-5 ${style.container}`}
          >
            <div className="flex items-start gap-3">
              {hasCritical ? (
                <ShieldAlert className="mt-0.5 text-red-400" size={23} />
              ) : hasWarning ? (
                <AlertTriangle className="mt-0.5 text-amber-400" size={23} />
              ) : (
                <CheckCircle2
                  className="mt-0.5 text-emerald-400"
                  size={23}
                />
              )}

              <div>
                <h3 className="font-semibold text-white">
                  {hasCritical
                    ? "Critical dataset flag recorded"
                    : hasWarning
                    ? "Warning dataset flag recorded"
                    : severity === "normal"
                    ? "No warning or critical flags recorded"
                    : "Status is not classified"}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {hasCritical
                    ? "One or more flags in this synthetic observation have been assigned critical severity. Review the individual findings and their associated mission protocols."
                    : hasWarning
                    ? "One or more flags in this synthetic observation have been assigned warning severity. Review the measurements and their context."
                    : severity === "normal"
                    ? "The dataset reports a normal status for this observation. This does not establish that every health measure is normal or eliminate the need for routine monitoring."
                    : "ASTRA could not classify the status of this observation."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Personalized observation review
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {alerts.length > 0
                    ? "Your guidance items"
                    : "Routine monitoring"}
                </h3>
              </div>

              <span className="text-xs text-slate-500">
                Mission day {response.mission_day}
              </span>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <GuidanceCard
                    key={`${alert.mission_day}-${index}-${alert.message}`}
                    alert={alert}
                    severity={alert.severity}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className="mt-0.5 text-emerald-400"
                  />
                  <div>
                    <h4 className="font-semibold text-white">
                      No dataset-reported flags for this observation
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Continue routine monitoring and compare your
                      measurements with your personal baseline. An
                      observation without flags does not mean every
                      health parameter has been assessed as normal.
                    </p>
                  </div>
                </div>

                {(() => {
                  const guidance = getGeneralGuidance();
                  return (
                    <div className="mt-5 border-t border-slate-800 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        Suggested next step
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {guidance.action}
                      </p>
                      <a
                        href={guidance.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                      >
                        {guidance.evidenceTitle}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        </>
      ) : null}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">
            How ASTRA generates guidance
          </h3>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              1. Observation
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              ASTRA retrieves the authenticated astronaut's health
              observation and associated dataset flags.
            </p>
          </div>

          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Lightbulb size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              2. Context
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Flag wording is matched to predefined guidance categories
              and supporting human-spaceflight research.
            </p>
          </div>

          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              3. Suggested action
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              ASTRA presents a practical review step and a supporting
              reference. It does not diagnose or prescribe treatment.
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-slate-600">
        Data origin: {response?.data_origin ?? "Not specified"}.
        Guidance is rule-based and informational. It should not replace
        professional medical assessment or approved mission procedures.
      </p>
    </div>
  );
}
