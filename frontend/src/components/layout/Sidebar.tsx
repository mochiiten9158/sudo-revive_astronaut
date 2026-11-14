
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Bone,
  Brain,
  Radiation,
  ShieldCheck,
  ClipboardList
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navigation = [
  {
    label: "Overview",
    path: "/",
    icon: LayoutDashboard
  },
  {
    label: "Participants",
    path: "/participants",
    icon: Users
  },
  {
    label: "Cardiovascular",
    path: "/cardiovascular",
    icon: HeartPulse
  },
  {
    label: "Musculoskeletal",
    path: "/musculoskeletal",
    icon: Bone
  },
  {
    label: "Behavioral",
    path: "/behavioral",
    icon: Brain
  },
  {
    label: "Radiation & Environment",
    path: "/radiation",
    icon: Radiation
  },
  {
    label: "Immune Health",
    path: "/immune",
    icon: ShieldCheck
  },
  {
    label: "Action Center",
    path: "/actions",
    icon: ClipboardList
  }
];

export default function Sidebar({
  currentPath,
  onNavigate
}: SidebarProps) {

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-5">

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-cyan-400">
          ASTRA
        </h1>
        <p className="text-xs text-slate-500 mt-1">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                active
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-12 pt-5 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          NASA Space Apps Challenge
        </p>
        <p className="text-xs text-slate-600 mt-1">
          ASTRA Prototype v1.0
        </p>
      </div>

    </aside>
  );
}
