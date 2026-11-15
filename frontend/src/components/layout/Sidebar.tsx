
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Lightbulb,
  CalendarDays,
  Activity,
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";

import { getMyHealthData } from "../../services/api";
import type { HealthRecord } from "../../types/health";
import { useMissionDay } from "../../context/MissionDayContext";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface Guidance {
  title: string;
  explanation: string;
  action: string;
  evidenceTitle: string;
  evidenceUrl: string;
  category: string;
}

interface GuidanceItem {
  alert: string;
  guidance: Guidance;
}

const navigation = [
  { label: "Mission Overview", path: "/", icon: LayoutDashboard },
  { label: "Health Trends", path: "/trends", icon: ChartNoAxesCombined },
  { label: "Daily Guidance", path: "/guidance", icon: Lightbulb },
  { label: "Mission Timeline", path: "/timeline", icon: CalendarDays },
  { label: "Personal Baseline", path: "/baseline", icon: Activity },
];

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
        "Review recent workload, rest opportunities, and sleep observations. Follow the mission fatigue-management procedures if the pattern persists.",
      evidenceTitle: NASA_EVIDENCE.sleep.title,
      evidenceUrl: NASA_EVIDENCE.sleep.url,
      category: "Fatigue management",
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
    };
  }

  if (
    text.includes("cognitive") ||
    text.includes("concentration") ||
    text.includes("performance") ||
    text.includes("behavioral") ||
    text.includes("mood") ||
    text.includes("stress")
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
    };
  }

  if (
    text.includes("radiation") ||
    text.includes("dose") ||
    text.includes("exposure")
  ) {
    return {
      title: "Review radiation exposure context",
      explanation:
        "Space radiation is a recognized human-spaceflight risk. Exposure measurements should be interpreted in the context of mission conditions and approved monitoring procedures.",
      action:
        "Review the recorded exposure measurement, its time period, and the applicable mission monitoring protocol. Escalate according to the approved procedure if required.",
      evidenceTitle: NASA_EVIDENCE.radiation.title,
      evidenceUrl: NASA_EVIDENCE.radiation.url,
      category: "Radiation monitoring",
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
    };
  }

  if (
    text.includes("crp") ||
    text.includes("immune") ||
    text.includes("inflammation")
  ) {
    return {
      title: "Review immune-health observations",
      explanation:
        "NASA identifies altered immune responses as a human-spaceflight health risk. Individual measurements require appropriate clinical interpretation.",
      action:
        "Review the measurement and its trend against your previous observations. Follow the applicable mission medical protocol.",
      evidenceTitle: NASA_EVIDENCE.environment.title,
      evidenceUrl: NASA_EVIDENCE.environment.url,
      category: "Immune health",
    };
  }

  if (
    text.includes("heart") ||
    text.includes("cardio") ||
    text.includes("blood pressure") ||
    text.includes("heart rate") ||
    text.includes("hrv")
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
  };
}

function getGuidanceItems(record: HealthRecord): GuidanceItem[] {
  const reasons = record.Alert_Reasons;

  if (typeof reasons !== "string" || !reasons.trim()) {
    return [];
  }

  return reasons
    .replaceAll("|", ";")
    .split(";")
    .map((reason) => reason.trim())
    .filter(Boolean)
    .map((alert) => ({
      alert,
      guidance: getGuidance(alert),
    }));
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
  };
}

export default function Sidebar({
  currentPath,
  onNavigate,
}: SidebarProps) {
  const { selectedMissionDay } = useMissionDay();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHealthData() {
      try {
        setLoading(true);
        setError(false);

        const response = await getMyHealthData();

        if (active) {
          const sorted = [...response.data].sort(
            (a, b) =>
              Number(a.Mission_Day) - Number(b.Mission_Day)
          );

          setRecords(sorted);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHealthData();

    return () => {
      active = false;
    };
  }, []);

  const latestRecord = records[records.length - 1];

  const selectedRecord =
    selectedMissionDay === null
      ? latestRecord
      : records.find(
          (record) =>
            Number(record.Mission_Day) === selectedMissionDay
        ) ?? latestRecord;

  const suggestions = selectedRecord
    ? getGuidanceItems(selectedRecord)
    : [];

  useEffect(() => {
    setExpandedIndex(null);
  }, [selectedMissionDay]);

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-5">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-wide text-cyan-400">
          ASTRA
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Astronaut Health Intelligence
        </p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={17} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Daily Guidance
            </h2>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
              {suggestions.length || (selectedRecord ? 1 : 0)}
            </span>
          )}
        </div>

        {selectedRecord && (
          <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">
            Mission day {selectedRecord.Mission_Day}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
            <RefreshCw size={13} className="animate-spin" />
            Loading guidance...
          </div>
        ) : error ? (
          <p className="py-2 text-xs text-slate-500">
            Guidance is currently unavailable.
          </p>
        ) : !selectedRecord ? (
          <p className="py-2 text-xs text-slate-500">
            No health observations are available.
          </p>
        ) : (
          <div className="space-y-2">
            {(suggestions.length > 0
              ? suggestions
              : [
                  {
                    alert: "No alert reasons reported for this observation.",
                    guidance: getGeneralGuidance(),
                  },
                ]
            ).map((item, index) => {
              const expanded = expandedIndex === index;

              return (
                <div
                  key={`${selectedRecord.Mission_Day}-${index}-${item.alert}`}
                  className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/50"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedIndex(expanded ? null : index)
                    }
                    className="flex w-full items-start gap-2 p-3 text-left transition hover:bg-slate-800/60"
                  >
                    {suggestions.length > 0 ? (
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-400"
                      />
                    ) : (
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />
                    )}

                    <span className="min-w-0 flex-1 text-xs leading-relaxed text-slate-300">
                      {item.guidance.title}
                    </span>

                    {expanded ? (
                      <ChevronDown
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />
                    )}
                  </button>

                  {expanded && (
                    <div className="space-y-3 border-t border-slate-800 px-3 py-3">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Observation
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {item.alert}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-500">
                          Evidence context
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {item.guidance.explanation}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-500">
                          Suggested next step
                        </p>
                        <p className="text-xs leading-relaxed text-slate-300">
                          {item.guidance.action}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Topic
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.guidance.category}
                        </p>
                      </div>

                      <a
                        href={item.guidance.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-cyan-400 transition hover:text-cyan-300"
                      >
                        <BookOpen size={13} />
                        Read NASA evidence
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
          Evidence-informed informational prompts. Not medical diagnoses
          or substitutes for approved mission protocols.
        </p>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-5">
        <p className="text-xs text-slate-500">
          NASA Space Apps Challenge
        </p>
        <p className="mt-1 text-xs text-slate-600">
          ASTRA Prototype v1.0
        </p>
      </div>
    </aside>
  );
}
