import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import accessRoutes from "./routes/accessRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    exposedHeaders: ["X-File-Name", "X-Mime-Type"]
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    uptime: process.uptime()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/access", accessRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
