import { useState } from "react";
import { Link } from "react-router-dom";
import { accessSharedFile } from "../lib/api.js";
import {
  formatAccessCode,
  normalizeAccessCode,
  openDownloadedFile
} from "../lib/format.js";

const features = [
  "Upload PDFs, notes, images, videos, and documents",
  "Share with a generated 16-digit access code",
  "Delete the file and burn the code after the first successful access"
];

function HomePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedCode = normalizeAccessCode(code);

    if (normalizedCode.length !== 16) {
      setError("Enter the full 16-digit access code.");
      setSuccess("");
      return;
    }

    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.write(`
        <body style="margin:0;background:#020617;color:#e2e8f0;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;">
          <p>Preparing secure file...</p>
        </body>
      `);
    }

    try {
      setLoading(true);
      setError("");
      const file = await accessSharedFile(normalizedCode);
      openDownloadedFile(file, previewWindow);
      setSuccess(`${file.fileName} opened. The share has now been removed.`);
      setCode("");
    } catch (requestError) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      setSuccess("");
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.06] p-7 shadow-[0_32px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
        <span className="mono inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-teal-200">
          Secure transfer
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-[-0.06em] text-white sm:text-6xl">
          Share a file once. Burn the access code immediately after delivery.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Upload from your dashboard, get a unique 16-digit code, and let the receiver
          open the file without creating an account.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-sm leading-6 text-slate-300"
            >
              {feature}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-full bg-gradient-to-r from-orange-400 to-teal-300 px-6 py-3 font-semibold text-slate-950 transition hover:brightness-110"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/[0.12] px-6 py-3 font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase tracking-[0.32em] text-orange-200">
              Receiver access
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Enter a 16-digit code
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
            <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">No login</p>
            <p className="text-sm font-medium text-slate-200">Direct access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Access code
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="8473 1920 5567 8812"
              value={code}
              onChange={(event) => setCode(formatAccessCode(event.target.value))}
              className="mono w-full rounded-[24px] border border-white/[0.12] bg-white/5 px-5 py-4 text-lg tracking-[0.22em] text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300/60 focus:bg-white/[0.08]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[24px] bg-gradient-to-r from-orange-400 to-teal-300 px-5 py-4 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Accessing..." : "Access File"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-4 rounded-2xl border border-teal-300/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
            {success}
          </p>
        ) : null}

        <div className="mt-8 rounded-3xl border border-dashed border-white/[0.12] bg-white/5 p-5">
          <p className="text-sm leading-6 text-slate-300">
            The file is available only for the first successful access. After that, the
            code immediately becomes unusable.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
