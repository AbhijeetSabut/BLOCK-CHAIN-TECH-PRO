import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { config } from "../config.js";

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    callback(null, config.uploadDir);
  },
  filename(_request, file, callback) {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024
  }
});
