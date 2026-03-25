import crypto from "node:crypto";
import fs from "node:fs/promises";
import { getStoredFilePath } from "./sendStoredFile.js";

export const hashStoredFile = async (file) => {
  const buffer = await fs.readFile(getStoredFilePath(file));

  return crypto.createHash("sha256").update(buffer).digest("hex");
};
