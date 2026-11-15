
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
import { usePreferences } from "../context/PreferencesContext";

import type {
  HealthAlert,
  MyAlertsResponse,
  HealthStatus,
} from "../types/health";

import type { TranslationKey } from "../i18n/translations";

interface Guidance {
  title: TranslationKey;
  explanation: TranslationKey;
  action: TranslationKey;
  evidenceTitle: TranslationKey;
  evidenceUrl: string;
  category: TranslationKey;
  icon: typeof Activity;
}

const NASA_EVIDENCE: Record<
  "general" | "sleep" | "exercise" | "behavioral" | "radiation" | "environment",
  { title: TranslationKey; url: string }
> = {
  general: {
    title: "guidance.evidenceGeneral",
    url: "https://humanresearchroadmap.nasa.gov/evidence/",
  },
  sleep: {
    title: "guidance.evidenceSleep",
    url: "https://www.nasa.gov/wp-content/uploads/2026/03/ochmo-mtb-009-circadian-desynchrony.pdf",
  },
  exercise: {
    title: "guidance.evidenceExercise",
    url: "https://www.nasa.gov/ochmo-tb-031-exercise-overview-2/",
  },
  behavioral: {
    title: "guidance.evidenceBehavioral",
    url: "https://www.nasa.gov/hhp/human-system-risks/",
  },
  radiation: {
    title: "guidance.evidenceRadiation",
    url: "https://www.nasa.gov/hrp/risks/",
  },
  environment: {
    title: "guidance.evidenceEnvironment",
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
      title: "guidance.sleep.title",
      explanation: "guidance.sleep.explanation",
      action: "guidance.sleep.action",
      evidenceTitle: NASA_EVIDENCE.sleep.title,
      evidenceUrl: NASA_EVIDENCE.sleep.url,
      category: "guidance.sleep.category",
      icon: Activity,
    };
  }

  if (
    text.includes("fatigue") ||
    text.includes("tired") ||
    text.includes("exhaust")
  ) {
    return {
      title: "guidance.fatigue.title",
      explanation: "guidance.fatigue.explanation",
      action: "guidance.fatigue.action",
      evidenceTitle: NASA_EVIDENCE.sleep.title,
      evidenceUrl: NASA_EVIDENCE.sleep.url,
      category: "guidance.fatigue.category",
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
      title: "guidance.exercise.title",
      explanation: "guidance.exercise.explanation",
      action: "guidance.exercise.action",
      evidenceTitle: NASA_EVIDENCE.exercise.title,
      evidenceUrl: NASA_EVIDENCE.exercise.url,
      category: "guidance.exercise.category",
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
      title: "guidance.behavioral.title",
      explanation: "guidance.behavioral.explanation",
      action: "guidance.behavioral.action",
      evidenceTitle: NASA_EVIDENCE.behavioral.title,
      evidenceUrl: NASA_EVIDENCE.behavioral.url,
      category: "guidance.behavioral.category",
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
      title: "guidance.radiation.title",
      explanation: "guidance.radiation.explanation",
      action: "guidance.radiation.action",
      evidenceTitle: NASA_EVIDENCE.radiation.title,
      evidenceUrl: NASA_EVIDENCE.radiation.url,
      category: "guidance.radiation.category",
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
      title: "guidance.hydration.title",
      explanation: "guidance.hydration.explanation",
      action: "guidance.hydration.action",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "guidance.hydration.category",
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
      title: "guidance.visual.title",
      explanation: "guidance.visual.explanation",
      action: "guidance.visual.action",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "guidance.visual.category",
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
      title: "guidance.environment.title",
      explanation: "guidance.environment.explanation",
      action: "guidance.environment.action",
      evidenceTitle: NASA_EVIDENCE.environment.title,
      evidenceUrl: NASA_EVIDENCE.environment.url,
      category: "guidance.environment.category",
      icon: Activity,
    };
  }

  if (text.includes("temperature") || text.includes("fever")) {
    return {
      title: "guidance.temperature.title",
      explanation: "guidance.temperature.explanation",
      action: "guidance.temperature.action",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "guidance.temperature.category",
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
      title: "guidance.immune.title",
      explanation: "guidance.immune.explanation",
      action: "guidance.immune.action",
      evidenceTitle: NASA_EVIDENCE.environment.title,
      evidenceUrl: NASA_EVIDENCE.environment.url,
      category: "guidance.immune.category",
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
      title: "guidance.cardiovascular.title",
      explanation: "guidance.cardiovascular.explanation",
      action: "guidance.cardiovascular.action",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "guidance.cardiovascular.category",
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
      title: "guidance.nutrition.title",
      explanation: "guidance.nutrition.explanation",
      action: "guidance.nutrition.action",
      evidenceTitle: NASA_EVIDENCE.general.title,
      evidenceUrl: NASA_EVIDENCE.general.url,
      category: "guidance.nutrition.category",
      icon: Activity,
    };
  }

  return {
    title: "guidance.general.title",
    explanation: "guidance.general.explanation",
    action: "guidance.general.action",
    evidenceTitle: NASA_EVIDENCE.general.title,
    evidenceUrl: NASA_EVIDENCE.general.url,
    category: "guidance.general.category",
    icon: Info,
  };
}

function getGeneralGuidance(): Guidance {
  return {
    title: "guidance.routine.title",
    explanation: "guidance.routine.explanation",
    action: "guidance.routine.action",
    evidenceTitle: NASA_EVIDENCE.general.title,
    evidenceUrl: NASA_EVIDENCE.general.url,
    category: "guidance.routine.category",
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
        label: "guidance.severityCritical" as const,
      };
    case "warning":
      return {
        container: "border-amber-500/30 bg-amber-500/5",
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        icon: "text-amber-400",
        label: "guidance.severityWarning" as const,
      };
    case "normal":
      return {
        container: "border-emerald-500/30 bg-emerald-500/5",
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        icon: "text-emerald-400",
        label: "guidance.severityNormal" as const,
      };
    default:
      return {
        container: "border-slate-700 bg-slate-900",
        badge: "border-slate-700 bg-slate-800 text-slate-400",
        icon: "text-slate-400",
        label: "guidance.severityUnknown" as const,
      };
  }
}

function phaseLabel(
  phase: string | null,
  t: (key: TranslationKey) => string
): string {
  if (!phase) return t("guidance.phaseUnknown");

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
  const { t } = usePreferences();
  const guidance = getGuidance(alert.message);
  const style = getSeverityStyle(severity);
  const Icon = guidance.icon;

  return (
    <article className={`overflow-hidden rounded-xl border ${style.container}`}>
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-slate-950 p-2.5 ${style.icon}`}>
              <Icon size={21} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                {t("guidance.item")} {index + 1} · {t(guidance.category)}
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">
                {t(guidance.title)}
              </h3>
            </div>
          </div>

          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${style.badge}`}>
            {t(style.label)}
          </span>
        </div>

        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <AlertTriangle size={14} />
            {t("guidance.datasetFlag")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {alert.message}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {t("guidance.why")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t(guidance.explanation)}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Lightbulb size={14} />
              {t("guidance.nextStep")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t(guidance.action)}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <BookOpen size={14} />
            {t("guidance.reference")}
          </p>

          <a
            href={guidance.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            <span>{t(guidance.evidenceTitle)}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function DailyGuidance() {
  const { t } = usePreferences();
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
      } catch {
        if (active) {
          setResponse(null);
          setError(t("guidance.loadError"));
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
  }, [selectedMissionDay, t]);

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
          {t("guidance.eyebrow")}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              {t("guidance.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              {t("guidance.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            <RefreshCw size={15} />
            {t("guidance.refresh")}
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info size={19} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {t("guidance.syntheticTitle")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {t("guidance.syntheticNotice")}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 py-20 text-slate-400">
          <Orbit size={23} className="animate-spin text-cyan-400" />
          {t("guidance.loading")}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={19} />
            <h3 className="font-semibold">{t("guidance.loadError")}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t("guidance.connectionError")}
          </p>
        </div>
      ) : response ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {t("guidance.observation")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {t("guidance.day")} {response.mission_day ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {phaseLabel(response.phase, t)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {t("guidance.overallStatus")}
              </p>
              <div className="mt-3">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${style.badge}`}>
                  {t(style.label)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {t("guidance.reportedStatus")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {t("guidance.recordedFlags")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {alerts.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t("guidance.flagsAssociated")}
              </p>
            </div>
          </section>

          <section className={`rounded-xl border p-5 ${style.container}`}>
            <div className="flex items-start gap-3">
              {hasCritical ? (
                <ShieldAlert className="mt-0.5 text-red-400" size={23} />
              ) : hasWarning ? (
                <AlertTriangle className="mt-0.5 text-amber-400" size={23} />
              ) : (
                <CheckCircle2 className="mt-0.5 text-emerald-400" size={23} />
              )}

              <div>
                <h3 className="font-semibold text-white">
                  {hasCritical
                    ? t("guidance.criticalRecorded")
                    : hasWarning
                    ? t("guidance.warningRecorded")
                    : severity === "normal"
                    ? t("guidance.noWarningCritical")
                    : t("guidance.statusUnclassified")}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {hasCritical
                    ? t("guidance.criticalExplanation")
                    : hasWarning
                    ? t("guidance.warningExplanation")
                    : severity === "normal"
                    ? t("guidance.normalExplanation")
                    : t("guidance.unknownExplanation")}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  {t("guidance.personalizedReview")}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {alerts.length > 0
                    ? t("guidance.items")
                    : t("guidance.routineMonitoring")}
                </h3>
              </div>

              <span className="text-xs text-slate-500">
                {t("guidance.missionDay")} {response.mission_day}
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
                  <CheckCircle2 size={22} className="mt-0.5 text-emerald-400" />
                  <div>
                    <h4 className="font-semibold text-white">
                      {t("guidance.noFlags")}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {t("guidance.noFlagsExplanation")}
                    </p>
                  </div>
                </div>

                {(() => {
                  const guidance = getGeneralGuidance();
                  return (
                    <div className="mt-5 border-t border-slate-800 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        {t("guidance.nextStep")}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {t(guidance.action)}
                      </p>
                      <a
                        href={guidance.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                      >
                        {t(guidance.evidenceTitle)}
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
            {t("guidance.howTitle")}
          </h3>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              1. {t("guidance.stepObservation")}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t("guidance.stepObservationText")}
            </p>
          </div>

          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Lightbulb size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              2. {t("guidance.stepContext")}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t("guidance.stepContextText")}
            </p>
          </div>

          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen size={18} />
            </div>
            <h4 className="text-sm font-medium text-white">
              3. {t("guidance.stepAction")}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t("guidance.stepActionText")}
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-slate-600">
        {t("guidance.dataOrigin")}: {response?.data_origin ?? t("guidance.notSpecified")}.
        {" "}{t("guidance.disclaimer")}
      </p>
    </div>
  );
}