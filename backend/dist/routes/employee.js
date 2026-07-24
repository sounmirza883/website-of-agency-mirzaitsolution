"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../supabase.js");
const authStore_js_1 = require("../authStore.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    const clients = await (0, authStore_js_1.listUsersByRole)("client", req.user.id);
    return res.json(clients.map((c) => ({ id: c.id, name: c.name, email: c.email, company: c.company, status: c.status })));
});
router.post("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
    if (!req.user.canCreateClients)
        return res.status(403).json({ error: "You don't have permission to create clients. Ask an admin to enable it." });
    const { name, email, password, company } = req.body ?? {};
    if (!name || !email || !password || !company) {
        return res.status(400).json({ error: "name, email, password, company are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, company, role: "client", createdBy: req.user.id });
        return res.status(201).json({ id: user.id, name: user.name, email: user.email, company: user.company, status: user.status });
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
const tableMap = {
    "assigned-projects": "employee_assigned_projects",
    tasks: "employee_tasks",
    files: "employee_files",
    "status-updates": "employee_status_updates",
    attendance: "employee_attendance",
    "leave-requests": "employee_leave_requests",
};
Object.entries(tableMap).forEach(([key, table]) => {
    router.get(`/${key}`, auth_js_1.requireAuth, (0, auth_js_1.requireRole)("employee"), async (req, res) => {
        if (!supabase_js_1.supabase)
            return res.json([]);
        const { data, error } = await supabase_js_1.supabase.from(table).select("*").eq("employee_id", req.user.id);
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json(data);
    });
});
exports.default = router;
