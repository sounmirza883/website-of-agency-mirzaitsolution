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
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "https://agency.vesseldrop.com",
    "https://admin.vesseldrop.com",
    "https://client.vesseldrop.com",
    "https://employee.vesseldrop.com",
];
app.use((0, cors_1.default)({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express_1.default.json());
app.get("/", (_req, res) => res.json({ status: "ok", service: "Mirza IT Solution API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", auth_js_1.default);
app.use("/api/website", website_js_1.default);
app.use("/api/admin", admin_js_1.default);
app.use("/api/employee", employee_js_1.default);
app.use("/api/client", client_js_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
exports.default = app;
