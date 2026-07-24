import "dotenv/config";
import express from "express";
import cors from "cors";

import websiteRoutes from "./routes/website.js";
import adminRoutes from "./routes/admin.js";
import employeeRoutes from "./routes/employee.js";
import clientRoutes from "./routes/client.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/website", websiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/client", clientRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
