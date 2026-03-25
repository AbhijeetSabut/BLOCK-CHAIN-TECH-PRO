import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  deleteFile,
  downloadOwnerFile,
  fetchFiles,
  uploadFile
} from "../lib/api.js";
import {
  formatDateTime,
  formatFileSize,
  openDownloadedFile
} from "../lib/format.js";

const statusClassNames = {
  unused: "border-teal-300/30 bg-teal-400/10 text-teal-100",
  used: "border-orange-300/30 bg-orange-400/10 text-orange-100",
  expired: "border-rose-400/30 bg-rose-500/10 text-rose-100"
};

function DashboardPage() {
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyFileId, setBusyFileId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadFiles = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data = await fetchFiles(token);
      setFiles(data.files);
      setError("");
    } catch (requestError) {
      if (!silent) {
        setError(requestError.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadFiles();

    const intervalId = window.setInterval(() => {
      void loadFiles({ silent: true });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token]);

  const handleUpload = async (event) => {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Choose a file before uploading.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setNotice("");
      const data = await uploadFile(token, file);
      setFiles((currentFiles) => [data.file, ...currentFiles]);
      setNotice(`Upload complete. Share code: ${data.file.formattedAccessCode}`);
      event.target.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (accessCode) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setNotice("Access code copied to clipboard.");
      setError("");
    } catch (_error) {
      setError("Clipboard access was blocked by the browser.");
    }
  };

  const handleDownload = async (fileId) => {
    try {
      setBusyFileId(fileId);
      setError("");
      const file = await downloadOwnerFile(token, fileId);
      openDownloadedFile(file);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyFileId("");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Delete this file from the server?")) {
      return;
    }

    try {
      setBusyFileId(fileId);
      setError("");
      await deleteFile(token, fileId);
      setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
      setNotice("File deleted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyFileId("");
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[34px] border border-white/10 bg-white/[0.06] p-7 shadow-[0_32px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-9">
          <p className="mono text-xs uppercase tracking-[0.32em] text-teal-200">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">
            {user?.name}, upload a file and issue a single-use code
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Each file stays here until the first receiver opens it. After delivery, the
            share is removed automatically and the code cannot be reused.
          </p>
        </div>

        <form
          onSubmit={handleUpload}
          className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mono text-xs uppercase tracking-[0.32em] text-orange-200">
                Upload file
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Add a new share</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">Limit</p>
              <p className="text-sm font-medium text-slate-200">50 MB default</p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Choose file</span>
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full rounded-2xl border border-dashed border-white/[0.15] bg-white/5 px-4 py-5 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-medium file:text-slate-100 hover:file:bg-white/20"
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-teal-300 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Uploading..." : "Upload and Generate Code"}
          </button>
        </form>
      </section>

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl border border-teal-300/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
          {notice}
        </p>
      ) : null}

      <section className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono text-xs uppercase tracking-[0.32em] text-slate-400">My files</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Generated codes</h2>
          </div>
          <button
            type="button"
            onClick={loadFiles}
            className="rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-slate-300">
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/[0.12] bg-white/5 px-5 py-10 text-center text-slate-300">
            No files uploaded yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {files.map((file) => (
              <article
                key={file.id}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{file.originalName}</h3>
                      <span
                        className={[
                          "mono inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em]",
                          statusClassNames[file.status] || statusClassNames.expired
                        ].join(" ")}
                      >
                        {file.status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Access code
                        </p>
                        <p className="mono mt-1 text-sm text-teal-100">
                          {file.formattedAccessCode}
                        </p>
                      </div>
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          File size
                        </p>
                        <p className="mt-1 text-sm text-slate-200">{formatFileSize(file.size)}</p>
                      </div>
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Uploaded
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatDateTime(file.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Last access
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatDateTime(file.lastAccessedAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400">
                      Expires: {formatDateTime(file.expiresAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(file.accessCode)}
                      className="rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      Copy code
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(file.id)}
                      disabled={busyFileId === file.id}
                      className="rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyFileId === file.id ? "Working..." : "Open file"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      disabled={busyFileId === file.id}
                      className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
