import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import Overview from "./pages/Overview";
import HealthTrends from "./pages/HealthTrends";
import DailyGuidance from "./pages/DailyGuidance";
import MissionTimeline from "./pages/MissionTimeline";
import PersonalBaseline from "./pages/PersonalBaseline";
import Login from "./pages/Login";

import WelcomeScreen from "./components/WelcomeScreen";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { MissionDayContext } from "./context/MissionDayContext";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { astronaut, logout } = useAuth();

  const [selectedMissionDay, setSelectedMissionDay] =
    useState<number | null>(null);

  return (
    <MissionDayContext.Provider
      value={{
        selectedMissionDay,
        setSelectedMissionDay,
      }}
    >
      <div className="flex min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen flex-col">
          <Sidebar
            currentPath={location.pathname}
            onNavigate={navigate}
          />

          <div className="border-t border-slate-800 p-4">
            <p className="text-sm font-medium text-white">
              {astronaut?.display_name}
            </p>

            <p className="mb-3 text-xs text-slate-400">
              ID: {astronaut?.astronaut_id}
            </p>

            <button
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Sign out
            </button>
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Overview />} />

            <Route path="/trends" element={<HealthTrends />} />

            <Route path="/guidance" element={<DailyGuidance />} />

            <Route path="/timeline" element={<MissionTimeline />} />

            <Route path="/baseline" element={<PersonalBaseline />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </MissionDayContext.Provider>
  );
}

function WelcomeRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <WelcomeScreen loginContent={<Login embedded />} />;
}

function HomeRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppLayout />;
  }

  return <WelcomeRoute />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      <Route path="/login" element={<WelcomeRoute />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}