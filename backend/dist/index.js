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
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/website", website_js_1.default);
app.use("/api/admin", admin_js_1.default);
app.use("/api/employee", employee_js_1.default);
app.use("/api/client", client_js_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
