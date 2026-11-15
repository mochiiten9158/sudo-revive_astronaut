
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  embedded?: boolean;
}

export default function Login({ embedded = false }: LoginProps) {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [astronautId, setAstronautId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await login(astronautId.trim(), password);

      const destination =
        (location.state as { from?: string } | null)?.from || "/";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const loginForm = (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl text-white"
    >
      {!embedded && (
        <h2 className="text-xl font-semibold mb-7">
          Astronaut Login
        </h2>
      )}

      <label
        htmlFor="astronaut-id"
        className="block text-sm text-slate-300 mb-2"
      >
        Astronaut ID
      </label>

      <div className="relative mb-5">
        <UserRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

        <input
          id="astronaut-id"
          type="text"
          value={astronautId}
          onChange={(event) => setAstronautId(event.target.value)}
          placeholder="Enter your astronaut ID"
          autoComplete="username"
          required
          autoFocus={embedded}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
        />
      </div>

      <label
        htmlFor="astronaut-password"
        className="block text-sm text-slate-300 mb-2"
      >
        Password
      </label>

      <div className="relative mb-6">
        <LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

        <input
          id="astronaut-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <p className="mt-6 text-center text-xs text-slate-500">
        Authorized astronaut access only
      </p>
    </form>
  );

  if (embedded) {
    return loginForm;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-[0.2em]">
            ASTRA
          </h1>

          <p className="mt-3 text-sm tracking-widest text-cyan-400">
            ASTRONAUT HEALTH COMPANION
          </p>

          <p className="mt-5 text-slate-400 text-sm">
            Sign in to access your personal health dashboard.
          </p>
        </div>

        {loginForm}

        <p className="mt-8 text-center text-xs text-slate-600">
          ASTRA · Astronaut Status Tracking & Risk Analytics
        </p>
      </div>
    </div>
  );
}
