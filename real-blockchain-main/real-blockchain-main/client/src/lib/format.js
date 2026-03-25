export const normalizeAccessCode = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 16);

export const formatAccessCode = (value = "") =>
  normalizeAccessCode(value).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const formatFileSize = (bytes = 0) => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const shortenHash = (value, start = 12, end = 8) => {
  if (!value) {
    return "Pending";
  }

  if (value.length <= start + end) {
    return value;
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

export const buildWalletAddress = (user) => {
  const seed = `${user?.id ?? ""}${user?.id ?? ""}${(user?.email ?? "")
    .toLowerCase()
    .replace(/[^a-f0-9]/g, "")}`;
  const address = `${seed}${"0".repeat(40)}`.slice(0, 40);

  return `0x${address}`;
};

const previewableMimeTypes = ["application/pdf", "application/json"];
const previewablePrefixes = ["image/", "video/", "audio/", "text/"];

const isPreviewable = (mimeType = "") =>
  previewableMimeTypes.includes(mimeType) ||
  previewablePrefixes.some((prefix) => mimeType.startsWith(prefix));

export const openDownloadedFile = (
  { blob, fileName, mimeType },
  previewWindow = null
) => {
  const objectUrl = URL.createObjectURL(blob);

  if (isPreviewable(mimeType)) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.replace(objectUrl);
    } else {
      const link = document.createElement("a");
      link.href = objectUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  } else {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
