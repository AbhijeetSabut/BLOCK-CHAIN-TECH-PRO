import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const inlineMimePrefixes = ["image/", "video/", "audio/", "text/"];
const inlineMimeTypes = new Set([
  "application/pdf",
  "application/json"
]);

const shouldPreviewInline = (mimeType = "") =>
  inlineMimePrefixes.some((prefix) => mimeType.startsWith(prefix)) ||
  inlineMimeTypes.has(mimeType);

export const getStoredFilePath = (file) =>
  path.join(config.uploadDir, file.storedName);

export const setStoredFileHeaders = (response, file) => {
  const mimeType = file.mimeType || "application/octet-stream";
  const disposition = shouldPreviewInline(mimeType) ? "inline" : "attachment";
  const encodedName = encodeURIComponent(file.originalName);

  response.setHeader("Content-Type", mimeType);
  response.setHeader(
    "Content-Disposition",
    `${disposition}; filename*=UTF-8''${encodedName}`
  );
  response.setHeader("X-File-Name", encodedName);
  response.setHeader("X-Mime-Type", mimeType);
};

export const sendStoredFile = (response, file) => {
  setStoredFileHeaders(response, file);

  fs.createReadStream(getStoredFilePath(file)).pipe(response);
};
