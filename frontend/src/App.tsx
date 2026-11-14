
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview";
import Participants from "./pages/Participants";
import Cardiovascular from "./pages/Cardiovascular";

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="text-slate-400 mt-3">
        Health analytics module under development.
      </p>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      <Sidebar
        currentPath={location.pathname}
        onNavigate={navigate}
      />

      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<Overview />} />

          <Route path="/participants" element={<Participants />} />

          <Route
            path="/cardiovascular"
            element={<Cardiovascular />}
          />

          <Route
            path="/musculoskeletal"
            element={<Placeholder title="Musculoskeletal Health" />}
          />

          <Route
            path="/behavioral"
            element={<Placeholder title="Behavioral Health" />}
          />

          <Route
            path="/radiation"
            element={<Placeholder title="Radiation & Environment" />}
          />

          <Route
            path="/immune"
            element={<Placeholder title="Immune Health" />}
          />

          <Route
            path="/actions"
            element={<Placeholder title="Action Center" />}
          />
        </Routes>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
