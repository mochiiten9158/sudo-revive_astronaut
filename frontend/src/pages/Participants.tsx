
import { useEffect, useState } from "react";
import {
  getParticipants,
  getParticipantHealth
} from "../services/api";

import type { HealthRecord } from "../types/health";

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

export default function Participants() {
  const [participants, setParticipants] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getParticipants()
      .then((ids) => {
        setParticipants(ids);

        if (ids.length > 0) {
          setSelected(ids[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selected === null) return;

    setLoading(true);
    setError(null);

    getParticipantHealth(selected)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            (a.Timepoint_order ?? 0) -
            (b.Timepoint_order ?? 0)
        );

        setRecords(sorted);
      })
      .catch((err) => {
        setError(err.message);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  if (loading && records.length === 0) {
    return <p className="text-slate-400">Loading participant data...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  const first = records[0];

  const chartData = records.map((record) => ({
    timepoint: `${record.Test_Phase} (${record.Day})`,
    day: record.Elapsed_Day,
    lvDiastole: record["Left Ventricular Diameter Diastole"],
    lvSystole: record["Left Ventricular Diameter Systole"],
    mitralE: record["Mitral E Wave Velocity"],
    mitralA: record["Mitral A Wave Velocity"]
  }));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold">
          Participant Explorer
        </h2>
        <p className="text-slate-400 mt-2">
          Explore individual longitudinal health observations.
        </p>
      </div>

      {/* Participant selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <label className="block text-sm text-slate-400 mb-2">
          Select participant
        </label>

        <select
          value={selected ?? ""}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 w-full md:w-72 text-white"
        >
          {participants.map((id) => (
            <option key={id} value={id}>
              Participant {id}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading observations...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Participant ID
              </p>
              <p className="text-2xl font-semibold mt-2">
                {selected}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Treatment group
              </p>
              <p className="text-2xl font-semibold mt-2">
                {first?.Treatment ?? "—"}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Observations
              </p>
              <p className="text-2xl font-semibold mt-2">
                {records.length}
              </p>
            </div>

          </div>

          {/* Provenance */}
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-2 rounded-lg bg-cyan-950 text-cyan-300 text-sm">
              Cardiovascular: NASA 2D source measurements
            </span>
            <span className="px-3 py-2 rounded-lg bg-amber-950 text-amber-300 text-sm">
              Other domains: Synthetic demonstration data
            </span>
          </div>

          {/* Cardiovascular chart */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">
                Left Ventricular Dimensions
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Measurements across study timepoints
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    label={{
                      value: "Elapsed study days",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#94a3b8"
                    }}
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px"
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="lvDiastole"
                    name="LV Diastole"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    connectNulls={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="lvSystole"
                    name="LV Systole"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Source: NASA 2D echocardiography measurements.
              Verify measurement units against the source documentation.
            </p>
          </section>

          {/* Mitral velocity chart */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">
                Mitral Flow Velocities
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                E-wave and A-wave measurements over time
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px"
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="mitralE"
                    name="Mitral E Velocity"
                    stroke="#34d399"
                    strokeWidth={2}
                    connectNulls={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="mitralA"
                    name="Mitral A Velocity"
                    stroke="#fb923c"
                    strokeWidth={2}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Observation timeline */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-5">
              Observation Timeline
            </h3>

            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.ID ?? `${record.Test_Phase}-${record.Day}`}
                  className="border-l-2 border-cyan-500 pl-5 py-2"
                >
                  <p className="font-medium">
                    {record.Test_Phase}
                  </p>

                  <p className="text-sm text-slate-400">
                    Day {record.Day} · Elapsed day {record.Elapsed_Day}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                    <p>
                      LV Diastole:{" "}
                      <span className="text-cyan-300">
                        {record["Left Ventricular Diameter Diastole"] ?? "—"}
                      </span>
                    </p>

                    <p>
                      LV Systole:{" "}
                      <span className="text-cyan-300">
                        {record["Left Ventricular Diameter Systole"] ?? "—"}
                      </span>
                    </p>

                    <p>
                      Mitral E:{" "}
                      <span className="text-cyan-300">
                        {record["Mitral E Wave Velocity"] ?? "—"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
