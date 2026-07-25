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
  "https://agency.vesseldrop.com",
  "https://admin.vesseldrop.com",
  "https://client.vesseldrop.com",
  "https://employee.vesseldrop.com",
];

// Any localhost/127.0.0.1 port, since dev servers pick whatever port is free
// (Next.js 3000-3003, Expo web 8081 then 8082+ when taken). Safe to allow
// broadly here because auth is Bearer-token only — no cookies, so a page on
// another localhost port still can't read a token it doesn't have.
const localhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // non-browser clients (curl, native mobile) send no Origin
  return allowedOrigins.includes(origin) || localhostOrigin.test(origin);
}

app.use(cors({ origin: (origin, cb) => cb(null, isAllowedOrigin(origin)) }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "ok", service: "Mirza IT Solution API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/client", clientRoutes);

// Last-resort error handler: turns a thrown/forwarded error into a 500 response
// rather than letting it escape as an unhandled rejection (which crashes Node).
// Must stay after the routes and keep all four params for Express to treat it as
// error-handling middleware.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled route error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
