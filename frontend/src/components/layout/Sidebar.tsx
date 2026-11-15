
import { useEffect, useState } from "react";
import logo from "../../assets/logo_with_words.png";

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
import { usePreferences } from "../../context/PreferencesContext";
import type { Language } from "../../i18n/translations";

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
  { key: "nav.overview", path: "/", icon: LayoutDashboard },
  { key: "nav.trends", path: "/trends", icon: ChartNoAxesCombined },
  { key: "nav.guidance", path: "/guidance", icon: Lightbulb },
  { key: "nav.timeline", path: "/timeline", icon: CalendarDays },
  { key: "nav.baseline", path: "/baseline", icon: Activity },
] as const;

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

const guidanceTranslations = {
  en: {
    sleep: {
      title: "Review your sleep and rest schedule",
      explanation:
        "NASA identifies sleep loss, circadian misalignment, and work overload as factors that can affect astronaut alertness, performance, and health.",
      action:
        "Review your recent sleep observations and work-rest schedule. Compare them with your planned sleep opportunity and follow the mission's approved fatigue-management procedures.",
      category: "Sleep and circadian health",
    },
    fatigue: {
      title: "Review fatigue and workload",
      explanation:
        "NASA research identifies sleep loss and work overload as risks to crew health and mission performance.",
      action:
        "Review recent workload, rest opportunities, and sleep observations. Follow the mission fatigue-management procedures if the pattern persists.",
      category: "Fatigue management",
    },
    exercise: {
      title: "Review exercise and physical-performance trends",
      explanation:
        "NASA identifies reductions in aerobic capacity, muscle strength, and bone strength as important human-spaceflight risks. Exercise is an established countermeasure, although its effectiveness varies between individuals.",
      action:
        "Review exercise-session records and adherence to the prescribed mission exercise program. Compare current physical-performance observations with your personal baseline.",
      category: "Physical health",
    },
    behavioral: {
      title: "Review behavioral and cognitive observations",
      explanation:
        "NASA identifies behavioral health, cognitive performance, and psychosocial adaptation as important considerations for long-duration missions.",
      action:
        "Review recent observations and workload context. Consider using the mission's approved behavioral-health check-in and support resources.",
      category: "Behavioral and cognitive health",
    },
    radiation: {
      title: "Review radiation exposure context",
      explanation:
        "Space radiation is a recognized human-spaceflight risk. Exposure measurements should be interpreted in the context of mission conditions and approved monitoring procedures.",
      action:
        "Review the recorded exposure measurement, its time period, and the applicable mission monitoring protocol. Escalate according to the approved procedure if required.",
      category: "Radiation monitoring",
    },
    environment: {
      title: "Review environmental monitoring",
      explanation:
        "Cabin environmental conditions, including carbon dioxide and oxygen levels, are relevant to crew health and performance.",
      action:
        "Review the original environmental measurement and its trend. Follow the applicable vehicle environmental-monitoring and safety procedures.",
      category: "Environmental health",
    },
    temperature: {
      title: "Review the temperature observation",
      explanation:
        "A temperature observation should be interpreted alongside other measurements and the astronaut's clinical context.",
      action:
        "Review the recorded value, measurement time, and any associated observations. Follow the mission's approved medical monitoring procedures.",
      category: "General health monitoring",
    },
    immune: {
      title: "Review immune-health observations",
      explanation:
        "NASA identifies altered immune responses as a human-spaceflight health risk. Individual measurements require appropriate clinical interpretation.",
      action:
        "Review the measurement and its trend against your previous observations. Follow the applicable mission medical protocol.",
      category: "Immune health",
    },
    cardiovascular: {
      title: "Review cardiovascular trends",
      explanation:
        "NASA identifies cardiovascular adaptation as an important human-spaceflight risk. Changes should be interpreted in the context of an individual's baseline and mission phase.",
      action:
        "Review the measurement history and compare it with your personal baseline. Follow the applicable cardiovascular monitoring protocol.",
      category: "Cardiovascular health",
    },
    general: {
      title: "Review this health observation",
      explanation:
        "This observation has been flagged, but ASTRA does not yet have a specific evidence-linked guidance rule for its wording.",
      action:
        "Review the original measurement and its history. Consult the applicable mission health protocol rather than interpreting this observation in isolation.",
      category: "General health monitoring",
    },
    routine: {
      title: "Continue routine health monitoring",
      explanation:
        "NASA's Human Research Program uses longitudinal evidence and monitoring to understand how human health changes during spaceflight. The absence of a flagged observation does not establish that every health measure is normal.",
      action:
        "Review your latest measurements, keep your health observations up to date, and compare changes with your personal baseline.",
      category: "Routine monitoring",
    },
    evidence: {
      general: "NASA Human Research Program — Evidence Library",
      sleep: "NASA — Circadian Desynchrony Medical Technical Brief",
      exercise: "NASA — Exercise Overview",
      behavioral: "NASA — Human System Risks",
      radiation: "NASA — Risks of Human Spaceflight",
      environment: "NASA — Human Research Program Risks",
    },
  },
  ru: {
    sleep: {
      title: "Проверьте режим сна и отдыха",
      explanation:
        "NASA отмечает, что недостаток сна, нарушение циркадных ритмов и чрезмерная рабочая нагрузка могут влиять на бодрость, работоспособность и здоровье астронавтов.",
      action:
        "Проверьте последние данные о сне и график работы и отдыха. Сравните их с запланированным временем для сна и соблюдайте утверждённые процедуры управления усталостью.",
      category: "Сон и циркадное здоровье",
    },
    fatigue: {
      title: "Проверьте усталость и рабочую нагрузку",
      explanation:
        "Исследования NASA указывают, что недостаток сна и чрезмерная рабочая нагрузка представляют риски для здоровья экипажа и выполнения миссии.",
      action:
        "Проверьте недавнюю рабочую нагрузку, возможности для отдыха и данные о сне. Если такая ситуация сохраняется, следуйте процедурам управления усталостью.",
      category: "Управление усталостью",
    },
    exercise: {
      title: "Проверьте физическую активность и физическую форму",
      explanation:
        "NASA относит снижение аэробной выносливости, мышечной силы и прочности костей к важным рискам космических полётов. Физические упражнения являются установленной мерой противодействия этим рискам, хотя их эффективность индивидуальна.",
      action:
        "Проверьте записи тренировок и соблюдение назначенной программы упражнений. Сравните текущие показатели физической формы с личным исходным уровнем.",
      category: "Физическое здоровье",
    },
    behavioral: {
      title: "Проверьте поведенческие и когнитивные показатели",
      explanation:
        "NASA рассматривает поведенческое здоровье, когнитивную работоспособность и психосоциальную адаптацию как важные факторы длительных космических миссий.",
      action:
        "Проверьте последние наблюдения и контекст рабочей нагрузки. При необходимости воспользуйтесь утверждёнными ресурсами психологической поддержки экипажа.",
      category: "Поведенческое и когнитивное здоровье",
    },
    radiation: {
      title: "Проверьте контекст радиационного воздействия",
      explanation:
        "Космическое излучение является признанным риском пилотируемых космических полётов. Показатели воздействия следует оценивать с учётом условий миссии и утверждённых процедур мониторинга.",
      action:
        "Проверьте зарегистрированную дозу облучения, период измерения и применимый протокол мониторинга миссии. При необходимости действуйте согласно утверждённой процедуре.",
      category: "Мониторинг радиации",
    },
    environment: {
      title: "Проверьте параметры окружающей среды",
      explanation:
        "Условия окружающей среды в кабине, включая уровни углекислого газа и кислорода, имеют значение для здоровья и работоспособности экипажа.",
      action:
        "Проверьте исходное измерение параметров окружающей среды и их динамику. Соблюдайте применимые процедуры контроля среды и безопасности аппарата.",
      category: "Здоровье и окружающая среда",
    },
    temperature: {
      title: "Проверьте показатель температуры",
      explanation:
        "Показатель температуры следует оценивать вместе с другими измерениями и индивидуальным клиническим контекстом астронавта.",
      action:
        "Проверьте зарегистрированное значение, время измерения и сопутствующие наблюдения. Соблюдайте утверждённые процедуры медицинского мониторинга миссии.",
      category: "Общий мониторинг здоровья",
    },
    immune: {
      title: "Проверьте показатели иммунного здоровья",
      explanation:
        "NASA относит изменения иммунных реакций к рискам для здоровья человека в космосе. Индивидуальные показатели требуют соответствующей клинической интерпретации.",
      action:
        "Проверьте измерение и его динамику относительно предыдущих наблюдений. Следуйте применимому медицинскому протоколу миссии.",
      category: "Иммунное здоровье",
    },
    cardiovascular: {
      title: "Проверьте динамику сердечно-сосудистых показателей",
      explanation:
        "NASA рассматривает адаптацию сердечно-сосудистой системы как важный риск космических полётов. Изменения следует оценивать с учётом индивидуального исходного уровня и этапа миссии.",
      action:
        "Просмотрите историю измерений и сравните её с личным исходным уровнем. Соблюдайте применимый протокол мониторинга сердечно-сосудистой системы.",
      category: "Сердечно-сосудистое здоровье",
    },
    general: {
      title: "Проверьте это наблюдение за здоровьем",
      explanation:
        "Для этого наблюдения обнаружен предупреждающий признак, однако ASTRA пока не располагает специальным правилом рекомендаций, связанным с научными данными для данной формулировки.",
      action:
        "Проверьте исходное измерение и его историю. Обратитесь к применимому медицинскому протоколу миссии, не интерпретируя это наблюдение изолированно.",
      category: "Общий мониторинг здоровья",
    },
    routine: {
      title: "Продолжайте регулярный мониторинг здоровья",
      explanation:
        "Программа NASA по исследованию человека использует долгосрочные данные и мониторинг, чтобы изучать изменения здоровья человека во время космических полётов. Отсутствие отмеченных предупреждений не означает, что все показатели здоровья находятся в норме.",
      action:
        "Просмотрите последние измерения, регулярно обновляйте данные о состоянии здоровья и сравнивайте изменения с личным исходным уровнем.",
      category: "Регулярный мониторинг",
    },
    evidence: {
      general: "NASA — Библиотека научных данных программы исследований человека",
      sleep: "NASA — Медицинский технический обзор нарушения циркадных ритмов",
      exercise: "NASA — Обзор физических упражнений",
      behavioral: "NASA — Риски для здоровья человека в космосе",
      radiation: "NASA — Риски пилотируемых космических полётов",
      environment: "NASA — Риски программы исследований человека",
    },
  },
  zh: {
    sleep: {
      title: "检查睡眠与休息安排",
      explanation:
        "NASA指出，睡眠不足、昼夜节律失调和工作负荷过重可能影响宇航员的警觉性、工作表现和健康。",
      action:
        "查看近期睡眠记录以及工作与休息安排。将其与计划睡眠时间进行比较，并遵循任务批准的疲劳管理程序。",
      category: "睡眠与昼夜节律健康",
    },
    fatigue: {
      title: "检查疲劳程度与工作负荷",
      explanation:
        "NASA研究指出，睡眠不足和工作负荷过重会对乘组健康和任务表现构成风险。",
      action:
        "检查近期工作负荷、休息机会和睡眠记录。如果这种情况持续，请遵循任务疲劳管理程序。",
      category: "疲劳管理",
    },
    exercise: {
      title: "检查运动与身体表现趋势",
      explanation:
        "NASA将有氧能力、肌肉力量和骨骼强度下降列为载人航天的重要健康风险。运动是已确立的应对措施，但效果因人而异。",
      action:
        "检查运动记录以及规定任务运动计划的执行情况。将当前身体表现与个人基线进行比较。",
      category: "身体健康",
    },
    behavioral: {
      title: "检查行为与认知状态",
      explanation:
        "NASA将行为健康、认知表现和心理社会适应视为长期任务中的重要因素。",
      action:
        "检查近期观察记录和工作负荷背景。必要时使用任务批准的行为健康检查和支持资源。",
      category: "行为与认知健康",
    },
    radiation: {
      title: "检查辐射暴露情况",
      explanation:
        "太空辐射是公认的载人航天风险。应结合任务条件和批准的监测程序来解释辐射暴露测量结果。",
      action:
        "检查记录的辐射暴露测量值、测量时间范围以及适用的任务监测方案。必要时按照批准的程序上报。",
      category: "辐射监测",
    },
    environment: {
      title: "检查环境监测数据",
      explanation:
        "舱内环境条件，包括二氧化碳和氧气水平，与乘组健康和工作表现密切相关。",
      action:
        "检查原始环境测量值及其变化趋势。遵循适用的飞行器环境监测和安全程序。",
      category: "环境健康",
    },
    temperature: {
      title: "检查体温观察结果",
      explanation:
        "体温数据应结合其他测量结果和宇航员的临床背景进行解读。",
      action:
        "检查记录的数值、测量时间以及相关观察结果。遵循任务批准的医疗监测程序。",
      category: "一般健康监测",
    },
    immune: {
      title: "检查免疫健康指标",
      explanation:
        "NASA将免疫反应变化列为载人航天健康风险。个体测量结果需要适当的临床解读。",
      action:
        "检查该测量值及其相对于先前观察结果的变化趋势。遵循适用的任务医疗方案。",
      category: "免疫健康",
    },
    cardiovascular: {
      title: "检查心血管指标趋势",
      explanation:
        "NASA将心血管适应变化视为载人航天的重要风险。应结合个人基线和任务阶段解读相关变化。",
      action:
        "查看测量历史，并与个人基线进行比较。遵循适用的心血管监测方案。",
      category: "心血管健康",
    },
    general: {
      title: "检查此项健康观察",
      explanation:
        "此项观察已被标记，但ASTRA目前尚无与该描述对应的专门科学证据指导规则。",
      action:
        "检查原始测量值及其历史记录。请参考适用的任务健康方案，不要孤立地解读此项观察。",
      category: "一般健康监测",
    },
    routine: {
      title: "继续进行常规健康监测",
      explanation:
        "NASA人体研究计划通过长期数据和持续监测，了解人类在太空飞行期间的健康变化。没有被标记的异常观察，并不代表所有健康指标都处于正常范围。",
      action:
        "查看最新测量结果，及时更新健康观察记录，并将变化与个人基线进行比较。",
      category: "常规监测",
    },
    evidence: {
      general: "NASA — 人体研究计划证据库",
      sleep: "NASA — 昼夜节律失调医学技术简报",
      exercise: "NASA — 运动概述",
      behavioral: "NASA — 人体系统风险",
      radiation: "NASA — 载人航天风险",
      environment: "NASA — 人体研究计划风险",
    },
  },
} as const;

type GuidanceKey =
  | "sleep"
  | "fatigue"
  | "exercise"
  | "behavioral"
  | "radiation"
  | "environment"
  | "temperature"
  | "immune"
  | "cardiovascular"
  | "general"
  | "routine";

type EvidenceKey =
  | "general"
  | "sleep"
  | "exercise"
  | "behavioral"
  | "radiation"
  | "environment";

function getGuidanceKey(alert: string): GuidanceKey {
  const text = alert.toLowerCase();

  if (["sleep", "insomnia", "circadian"].some((word) => text.includes(word))) {
    return "sleep";
  }

  if (["fatigue", "tired", "exhaust"].some((word) => text.includes(word))) {
    return "fatigue";
  }

  if (
    ["exercise", "muscle", "strength", "bone", "density", "physical"].some(
      (word) => text.includes(word)
    )
  ) {
    return "exercise";
  }

  if (
    ["cognitive", "concentration", "performance", "behavioral", "mood", "stress"].some(
      (word) => text.includes(word)
    )
  ) {
    return "behavioral";
  }

  if (["radiation", "dose", "exposure"].some((word) => text.includes(word))) {
    return "radiation";
  }

  if (
    ["co2", "carbon dioxide", "cabin", "environment", "ventilation", "oxygen", "hypoxia"].some(
      (word) => text.includes(word)
    )
  ) {
    return "environment";
  }

  if (["temperature", "fever"].some((word) => text.includes(word))) {
    return "temperature";
  }

  if (["crp", "immune", "inflammation"].some((word) => text.includes(word))) {
    return "immune";
  }

  if (
    ["heart", "cardio", "blood pressure", "heart rate", "hrv"].some(
      (word) => text.includes(word)
    )
  ) {
    return "cardiovascular";
  }

  return "general";
}

const EVIDENCE_BY_GUIDANCE: Record<GuidanceKey, EvidenceKey> = {
  sleep: "sleep",
  fatigue: "sleep",
  exercise: "exercise",
  behavioral: "behavioral",
  radiation: "radiation",
  environment: "environment",
  temperature: "general",
  immune: "environment",
  cardiovascular: "general",
  general: "general",
  routine: "general",
};

function getGuidance(
  alert: string,
  language: Language
): Guidance {
  const key = getGuidanceKey(alert);
  const content = guidanceTranslations[language][key];
  const evidenceKey = EVIDENCE_BY_GUIDANCE[key];

  return {
    ...content,
    evidenceTitle: guidanceTranslations[language].evidence[evidenceKey],
    evidenceUrl: NASA_EVIDENCE[evidenceKey].url,
  };
}

function getGuidanceItems(
  record: HealthRecord,
  language: Language
): GuidanceItem[] {
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
      guidance: getGuidance(alert, language),
    }));
}

function getGeneralGuidance(language: Language): Guidance {
  const content = guidanceTranslations[language].routine;

  return {
    ...content,
    evidenceTitle: guidanceTranslations[language].evidence.general,
    evidenceUrl: NASA_EVIDENCE.general.url,
  };
}

export default function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { selectedMissionDay } = useMissionDay();
  const { t, language } = usePreferences();

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
            (a, b) => Number(a.Mission_Day) - Number(b.Mission_Day)
          );
          setRecords(sorted);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
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
          (record) => Number(record.Mission_Day) === selectedMissionDay
        ) ?? latestRecord;

  const suggestions = selectedRecord
    ? getGuidanceItems(selectedRecord, language)
    : [];

  useEffect(() => {
    setExpandedIndex(null);
  }, [selectedMissionDay]);

  return (
      <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-[#1b2b48] bg-[#080f22] p-5">
        <div className="mb-8">
          <div className="flex w-full items-center justify-start">
            <img
              src={logo}
              alt="ASTRA"
              className="block h-auto w-full max-w-[245px] object-contain object-left"
            />
          </div>

          <p className="mt-3 text-xs tracking-wide text-slate-400">
            {t("sidebar.subtitle")}
          </p>
        </div>

      <nav className="space-y-2" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path;

          return (
            <button
              key={item.path}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {t(item.key)}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={17} className="text-cyan-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-200">
              {t("sidebar.guidance")}
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
            {t("sidebar.missionDay")} {selectedRecord.Mission_Day}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
            <RefreshCw size={13} className="animate-spin" aria-hidden="true" />
            {t("sidebar.loading")}
          </div>
        ) : error ? (
          <p className="py-2 text-xs text-slate-500">
            {t("sidebar.unavailable")}
          </p>
        ) : !selectedRecord ? (
          <p className="py-2 text-xs text-slate-500">
            {t("sidebar.noObservations")}
          </p>
        ) : (
          <div className="space-y-2">
            {(suggestions.length > 0
              ? suggestions
              : [
                  {
                    alert: t("sidebar.noAlerts"),
                    guidance: getGeneralGuidance(language),
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
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedIndex(expanded ? null : index)
                    }
                    className="flex w-full items-start gap-2 p-3 text-left transition hover:bg-slate-800/60"
                  >
                    {suggestions.length > 0 ? (
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-cyan-400"
                        aria-hidden="true"
                      />
                    )}

                    <span className="min-w-0 flex-1 text-xs leading-relaxed text-slate-300">
                      {item.guidance.title}
                    </span>

                    {expanded ? (
                      <ChevronDown
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {expanded && (
                    <div className="space-y-3 border-t border-slate-800 px-3 py-3">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t("sidebar.observation")}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {item.alert}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-500">
                          {t("sidebar.evidenceContext")}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {item.guidance.explanation}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-500">
                          {t("sidebar.nextStep")}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-300">
                          {item.guidance.action}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t("sidebar.topic")}
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
                        <BookOpen size={13} aria-hidden="true" />
                        {t("sidebar.readEvidence")}
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
          {t("sidebar.disclaimer")}
        </p>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-5">
        <p className="text-xs text-slate-500">{t("sidebar.footer")}</p>
        <p className="mt-1 text-xs text-slate-600">{t("sidebar.prototype")}</p>
      </div>
    </aside>
  );
}
