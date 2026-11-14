import type { KeyboardEvent } from "react";

interface HeartAnatomyProps {
  metrics: string[];
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
}

interface HeartRegion {
  id: string;
  label: string;
  description: string;
  color: string;
  metrics: string[];
}

const regions: HeartRegion[] = [
  {
    id: "right-atrium",
    label: "Right atrium",
    description: "Receives blood returning from the body.",
    color: "#38bdf8",
    metrics: [
      "TDI Right Heart Rate"
    ]
  },
  {
    id: "right-ventricle",
    label: "Right ventricle",
    description: "Pumps blood toward the pulmonary circulation.",
    color: "#0ea5e9",
    metrics: [
      "Tricuspid E Velocity",
      "Tricuspid A Velocity",
      "Tricuspid Regurgitation",
      "TDI Tricuspid Systole",
      "TDI Tricuspid E Wave",
      "TDI Tricuspid A Wave",
      "TDI Right Heart Rate"
    ]
  },
  {
    id: "left-atrium",
    label: "Left atrium",
    description: "Receives oxygenated blood from the lungs.",
    color: "#c084fc",
    metrics: [
      "Mitral E Wave Velocity",
      "Mitral A Wave Velocity",
      "Mitral Deceleration Time"
    ]
  },
  {
    id: "left-ventricle",
    label: "Left ventricle",
    description: "Pumps blood into the systemic circulation.",
    color: "#22d3ee",
    metrics: [
      "Left Ventricular Diameter Diastole",
      "Left Ventricular Diameter Systole",
      "LVOT Velocity Time Integral",
      "TDI Left Heart Rate"
    ]
  },
  {
    id: "mitral-valve",
    label: "Mitral valve",
    description: "Between the left atrium and left ventricle.",
    color: "#a78bfa",
    metrics: [
      "Mitral E Wave Velocity",
      "Mitral A Wave Velocity",
      "Mitral Deceleration Time"
    ]
  },
  {
    id: "tricuspid-valve",
    label: "Tricuspid valve",
    description: "Between the right atrium and right ventricle.",
    color: "#38bdf8",
    metrics: [
      "Tricuspid E Velocity",
      "Tricuspid A Velocity",
      "Tricuspid Regurgitation"
    ]
  },
  {
    id: "pulmonary-valve",
    label: "Pulmonary valve",
    description: "Controls blood flow from the right ventricle toward the lungs.",
    color: "#34d399",
    metrics: [
      "Pulmonic Valve Acceleration Time",
      "Pulmonic Valve Ejection Time"
    ]
  },
  {
    id: "aortic-valve",
    label: "Aortic valve",
    description: "Controls blood flow from the left ventricle into the aorta.",
    color: "#fbbf24",
    metrics: [
      "Aortic Valve Close Open",
      "Ejection Time",
      "Isovolumic Contraction Time",
      "Isovolumic Relaxation Time"
    ]
  },
  {
    id: "septum",
    label: "Interventricular septum",
    description: "Wall separating the two ventricles; tissue Doppler measurements are available.",
    color: "#fb923c",
    metrics: [
      "TDI Basal Septal Systole",
      "TDI Basal Septal E",
      "TDI Basal Septal A"
    ]
  }
];

export default function HeartAnatomy({
  metrics,
  selectedMetric,
  onSelectMetric
}: HeartAnatomyProps) {

  const selectedRegion = regions.find(region =>
    region.metrics.includes(selectedMetric)
  );

  function selectRegion(region: HeartRegion) {
    const available = region.metrics.filter(metric =>
      metrics.includes(metric)
    );

    if (available.length > 0) {
      onSelectMetric(
        available.includes(selectedMetric)
          ? selectedMetric
          : available[0]
      );
    }
  }

  function isRegionSelected(region: HeartRegion) {
    return region.metrics.includes(selectedMetric);
  }

  function regionClass(region: HeartRegion) {
    const selected = isRegionSelected(region);

    return [
      "cursor-pointer transition-all duration-200",
      selected
        ? "opacity-100"
        : "opacity-75 hover:opacity-100"
    ].join(" ");
  }

  function handleKeyDown(
    event: KeyboardEvent<SVGGElement>,
    region: HeartRegion
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectRegion(region);
    }
  }

  const availableSelectedMetrics = selectedRegion
    ? selectedRegion.metrics.filter(metric =>
        metrics.includes(metric)
      )
    : [];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">

      <div>
        <h3 className="text-lg font-semibold">
          Interactive Cardiac Anatomy
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Select a chamber, valve, or anatomical structure to
          explore its associated echocardiography measurements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ANATOMICAL SVG */}
        <div className="lg:col-span-3 bg-slate-950 rounded-xl p-3
          border border-slate-800">

          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">
              ANTERIOR VIEW · SCHEMATIC
            </span>

            <span className="text-xs text-cyan-300">
              Select a region
            </span>
          </div>

          <svg
            viewBox="0 0 500 540"
            className="w-full h-auto max-h-[580px]"
            role="img"
            aria-label="Interactive schematic of the four chambers and valves of the human heart"
          >

            <defs>
              <linearGradient id="heartOuter" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb7185"/>
                <stop offset="100%" stopColor="#9f1239"/>
              </linearGradient>

              <linearGradient id="heartLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f87171"/>
                <stop offset="100%" stopColor="#be123c"/>
              </linearGradient>

              <linearGradient id="heartRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8"/>
                <stop offset="100%" stopColor="#0369a1"/>
              </linearGradient>

              <filter id="heartGlow">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* AORTA */}
            <path
              d="M 280 180
                 L 280 100
                 C 280 50 325 35 355 55
                 C 390 80 365 125 340 125
                 L 340 185"
              fill="none"
              stroke="#f87171"
              strokeWidth="34"
              strokeLinecap="round"
            />

            <path
              d="M 355 55 C 380 20 420 25 430 55"
              fill="none"
              stroke="#f87171"
              strokeWidth="22"
              strokeLinecap="round"
            />

            {/* PULMONARY ARTERY */}
            <path
              d="M 205 185
                 L 205 110
                 C 205 75 175 65 145 80
                 C 115 95 125 125 150 135"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="28"
              strokeLinecap="round"
            />

            {/* SUPERIOR VENA CAVA */}
            <path
              d="M 100 45 L 100 175"
              stroke="#38bdf8"
              strokeWidth="27"
              strokeLinecap="round"
            />

            {/* INFERIOR VENA CAVA */}
            <path
              d="M 100 345 L 100 455"
              stroke="#38bdf8"
              strokeWidth="25"
              strokeLinecap="round"
            />

            {/* LEFT ATRIUM: VIEWER'S RIGHT */}
            <g
              className={regionClass(regions[2])}
              onClick={() => selectRegion(regions[2])}
              onKeyDown={event => handleKeyDown(event, regions[2])}
              tabIndex={0}
              role="button"
              aria-label="Select left atrium"
            >
              <path
                d="M 285 155
                   C 340 125 390 155 390 220
                   C 390 260 355 280 310 270
                   L 275 235 Z"
                fill="#c084fc"
                fillOpacity={isRegionSelected(regions[2]) ? 1 : 0.65}
                stroke={isRegionSelected(regions[2]) ? "#e9d5ff" : "#7e22ce"}
                strokeWidth={isRegionSelected(regions[2]) ? 5 : 2}
              />
              <text x="337" y="212" textAnchor="middle"
                fontSize="14" fill="#fff" fontWeight="bold">
                LA
              </text>
            </g>

            {/* RIGHT ATRIUM: VIEWER'S LEFT */}
            <g
              className={regionClass(regions[0])}
              onClick={() => selectRegion(regions[0])}
              onKeyDown={event => handleKeyDown(event, regions[0])}
              tabIndex={0}
              role="button"
              aria-label="Select right atrium"
            >
              <path
                d="M 115 170
                   C 65 160 55 220 80 260
                   C 100 285 145 275 185 250
                   L 195 190 Z"
                fill="#0ea5e9"
                fillOpacity={isRegionSelected(regions[0]) ? 1 : 0.65}
                stroke={isRegionSelected(regions[0]) ? "#bae6fd" : "#0369a1"}
                strokeWidth={isRegionSelected(regions[0]) ? 5 : 2}
              />
              <text x="125" y="220" textAnchor="middle"
                fontSize="14" fill="#fff" fontWeight="bold">
                RA
              </text>
            </g>

            {/* LEFT VENTRICLE: VIEWER'S RIGHT */}
            <g
              className={regionClass(regions[3])}
              onClick={() => selectRegion(regions[3])}
              onKeyDown={event => handleKeyDown(event, regions[3])}
              tabIndex={0}
              role="button"
              aria-label="Select left ventricle"
            >
              <path
                d="M 270 245
                   C 320 245 385 270 370 350
                   C 360 425 305 475 250 510
                   C 235 450 225 375 235 305
                   Z"
                fill="url(#heartLeft)"
                fillOpacity={isRegionSelected(regions[3]) ? 1 : 0.78}
                stroke={isRegionSelected(regions[3]) ? "#fecdd3" : "#be123c"}
                strokeWidth={isRegionSelected(regions[3]) ? 6 : 2}
              />
              <text x="310" y="360" textAnchor="middle"
                fontSize="18" fill="#fff" fontWeight="bold">
                LV
              </text>
            </g>

            {/* RIGHT VENTRICLE: VIEWER'S LEFT */}
            <g
              className={regionClass(regions[1])}
              onClick={() => selectRegion(regions[1])}
              onKeyDown={event => handleKeyDown(event, regions[1])}
              tabIndex={0}
              role="button"
              aria-label="Select right ventricle"
            >
              <path
                d="M 185 250
                   C 220 250 255 270 260 325
                   C 265 395 235 455 205 475
                   C 155 440 115 390 120 325
                   C 120 285 145 260 185 250 Z"
                fill="url(#heartRight)"
                fillOpacity={isRegionSelected(regions[1]) ? 1 : 0.75}
                stroke={isRegionSelected(regions[1]) ? "#bae6fd" : "#0369a1"}
                strokeWidth={isRegionSelected(regions[1]) ? 6 : 2}
              />
              <text x="180" y="355" textAnchor="middle"
                fontSize="18" fill="#fff" fontWeight="bold">
                RV
              </text>
            </g>

            {/* SEPTUM */}
            <g
              className={regionClass(regions[8])}
              onClick={() => selectRegion(regions[8])}
              onKeyDown={event => handleKeyDown(event, regions[8])}
              tabIndex={0}
              role="button"
              aria-label="Select interventricular septum"
            >
              <path
                d="M 230 260 Q 250 330 250 495"
                fill="none"
                stroke={isRegionSelected(regions[8]) ? "#fb923c" : "#fda4af"}
                strokeWidth={isRegionSelected(regions[8]) ? 15 : 9}
                strokeLinecap="round"
              />
            </g>

            {/* MITRAL VALVE */}
            <g
              className={regionClass(regions[4])}
              onClick={() => selectRegion(regions[4])}
              onKeyDown={event => handleKeyDown(event, regions[4])}
              tabIndex={0}
              role="button"
              aria-label="Select mitral valve"
            >
              <circle
                cx="265"
                cy="255"
                r="19"
                fill="#a78bfa"
                stroke={isRegionSelected(regions[4]) ? "#fff" : "#6d28d9"}
                strokeWidth="4"
              />
              <path d="M 253 245 L 277 265 M 277 245 L 253 265"
                stroke="#fff" strokeWidth="3"/>
            </g>

            {/* TRICUSPID VALVE */}
            <g
              className={regionClass(regions[5])}
              onClick={() => selectRegion(regions[5])}
              onKeyDown={event => handleKeyDown(event, regions[5])}
              tabIndex={0}
              role="button"
              aria-label="Select tricuspid valve"
            >
              <circle
                cx="205"
                cy="255"
                r="17"
                fill="#38bdf8"
                stroke={isRegionSelected(regions[5]) ? "#fff" : "#0369a1"}
                strokeWidth="4"
              />
              <path d="M 195 245 L 215 265 M 215 245 L 195 265"
                stroke="#fff" strokeWidth="3"/>
            </g>

            {/* PULMONARY VALVE */}
            <g
              className={regionClass(regions[6])}
              onClick={() => selectRegion(regions[6])}
              onKeyDown={event => handleKeyDown(event, regions[6])}
              tabIndex={0}
              role="button"
              aria-label="Select pulmonary valve"
            >
              <circle
                cx="205"
                cy="145"
                r="14"
                fill="#34d399"
                stroke={isRegionSelected(regions[6]) ? "#fff" : "#047857"}
                strokeWidth="4"
              />
            </g>

            {/* AORTIC VALVE */}
            <g
              className={regionClass(regions[7])}
              onClick={() => selectRegion(regions[7])}
              onKeyDown={event => handleKeyDown(event, regions[7])}
              tabIndex={0}
              role="button"
              aria-label="Select aortic valve"
            >
              <circle
                cx="280"
                cy="155"
                r="14"
                fill="#fbbf24"
                stroke={isRegionSelected(regions[7]) ? "#fff" : "#92400e"}
                strokeWidth="4"
              />
            </g>

            {/* ORIENTATION LABELS */}
            <text x="100" y="505" fill="#38bdf8" fontSize="12"
              textAnchor="middle">
              ANATOMICAL RIGHT
            </text>

            <text x="365" y="505" fill="#fb7185" fontSize="12"
              textAnchor="middle">
              ANATOMICAL LEFT
            </text>

          </svg>

          <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"/>
              Right heart
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"/>
              Left heart
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"/>
              Atrial structures
            </span>
          </div>
        </div>

        {/* REGION DETAILS */}
        <div className="lg:col-span-2 space-y-4">

          <div className="bg-slate-950 border border-slate-800
            rounded-xl p-5">

            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Selected measurement
            </p>

            <h4 className="text-lg text-cyan-300 font-semibold mt-2">
              {selectedMetric || "No measurement selected"}
            </h4>

            <p className="text-sm text-slate-400 mt-3">
              {selectedRegion?.description ??
                "Select an anatomical region to explore its measurements."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">
              Anatomical regions
            </h4>

            <div className="space-y-2">
              {regions.map(region => {
                const available = region.metrics.filter(metric =>
                  metrics.includes(metric)
                );

                const selected = isRegionSelected(region);

                return (
                  <button
                    key={region.id}
                    onClick={() => selectRegion(region)}
                    disabled={available.length === 0}
                    className={`w-full flex items-center justify-between
                      gap-3 rounded-lg border p-3 text-left transition
                      ${selected
                        ? "bg-cyan-500/10 border-cyan-500/40"
                        : "bg-slate-950 border-slate-800 hover:border-slate-600"
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: region.color }}
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {region.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-1">
                          {available.length} available measurements
                        </span>
                      </span>
                    </span>

                    <span className="text-xs text-cyan-300">
                      {selected ? "Selected" : "Explore"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800
            rounded-xl p-4">

            <h4 className="text-sm font-semibold mb-3">
              Available measurements
            </h4>

            {availableSelectedMetrics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSelectedMetrics.map(metric => (
                  <button
                    key={metric}
                    onClick={() => onSelectMetric(metric)}
                    className={`text-xs rounded-full px-3 py-2 border
                      transition
                      ${selectedMetric === metric
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-500/50"
                      }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No matching measurements are available for this region.
              </p>
            )}
          </div>

        </div>
      </div>

      <p className="text-xs text-slate-500">
        Anatomical schematic for data exploration only. It is not a
        patient-specific reconstruction, diagnostic image, or
        representation of measured cardiac geometry.
      </p>

    </section>
  );
}
