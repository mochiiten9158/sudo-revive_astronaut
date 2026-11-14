
import { useEffect, useState } from "react";
import {
  getHealthOverview
} from "../services/api";

import type {
  HealthOverview
} from "../types/health";

import HealthMetricCard from
  "../components/dashboard/HealthMetricCard";

export default function Overview() {

  const [data, setData] =
    useState<HealthOverview | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {

    getHealthOverview()
      .then(setData)
      .catch((err) => setError(err.message));

  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!data) {
    return <p className="text-slate-400">Loading ASTRA...</p>;
  }

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-3xl font-semibold">
          Mission Health Overview
        </h2>

        <p className="text-slate-400 mt-2">
          Integrated astronaut health monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <HealthMetricCard
          title="Participants"
          value={String(data.participants)}
          unit="subjects"
          description="Available research participants"
        />

        <HealthMetricCard
          title="Observations"
          value={String(data.observations)}
          unit="records"
          description="Longitudinal health observations"
        />

        <HealthMetricCard
          title="Synthetic observations"
          value={String(data.synthetic_records)}
          unit="records"
          description="Simulated data for demonstration"
          synthetic
        />

      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">
          Health domains
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {data.health_domains.map((domain) => (
            <div
              key={domain}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <h4 className="font-medium text-cyan-300">
                {domain}
              </h4>

              <p className="text-sm text-slate-400 mt-2">
                Explore longitudinal measurements and
                individual health trends.
              </p>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
