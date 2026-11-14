
interface Props {
  title: string;
  value: string;
  unit: string;
  description: string;
  synthetic?: boolean;
}

export default function HealthMetricCard({
  title,
  value,
  unit,
  description,
  synthetic = false
}: Props) {

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex justify-between items-start">
        <h3 className="text-slate-400 text-sm">
          {title}
        </h3>

        {synthetic && (
          <span className="text-xs text-amber-300">
            Synthetic
          </span>
        )}
      </div>

      <div className="mt-4">
        <span className="text-3xl font-semibold text-white">
          {value}
        </span>

        <span className="ml-2 text-slate-400 text-sm">
          {unit}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
