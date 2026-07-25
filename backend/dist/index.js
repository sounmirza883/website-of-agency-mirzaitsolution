"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const website_js_1 = __importDefault(require("./routes/website.js"));
const admin_js_1 = __importDefault(require("./routes/admin.js"));
const employee_js_1 = __importDefault(require("./routes/employee.js"));
const client_js_1 = __importDefault(require("./routes/client.js"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const app = (0, express_1.default)();
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
function isAllowedOrigin(origin) {
    if (!origin)
        return true; // non-browser clients (curl, native mobile) send no Origin
    return allowedOrigins.includes(origin) || localhostOrigin.test(origin);
}
app.use((0, cors_1.default)({ origin: (origin, cb) => cb(null, isAllowedOrigin(origin)) }));
app.use(express_1.default.json());
app.get("/", (_req, res) => res.json({ status: "ok", service: "Mirza IT Solution API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", auth_js_1.default);
app.use("/api/website", website_js_1.default);
app.use("/api/admin", admin_js_1.default);
app.use("/api/employee", employee_js_1.default);
app.use("/api/client", client_js_1.default);
// Last-resort error handler: turns a thrown/forwarded error into a 500 response
// rather than letting it escape as an unhandled rejection (which crashes Node).
// Must stay after the routes and keep all four params for Express to treat it as
// error-handling middleware.
app.use((err, _req, res, _next) => {
    console.error("Unhandled route error:", err);
    if (res.headersSent)
        return;
    res.status(500).json({ error: err.message || "Internal server error" });
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
exports.default = app;
