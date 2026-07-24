"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../supabase.js");
const authStore_js_1 = require("../authStore.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
function toEmployeeProfile(u) {
    return { id: u.id, name: u.name, email: u.email, dept: u.dept, position: u.position, status: u.status, canCreateClients: u.canCreateClients };
}
function toClientProfile(u) {
    return { id: u.id, name: u.name, email: u.email, company: u.company, status: u.status };
}
router.get("/employees", auth_js_1.requireAuth, async (_req, res) => {
    const employees = await (0, authStore_js_1.listUsersByRole)("employee");
    return res.json(employees.map(toEmployeeProfile));
});
router.post("/employees", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, email, password, dept, position, canCreateClients } = req.body ?? {};
    if (!name || !email || !password || !dept || !position) {
        return res.status(400).json({ error: "name, email, password, dept, position are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, dept, position, role: "employee", canCreateClients: !!canCreateClients, createdBy: req.user.id });
        return res.status(201).json(toEmployeeProfile(user));
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
router.patch("/employees/:id/permission", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { canCreateClients } = req.body ?? {};
    if (typeof canCreateClients !== "boolean")
        return res.status(400).json({ error: "canCreateClients (boolean) is required" });
    const user = await (0, authStore_js_1.setCanCreateClients)(id, canCreateClients);
    if (!user)
        return res.status(404).json({ error: "Employee not found" });
    return res.json(toEmployeeProfile(user));
});
router.get("/clients", auth_js_1.requireAuth, async (_req, res) => {
    const clients = await (0, authStore_js_1.listUsersByRole)("client");
    return res.json(clients.map(toClientProfile));
});
router.post("/clients", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (req, res) => {
    const { name, email, password, company } = req.body ?? {};
    if (!name || !email || !password || !company) {
        return res.status(400).json({ error: "name, email, password, company are required" });
    }
    try {
        const user = await (0, authStore_js_1.createUser)({ name, email, password, company, role: "client", createdBy: req.user.id });
        return res.status(201).json(toClientProfile(user));
    }
    catch (err) {
        if (err instanceof authStore_js_1.EmailTakenError)
            return res.status(409).json({ error: err.message });
        return res.status(500).json({ error: err.message });
    }
});
router.get("/users", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    const users = await (0, authStore_js_1.listAllUsers)();
    return res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })));
});
router.get("/contact-submissions", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json([]);
    const { data, error } = await supabase_js_1.supabase.from("website_contact_submissions").select("*").order("created_at", { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
const tableMap = {
    services: "admin_services",
    projects: "admin_projects",
    invoices: "admin_invoices",
    notifications: "admin_notifications",
    blog: "admin_blog",
    portfolio: "admin_portfolio",
};
Object.entries(tableMap).forEach(([key, table]) => {
    router.get(`/${key}`, auth_js_1.requireAuth, (0, auth_js_1.requireRole)("admin"), async (_req, res) => {
        if (!supabase_js_1.supabase)
            return res.json([]);
        const { data, error } = await supabase_js_1.supabase.from(table).select("*");
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json(data);
    });
});
exports.default = router;
