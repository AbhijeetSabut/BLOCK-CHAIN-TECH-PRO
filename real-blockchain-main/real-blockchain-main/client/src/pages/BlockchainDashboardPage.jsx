import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  deleteFile,
  downloadOwnerFile,
  fetchFiles,
  fetchLedger,
  uploadFile
} from "../lib/api.js";
import {
  buildWalletAddress,
  formatDateTime,
  formatFileSize,
  openDownloadedFile,
  shortenHash
} from "../lib/format.js";

const eventClassNames = {
  minted: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
  claimed: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  deleted: "border-rose-300/30 bg-rose-500/10 text-rose-100"
};

function HashTile({ label, value, onCopy }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-left transition hover:border-cyan-300/35"
    >
      <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-cyan-100">{shortenHash(value)}</p>
    </button>
  );
}

function BlockchainDashboardPage() {
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [meta, setMeta] = useState({
    enabled: false,
    mode: "simulated",
    networkName: "Local simulated ledger",
    chainId: null,
    contractAddress: null,
    relayerAddress: null,
    explorerBaseUrl: null
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyFileId, setBusyFileId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const walletAddress = meta.relayerAddress || buildWalletAddress(user);
  const modeLabel = meta.mode === "onchain" ? "On-chain" : "Simulated";
  const mintedCount = ledger.filter((event) => event.eventType === "minted").length;
  const claimedCount = ledger.filter((event) => event.eventType === "claimed").length;
  const latestBlockHeight = ledger[0]?.blockHeight ?? 0;

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const [filesData, ledgerData] = await Promise.all([
        fetchFiles(token),
        fetchLedger(token)
      ]);

      setFiles(filesData.files);
      setLedger(ledgerData.events);
      setMeta(
        ledgerData.meta ?? {
          enabled: false,
          mode: "simulated",
          networkName: "Local simulated ledger",
          chainId: null,
          contractAddress: null,
          relayerAddress: null,
          explorerBaseUrl: null
        }
      );
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
    void loadDashboard();

    const intervalId = window.setInterval(() => {
      void loadDashboard({ silent: true });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token]);

  const handleUpload = async (event) => {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Choose a file before anchoring it.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setNotice("");
      const data = await uploadFile(token, file);
      setFiles((currentFiles) => [data.file, ...currentFiles]);
      setNotice(`Asset anchored. Share code: ${data.file.formattedAccessCode}`);
      event.target.reset();
      await loadDashboard({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (value, label) => {
    if (!value) {
      setError(`${label} is not available yet.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
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
    if (!window.confirm("Remove this asset from the share network?")) {
      return;
    }

    try {
      setBusyFileId(fileId);
      setError("");
      await deleteFile(token, fileId);
      setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
      setNotice("Asset removed. A ledger event was recorded.");
      await loadDashboard({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyFileId("");
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(8,47,73,0.95),rgba(15,23,42,0.95)_48%,rgba(20,83,45,0.72))] p-7 shadow-[0_32px_120px_rgba(8,47,73,0.4)] sm:p-9">
          <p className="mono text-xs uppercase tracking-[0.32em] text-cyan-200">
            Blockchain Dashboard
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.05em] text-white">
            Track one-time shares as anchored delivery assets
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
            The delivery flow stays the same. Upload a file, share one code, let the
            first receiver claim it once, and record each step as a chain-style event.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Latest block
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">#{latestBlockHeight}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Active assets
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{files.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Claims finalized
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{claimedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mono text-xs uppercase tracking-[0.32em] text-emerald-200">
                Chain runtime
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{user?.name}</h2>
            </div>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
              {modeLabel}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Network
              </p>
              <p className="mt-2 text-sm font-medium text-cyan-100">
                {meta.networkName}
                {meta.chainId ? ` (${meta.chainId})` : ""}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Relayer wallet
              </p>
              <button
                type="button"
                onClick={() => handleCopy(walletAddress, "Relayer wallet")}
                className="mt-2 text-left text-sm font-medium text-cyan-100 transition hover:text-cyan-50"
              >
                {shortenHash(walletAddress, 16, 10)}
              </button>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Anchored shares
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{mintedCount}</p>
              <p className="mt-1 text-sm text-slate-300">
                Uploads logged as immutable mint events.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Contract
              </p>
              <button
                type="button"
                onClick={() => handleCopy(meta.contractAddress, "Contract address")}
                className="mt-2 text-left text-sm font-medium text-cyan-100 transition hover:text-cyan-50"
              >
                {shortenHash(meta.contractAddress, 14, 10)}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form
          onSubmit={handleUpload}
          className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mono text-xs uppercase tracking-[0.32em] text-orange-200">
                Anchor asset
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Upload into the delivery ledger
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
              <p className="mono text-xs uppercase tracking-[0.24em] text-slate-400">
                Capacity
              </p>
              <p className="text-sm font-medium text-slate-200">50 MB default</p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Choose file
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full rounded-2xl border border-dashed border-cyan-300/20 bg-cyan-500/5 px-4 py-5 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/15 file:px-4 file:py-2 file:font-medium file:text-cyan-50 hover:file:bg-cyan-300/25"
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Anchoring..." : "Anchor and Generate Code"}
          </button>
        </form>

        <section className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono text-xs uppercase tracking-[0.32em] text-slate-400">
                Immutable ledger
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Delivery event chain
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-slate-300">
              Syncing ledger...
            </div>
          ) : ledger.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/[0.12] bg-white/5 px-5 py-10 text-center text-slate-300">
              No ledger events recorded yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {ledger.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {event.originalName}
                    </h3>
                    <span
                      className={[
                        "mono inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em]",
                        eventClassNames[event.eventType]
                      ].join(" ")}
                    >
                      {event.eventLabel}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                        Block
                      </p>
                      <p className="mt-1 text-sm text-slate-100">#{event.blockHeight}</p>
                    </div>
                    <div>
                      <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                        Access code
                      </p>
                      <p className="mono mt-1 text-sm text-cyan-100">
                        {event.formattedAccessCode}
                      </p>
                    </div>
                    <div>
                      <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                        File size
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {formatFileSize(event.size)}
                      </p>
                    </div>
                    <div>
                      <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                        Recorded
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {event.chainMode === "onchain" ? event.networkName : "Local simulation"}
                    </span>
                    {event.explorerTransactionUrl ? (
                      <a
                        href={event.explorerTransactionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-200 transition hover:text-cyan-100"
                      >
                        View transaction
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-3">
                    <HashTile
                      label="Tx hash"
                      value={event.transactionHash}
                      onCopy={() => handleCopy(event.transactionHash, "Transaction hash")}
                    />
                    <HashTile
                      label="Block hash"
                      value={event.blockHash}
                      onCopy={() => handleCopy(event.blockHash, "Block hash")}
                    />
                    <HashTile
                      label="Integrity hash"
                      value={event.integrityHash}
                      onCopy={() => handleCopy(event.integrityHash, "Integrity hash")}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {notice}
        </p>
      ) : null}

      <section className="rounded-[34px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_32px_120px_rgba(2,6,23,0.52)] backdrop-blur-xl sm:p-9">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono text-xs uppercase tracking-[0.32em] text-slate-400">
              Active assets
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Live one-time delivery records
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            These disappear automatically after the first successful receiver claim.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-slate-300">
            Loading active assets...
          </div>
        ) : files.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/[0.12] bg-white/5 px-5 py-10 text-center text-slate-300">
            No active assets at the moment.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {files.map((file) => (
              <article
                key={file.id}
                className="rounded-[28px] border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(14,116,144,0.08),rgba(15,23,42,0.28),rgba(6,95,70,0.08))] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {file.originalName}
                      </h3>
                      <span className="mono inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                        anchored
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Access code
                        </p>
                        <p className="mono mt-1 text-sm text-cyan-100">
                          {file.formattedAccessCode}
                        </p>
                      </div>
                      <div>
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Ledger mode
                        </p>
                        <p className="mt-1 text-sm text-slate-100">
                          {file.chainMode === "onchain"
                            ? `On-chain #${file.chainBlockHeight ?? "pending"}`
                            : "Simulated"}
                        </p>
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
                          Expires
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatDateTime(file.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {file.chainNetworkName || meta.networkName}
                      </span>
                      {file.chainExplorerTransactionUrl ? (
                        <a
                          href={file.chainExplorerTransactionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-200 transition hover:text-cyan-100"
                        >
                          View mint transaction
                        </a>
                      ) : null}
                    </div>

                    <div className="grid gap-3 xl:grid-cols-3">
                      <HashTile
                        label="Integrity hash"
                        value={file.integrityHash}
                        onCopy={() => handleCopy(file.integrityHash, "Integrity hash")}
                      />
                      <HashTile
                        label="Mint tx"
                        value={file.chainTransactionHash}
                        onCopy={() =>
                          handleCopy(file.chainTransactionHash, "Mint transaction hash")
                        }
                      />
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                        <p className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          File size
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(file.accessCode, "Access code")}
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
                      Remove
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

export default BlockchainDashboardPage;
