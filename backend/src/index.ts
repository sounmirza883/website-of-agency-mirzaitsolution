import "dotenv/config";
import express from "express";
import cors from "cors";

import websiteRoutes from "./routes/website.js";
import adminRoutes from "./routes/admin.js";
import employeeRoutes from "./routes/employee.js";
import clientRoutes from "./routes/client.js";
import authRoutes from "./routes/auth.js";

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:8081",
  "https://agency.vesseldrop.com",
  "https://admin.vesseldrop.com",
  "https://client.vesseldrop.com",
  "https://employee.vesseldrop.com",
];
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "ok", service: "Mirza IT Solution API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/client", clientRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
