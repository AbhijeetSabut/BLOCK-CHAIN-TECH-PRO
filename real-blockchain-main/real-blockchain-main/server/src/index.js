import fs from "node:fs";
import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config.js";

let server;

const startServer = async () => {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to server/.env before starting.");
  }

  fs.mkdirSync(config.uploadDir, { recursive: true });

  await mongoose.connect(config.mongoUri);

  server = app.listen(config.port, () => {
    console.log(`API server listening on http://localhost:${config.port}`);
  });
};

const shutdown = async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await mongoose.connection.close();
};

startServer().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
