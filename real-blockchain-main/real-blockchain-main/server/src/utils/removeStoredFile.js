import fs from "node:fs/promises";
import { getStoredFilePath } from "./sendStoredFile.js";

export const removeStoredFile = async (file) => {
  await fs.unlink(getStoredFilePath(file)).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
};
