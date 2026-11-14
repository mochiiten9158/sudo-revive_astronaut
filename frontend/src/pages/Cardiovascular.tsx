import HeartAnatomy from "../components/cardiovascular/HeartAnatomy";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API_URL = "http://localhost:8000";

interface CardioRecord {
  ID?: number;
  Subject: number;
  Treatment: string;
  Test_Phase: string;
  Day: string;
  Timepoint_order: number;
  [key: string]: string | number | null | undefined;
}

interface SummaryRecord {
  Treatment: string;
  Test_Phase: string;
  Day: string;
  Timepoint_order: number;
  mean: number | null;
  std: number | null;
  n: number;
}

const treatmentColors: Record<string, string> = {
  Control: "#94a3b8",
  "Exercise A": "#22d3ee",
  "Exercise B": "#a78bfa",
  Flywheel: "#34d399"
};

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export default function Cardiovascular() {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [records, setRecords] = useState<CardioRecord[]>([]);
  const [summary, setSummary] = useState<SummaryRecord[]>([]);

  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load actual cardiovascular observations and metric names.
  useEffect(() => {
    async function loadData() {
      try {
        const [metricResult, dataResult] = await Promise.all([
          fetchJSON<{ metrics: string[] }>(
            `${API_URL}/api/health/cardiovascular/metrics`
          ),
          fetchJSON<{
            observations: number;
            data: CardioRecord[];
          }>(`${API_URL}/api/health/cardiovascular/data`)
        ]);

        setMetrics(metricResult.metrics);
        setRecords(dataResult.data);

        if (metricResult.metrics.length > 0) {
          setSelectedMetric(metricResult.metrics[0]);
        }

        const subjects = [...new Set(
          dataResult.data.map(record => record.Subject)
        )].sort((a, b) => a - b);

        if (subjects.length > 0) {
          setSelectedSubject(subjects[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load cardiovascular data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Load treatment-group statistics whenever the selected metric changes.
  useEffect(() => {
    if (!selectedMetric) return;

    async function loadSummary() {
      setSummaryLoading(true);

      try {
        const result = await fetchJSON<{
          metric: string;
          groups: SummaryRecord[];
        }>(
          `${API_URL}/api/health/cardiovascular/summary?metric=${encodeURIComponent(selectedMetric)}`
        );

        setSummary(result.groups);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load summary"
        );
      } finally {
        setSummaryLoading(false);
      }
    }

    loadSummary();
  }, [selectedMetric]);

  const subjects = useMemo(
    () => [...new Set(records.map(record => record.Subject))]
      .sort((a, b) => a - b),
    [records]
  );

  const treatments = useMemo(
    () => [...new Set(summary.map(item => item.Treatment))],
    [summary]
  );

  // Convert long-form treatment summaries into chart-friendly rows.
  const populationChartData = useMemo(() => {
    const points = new Map<number, Record<string, string | number | null>>();

    summary.forEach(item => {
      if (!points.has(item.Timepoint_order)) {
        points.set(item.Timepoint_order, {
          order: item.Timepoint_order,
          label: `${item.Test_Phase} · Day ${item.Day}`
        });
      }

      points.get(item.Timepoint_order)![item.Treatment] = item.mean;
    });

    return [...points.values()].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );
  }, [summary]);

  const participantRecords = useMemo(() => {
    if (selectedSubject === null) return [];

    return records
      .filter(record => record.Subject === selectedSubject)
      .sort((a, b) => a.Timepoint_order - b.Timepoint_order);
  }, [records, selectedSubject]);

  const individualChartData = participantRecords.map(record => ({
    label: `${record.Test_Phase} · Day ${record.Day}`,
    value:
      typeof record[selectedMetric] === "number"
        ? record[selectedMetric]
        : null
  }));

  const missingCount = records.filter(
    record => typeof record[selectedMetric] !== "number"
  ).length;

  const average = summary.length
    ? summary.reduce((total, item) => total + (item.mean ?? 0), 0) /
      summary.filter(item => item.mean !== null).length
    : null;

  if (loading) {
    return <p className="text-slate-400">Loading cardiovascular data...</p>;
  }

  if (error && records.length === 0) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-semibold">
          Cardiovascular Health
        </h2>

        <p className="text-slate-400 mt-2">
          Longitudinal echocardiography analysis across treatment groups
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full
          border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-xs text-cyan-300">
            NASA 2D bed-rest analog dataset · Not actual spaceflight data
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">Participants</p>
          <p className="text-3xl font-semibold mt-2">{subjects.length}</p>
          <p className="text-xs text-slate-500 mt-2">
            Unique study subjects
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">Observations</p>
          <p className="text-3xl font-semibold mt-2">{records.length}</p>
          <p className="text-xs text-slate-500 mt-2">
            Original cardiovascular records
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">Available measurements</p>
          <p className="text-3xl font-semibold mt-2">{metrics.length}</p>
          <p className="text-xs text-slate-500 mt-2">
            Numeric echocardiography variables
          </p>
        </div>

      </div>

      {/* METRIC SELECTOR */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center
          justify-between gap-4">

          <div>
            <h3 className="text-lg font-semibold">
              Measurement Explorer
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Select an echocardiography measurement to explore.
            </p>
          </div>

          <select
            value={selectedMetric}
            onChange={event => setSelectedMetric(event.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg
              px-4 py-3 text-sm text-white w-full md:w-96"
          >
            {metrics.map(metric => (
              <option key={metric} value={metric}>
                {metric}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* INTERACTIVE HEART ANATOMY */}
        <HeartAnatomy
        metrics={metrics}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
        />

      {/* POPULATION CHART */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold">
            Treatment Group Comparison
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Mean {selectedMetric} across study timepoints
          </p>
        </div>

        {summaryLoading ? (
          <p className="text-slate-400">Updating chart...</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={populationChartData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  angle={-12}
                  textAnchor="end"
                  height={65}
                />

                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  domain={["auto", "auto"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />

                <Legend />

                {treatments.map(treatment => (
                  <Line
                    key={treatment}
                    type="monotone"
                    dataKey={treatment}
                    name={treatment}
                    stroke={treatmentColors[treatment] ?? "#fbbf24"}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* SUMMARY TABLE */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Treatment Group Statistics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 pr-4">Treatment</th>
                <th className="py-3 pr-4">Timepoint</th>
                <th className="py-3 pr-4">Mean</th>
                <th className="py-3 pr-4">SD</th>
                <th className="py-3 pr-4">N</th>
              </tr>
            </thead>

            <tbody>
              {summary.map((item, index) => (
                <tr
                  key={`${item.Treatment}-${item.Timepoint_order}-${index}`}
                  className="border-b border-slate-800"
                >
                  <td className="py-3 pr-4">{item.Treatment}</td>
                  <td className="py-3 pr-4">
                    {item.Test_Phase} · {item.Day}
                  </td>
                  <td className="py-3 pr-4">
                    {item.mean?.toFixed(2) ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {item.std?.toFixed(2) ?? "—"}
                  </td>
                  <td className="py-3 pr-4">{item.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INDIVIDUAL PARTICIPANT */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center
          justify-between gap-4 mb-6">

          <div>
            <h3 className="text-lg font-semibold">
              Individual Participant Trajectory
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Follow one participant's measurements over time.
            </p>
          </div>

          <select
            value={selectedSubject ?? ""}
            onChange={event => setSelectedSubject(Number(event.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg
              px-4 py-3 text-sm text-white"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                Participant {subject}
              </option>
            ))}
          </select>
        </div>

        {selectedSubject !== null && (
          <p className="text-sm text-cyan-300 mb-4">
            Participant {selectedSubject}
            {" · "}
            {participantRecords[0]?.Treatment}
          </p>
        )}

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={individualChartData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                angle={-12}
                textAnchor="end"
                height={65}
              />

              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                domain={["auto", "auto"]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                name={selectedMetric}
                stroke="#22d3ee"
                strokeWidth={2}
                connectNulls={false}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* DATA QUALITY */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Data Quality
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <p className="text-sm text-slate-400">Selected measurement</p>
            <p className="text-sm font-medium mt-2 break-words">
              {selectedMetric}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Missing observations</p>
            <p className="text-2xl font-semibold mt-2">
              {missingCount}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Available observations</p>
            <p className="text-2xl font-semibold mt-2">
              {records.length - missingCount}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-5">
          Missing values are not imputed. Group statistics use available
          measurements only. Standard deviation is sample SD.
          No clinical interpretation or treatment-effect claim is implied.
        </p>
      </section>

    </div>
  );
}
