import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[34px] border border-white/10 bg-white/[0.06] p-7 shadow-[0_32px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
      <div className="grid gap-8 md:grid-cols-[0.92fr_1.08fr]">
        <div>
          <p className="mono text-xs uppercase tracking-[0.32em] text-orange-200">
            Account setup
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">
            Create a workspace for one-time shares
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Each uploaded file gets a unique code. The receiver uses that code once, and
            the share burns itself automatically after access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-white/[0.12] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-300/60 focus:bg-white/[0.08]"
              placeholder="Rahul"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-2xl border border-white/[0.12] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-300/60 focus:bg-white/[0.08]"
              placeholder="rahul@gmail.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-white/[0.12] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-300/60 focus:bg-white/[0.08]"
              placeholder="Minimum 6 characters"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Confirm password
            </span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value
                }))
              }
              className="w-full rounded-2xl border border-white/[0.12] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-300/60 focus:bg-white/[0.08]"
              placeholder="Repeat the password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-teal-300 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          {error ? (
            <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <p className="text-sm text-slate-300">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-teal-200 hover:text-teal-100">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
