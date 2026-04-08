"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProtectedDemoRouter = createProtectedDemoRouter;
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const requireTeamMember_1 = require("../middleware/requireTeamMember");
const requireRole_1 = require("../middleware/requireRole");
function createProtectedDemoRouter(env) {
    const r = (0, express_1.Router)();
    const auth = (0, authenticate_1.authenticateMiddleware)(env);
    r.get('/teams/:teamId/protected/ping', auth, requireTeamMember_1.requireTeamMember, (0, requireRole_1.requireRole)(['coordinator']), (_req, res) => {
        res.json({ ok: true });
    });
    return r;
}
//# sourceMappingURL=protected.routes.js.map