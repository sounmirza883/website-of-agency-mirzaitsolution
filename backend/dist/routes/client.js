"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../supabase.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const tableMap = {
    projects: "client_projects",
    milestones: "client_milestones",
    files: "client_files",
    invoices: "client_invoices",
    tickets: "client_tickets",
    messages: "client_messages",
};
Object.entries(tableMap).forEach(([key, table]) => {
    router.get(`/${key}`, auth_js_1.requireAuth, (0, auth_js_1.requireRole)("client"), async (req, res) => {
        if (!supabase_js_1.supabase)
            return res.json([]);
        const { data, error } = await supabase_js_1.supabase.from(table).select("*").eq("client_id", req.user.id);
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json(data);
    });
});
exports.default = router;
